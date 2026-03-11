import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

import { verifyWebhookAuth } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const auth = verifyWebhookAuth(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ success: false, error: auth.error }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const payload = await req.json();

    console.log('Received event forecasting examples webhook payload:', JSON.stringify(payload, null, 2));

    if (!payload.questions || !Array.isArray(payload.questions) || payload.questions.length < 1 || payload.questions.length > 10) {
      return new Response(
        JSON.stringify({
          error: 'Invalid payload',
          message: 'Payload must contain an array of 1 to 10 questions'
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const batchId = crypto.randomUUID();
    const numNewQuestions = payload.questions.length;

    const { data: oldestQuestions, error: fetchError } = await supabase
      .from('event_forecasting_examples')
      .select('id')
      .eq('active', true)
      .order('created_at', { ascending: true })
      .limit(numNewQuestions);

    if (fetchError) {
      console.error('Error fetching oldest questions:', fetchError);
      throw fetchError;
    }

    if (oldestQuestions && oldestQuestions.length > 0) {
      const idsToDelete = oldestQuestions.map(q => q.id);

      const { error: deleteError } = await supabase
        .from('event_forecasting_examples')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting oldest questions:', deleteError);
        throw deleteError;
      }

      console.log(`Deleted ${idsToDelete.length} oldest questions`);
    }

    const newExamples = payload.questions.map((question: string) => ({
      question,
      active: true,
      batch_id: batchId,
    }));

    const { data, error: insertError } = await supabase
      .from('event_forecasting_examples')
      .insert(newExamples)
      .select();

    if (insertError) {
      console.error('Error inserting new examples:', insertError);
      throw insertError;
    }

    console.log(`Successfully replaced ${numNewQuestions} questions with new examples:`, data);

    return new Response(
      JSON.stringify({ success: true, data, batch_id: batchId }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
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