import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export function SupabaseTest() {
  const [result, setResult] = useState<string>('Not tested yet');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test 1: Basic connection
      console.log('Test 1: Basic Supabase client creation');
      
      // Test 2: Simple table query
      console.log('Test 2: Querying projects table');
      const { data, error, status, statusText } = await supabase
        .from('projects')
        .select('id, title')
        .limit(5);
      
      console.log('Response status:', status);
      console.log('Response statusText:', statusText);
      console.log('Response data:', data);
      console.log('Response error:', error);
      
      if (error) {
        setResult(`❌ Error: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}\nHint: ${error.hint}`);
      } else {
        setResult(`✅ Success!\nFound ${data?.length || 0} projects\nData: ${JSON.stringify(data, null, 2)}`);
      }
      
    } catch (err) {
      console.error('Caught error:', err);
      setResult(`❌ Caught Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4">🔧 Supabase Connection Test</h3>
      
      <Button 
        onClick={testConnection} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </Button>
      
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
}