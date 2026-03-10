const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SignupPayload {
  full_name: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method === 'POST') {
      const payload: SignupPayload = await req.json();

      const { full_name, email } = payload;

      if (!full_name || !email) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: full_name and email are required',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Send to Make webhook
      const makeWebhookUrl = 'https://hook.us2.make.com/q8u6v2e2d22r1o8541pi8cf5bcgjd3ja';

      const webhookResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name,
          email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Signup notification sent successfully',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'Signup Notification Webhook',
          version: '1.0',
          description: 'Sends signup notifications to Make webhook',
          usage: {
            endpoint: 'POST /signup-webhook',
            required_fields: {
              full_name: 'User full name',
              email: 'User email address',
            },
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});