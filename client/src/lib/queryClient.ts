import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Get Supabase session token for Authorization header
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  extraOptions?: RequestInit
): Promise<Response> {
  let requestBody: string | undefined;
  
  if (data !== undefined) {
    try {
      requestBody = JSON.stringify(data);
    } catch (error) {
      console.error('JSON stringify error in apiRequest:', error);
      const message = error instanceof Error ? error.message : 'Unknown stringify error';
      throw new Error(`Cannot serialize request data: ${message}`);
    }
  }

  // Get auth token for Supabase
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: requestBody,
    credentials: "include", // Always include credentials for cookies
    ...extraOptions
  });

  // Log for debugging
  console.log(`API ${method} request to ${url}: ${res.status} ${res.statusText}`);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Get auth token for Supabase
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });
    
    // Log for debugging
    console.log(`API GET request to ${url}: ${res.status} ${res.statusText}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('Returning null due to 401 status (unauthorized)');
      return null;
    }

    await throwIfResNotOk(res);
    
    // Handle empty responses safely
    const text = await res.text();
    if (!text || text.trim() === '') {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON parsing error in query client:', error, 'Response text:', text);
      const message = error instanceof Error ? error.message : 'Unknown parsing error';
      throw new Error(`Invalid JSON response from ${url}: ${message}`);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use returnNull to avoid throwing errors on authentication endpoints
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
