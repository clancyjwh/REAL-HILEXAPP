export function verifyWebhookAuth(req: Request): { authorized: boolean; error?: string } {
  const apiKey = req.headers.get('x-api-key');
  const webhookSecret = Deno.env.get('WEBHOOK_API_KEY');

  if (!webhookSecret) {
    console.error('WEBHOOK_API_KEY not configured');
    return { authorized: false, error: 'Authentication error' };
  }

  if (!apiKey) {
    return { authorized: false, error: 'Authentication required' };
  }

  if (apiKey !== webhookSecret) {
    return { authorized: false, error: 'Authentication failed' };
  }

  return { authorized: true };
}

export function createUnauthorizedResponse(error: string, corsHeaders: Record<string, string>): Response {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  const safeError = isDevelopment ? error : 'Unauthorized';

  return new Response(
    JSON.stringify({ error: safeError }),
    {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function createErrorResponse(message: string, status: number, corsHeaders: Record<string, string>): Response {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  const safeMessage = isDevelopment ? message : 'An error occurred';

  return new Response(
    JSON.stringify({ error: safeMessage }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !data[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}
