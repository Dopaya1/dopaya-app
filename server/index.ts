// Load .env file FIRST before any other imports
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of this file and resolve .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

// Load .env synchronously before any other imports
config({ path: envPath });

// Log environment variable loading status IMMEDIATELY after config()
// This runs before any other imports to verify env vars are loaded
console.log('\n[server/index.ts] ========== ENV LOADING CHECK ==========');
console.log('[server/index.ts] .env file path:', envPath);

// Validate Supabase keys (show first 6 chars + length for verification without leaking)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[server/index.ts] VITE_SUPABASE_URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 6)}...${supabaseUrl.length} chars)` : '❌ MISSING');
console.log('[server/index.ts] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ Set (${supabaseAnonKey.substring(0, 6)}...${supabaseAnonKey.length} chars)` : '❌ MISSING');
console.log('[server/index.ts] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `✅ Set (${supabaseServiceKey.substring(0, 6)}...${supabaseServiceKey.length} chars)` : '❌ MISSING');
console.log('[server/index.ts] DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ MISSING');
console.log('[server/index.ts] =========================================\n');

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase, createDatabaseHelperFunctions } from "./setup-db";
import { createDatabaseSchema } from "./direct-schema-setup";

const app = express();

// CRITICAL: Add logging middleware FIRST, before any other middleware
// Request logging middleware (can be removed in production if needed)
app.use((req, res, next) => {
  // Only log API routes to reduce noise
  if (req.path.startsWith('/api')) {
    console.log(`[index.ts:32] ${req.method} ${req.path}`);
  }
  next();
});

// IMPORTANT: Register Stripe webhook BEFORE express.json()
// Stripe needs the raw body for signature verification
app.post("/api/stripe/webhook", 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    // Import stripe handler dynamically to avoid circular dependency
    const { handleStripeWebhook } = await import("./stripe-routes.js");
    return handleStripeWebhook(req, res);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    // Validate JSON before sending
    try {
      // Handle undefined and null values
      if (bodyJson === undefined) {
        console.warn('Warning: undefined response body, converting to null');
        bodyJson = null;
      }
      
      // Test JSON serialization
      const testJson = JSON.stringify(bodyJson);
      capturedJsonResponse = bodyJson;
    } catch (error) {
      console.error('JSON serialization error:', error);
      capturedJsonResponse = { error: 'Response serialization failed' };
      return originalResJson.apply(res, [{ error: 'Internal server error' }, ...args]);
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse !== undefined) {
        try {
          // Handle null and undefined values safely
          if (capturedJsonResponse === null) {
            logLine += ` :: null`;
          } else {
            // Safely stringify and truncate large responses
            const jsonStr = JSON.stringify(capturedJsonResponse);
            if (jsonStr.length > 200) {
              logLine += ` :: ${jsonStr.slice(0, 50)}...`;
            } else {
              logLine += ` :: ${jsonStr}`;
            }
          }
        } catch (error) {
          logLine += ` :: [Response serialization error]`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // ============================================
  // DATABASE SCHEMA INITIALIZATION DISABLED
  // ============================================
  // Schema is managed in Supabase dashboard - do NOT initialize here
  // Automatic schema initialization causes:
  // - Failed migrations (Drizzle migration errors)
  // - Missing function errors (exec_sql not found)
  // - Server in broken state
  // - Interference with donation operations
  //
  // If schema setup is needed, use:
  // - Supabase dashboard (recommended)
  // - POST /api/system/setup-db endpoint (manual, for emergencies only)
  // ============================================
  
  console.log('✅ Server starting - connecting to Supabase (schema managed externally)');
  
  // Register routes FIRST (API routes with auth)
  const server = await registerRoutes(app);
  
  // Add social media bot handler AFTER routes but BEFORE Vite
  // This ensures API routes are registered first, and social meta only processes non-API routes
  const { socialMetaMiddleware } = await import('./social-meta-middleware');
  app.use(socialMetaMiddleware);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error details (but not full stack traces in production)
    console.error('[ERROR HANDLER]', {
      status,
      message,
      path: _req.path
    });
    
    // Handle JSON parsing errors specifically
    if (err.type === 'entity.parse.failed' || err.message?.includes('JSON')) {
      console.error('JSON parsing error in request:', err);
      return res.status(400).json({ 
        error: 'Invalid JSON in request body',
        message: 'Request body must be valid JSON' 
      });
    }

    // Never expose full error details in response - only log them
    res.status(status).json({ message });
    throw err;
  });

  // Add global error handlers
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const nodeEnv = process.env.NODE_ENV || "development";
  const appEnv = app.get("env");
  console.log(`[server/index.ts] Environment check: NODE_ENV=${nodeEnv}, app.get("env")=${appEnv}`);
  
  if (appEnv === "development" || nodeEnv === "development") {
    console.log('[server/index.ts] ✅ Running in DEVELOPMENT mode - using Vite dev server');
    await setupVite(app, server);
  } else {
    console.log('[server/index.ts] ⚠️ Running in PRODUCTION mode - serving static files from dist');
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 3001;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
