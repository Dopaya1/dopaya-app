import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
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
    const res = await fetch(url, {
      credentials: "include",
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
