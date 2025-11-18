#!/usr/bin/env tsx
/**
 * Local testing script for Vercel serverless functions
 * 
 * Usage:
 *   npm run test:serverless
 *   or
 *   tsx scripts/test-serverless-local.ts
 * 
 * This allows testing serverless functions locally before deploying
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local if it exists
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
} catch (error) {
  console.log('⚠️  No .env.local file found, using system environment variables');
}

// Mock Vercel request/response objects
function createMockRequest(method: string = 'GET', authToken?: string): any {
  return {
    method,
    headers: {
      authorization: authToken ? `Bearer ${authToken}` : undefined,
    },
    query: {},
    body: {},
  };
}

function createMockResponse(): any {
  const res: any = {
    statusCode: 200,
    headers: {},
    body: null,
  };
  
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  
  res.json = (data: any) => {
    res.body = data;
    res.headers['content-type'] = 'application/json';
    return res;
  };
  
  res.send = (data: any) => {
    res.body = data;
    return res;
  };
  
  return res;
}

// Test function
async function testServerlessFunction(
  functionPath: string,
  functionName: string,
  authToken?: string
) {
  console.log(`\n🧪 Testing ${functionName}...`);
  console.log('─'.repeat(50));
  
  try {
    // Dynamic import of the serverless function
    const module = await import(functionPath);
    const handler = module.default;
    
    if (typeof handler !== 'function') {
      console.error(`❌ ${functionName} does not export a default function`);
      return false;
    }
    
    const req = createMockRequest('GET', authToken);
    const res = createMockResponse();
    
    await handler(req, res);
    
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response:`, JSON.stringify(res.body, null, 2));
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ ${functionName} passed`);
      return true;
    } else {
      console.log(`❌ ${functionName} failed with status ${res.statusCode}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ${functionName} error:`, error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting local serverless function tests\n');
  console.log('Environment check:');
  console.log(`  SUPABASE_URL: ${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  
  // Check if we have a test auth token
  const testAuthToken = process.env.TEST_AUTH_TOKEN;
  if (!testAuthToken) {
    console.log('\n⚠️  No TEST_AUTH_TOKEN set - functions will test without authentication');
    console.log('   Set TEST_AUTH_TOKEN in .env.local to test authenticated endpoints');
  }
  
  const results: boolean[] = [];
  
  // Test each function
  results.push(await testServerlessFunction(
    '../api/user/impact.ts',
    '/api/user/impact',
    testAuthToken
  ));
  
  results.push(await testServerlessFunction(
    '../api/user/impact-history.ts',
    '/api/user/impact-history',
    testAuthToken
  ));
  
  results.push(await testServerlessFunction(
    '../api/user/supported-projects.ts',
    '/api/user/supported-projects',
    testAuthToken
  ));
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`  Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

