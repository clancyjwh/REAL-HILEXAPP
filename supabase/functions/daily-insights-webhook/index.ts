import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DailyInsightPayload {
  run_date: string;
  top_mover: string;
  strongest_signals: string[];
  assets_to_watch: string[];
  weekly_winners: string[];
  weekly_laggers: string[];
  consensus_signals: string[];
  rare_events?: string[];
  raw_payload?: unknown;
}

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const payload: DailyInsightPayload = await req.json();

      const {
        run_date,
        top_mover,
        strongest_signals,
        assets_to_watch,
        weekly_winners,
        weekly_laggers,
        consensus_signals,
        rare_events,
        raw_payload,
      } = payload;

      if (!run_date || !top_mover) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: run_date and top_mover are required',
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

      const { data, error } = await supabase
        .from('daily_insights')
        .upsert({
          run_date,
          top_mover,
          strongest_signals: strongest_signals || [],
          assets_to_watch: assets_to_watch || [],
          weekly_winners: weekly_winners || [],
          weekly_laggers: weekly_laggers || [],
          consensus_signals: consensus_signals || [],
          rare_events: rare_events || [],
          raw_payload: raw_payload || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'run_date',
        })
        .select();

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
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

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) {
        console.error('Error fetching users:', usersError.message);
      }

      let notificationsCreated = 0;
      if (users && users.length > 0) {
        const notifications = users.map(user => ({
          user_id: user.id,
          type: 'daily_insights',
          title: 'Daily Insights Available!',
          message: `Top Mover: ${top_mover}`,
          link: '/daily-insights',
          is_read: false,
          created_at: new Date().toISOString(),
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error creating notifications:', notificationError.message);
        } else {
          notificationsCreated = notifications.length;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: data[0],
          message: 'Daily insight saved successfully',
          notifications_created: notificationsCreated,
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
          message: 'Daily Insights Webhook',
          version: '2.0',
          description: 'Receives structured daily market insights and creates notifications',
          usage: {
            endpoint: 'POST /daily-insights-webhook',
            required_fields: {
              run_date: 'Date in YYYY-MM-DD format',
              top_mover: 'Top performing asset',
              strongest_signals: 'Array of strongest signals',
              assets_to_watch: 'Array of assets to watch',
              weekly_winners: 'Array of weekly winners',
              weekly_laggers: 'Array of weekly laggards',
              consensus_signals: 'Array of consensus signals',
              rare_events: 'Array of rare events (optional)',
              raw_payload: 'Raw data object (optional)',
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
