// Simple edge function for basic health check
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (url.pathname === '/make-server-a54671ae/health') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Imtehaan API is running' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }

  // Default response
  return new Response(
    JSON.stringify({ message: 'Imtehaan API - Service is running' }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
});