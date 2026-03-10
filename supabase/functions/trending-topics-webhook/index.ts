import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Story {
  Headline: string;
  Summary: string;
  Link: string;
}

interface IncomingPayload {
  last_checked_at?: string;
  stories?: Story[];
}

function extractSource(link: string): string {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('coindesk.com')) return 'Coindesk';
    if (hostname.includes('tradingeconomics.com')) return 'Trading Economics';
    if (hostname.includes('investing.com')) return 'Investing.com';
    if (hostname.includes('reuters.com')) {
      if (link.includes('currency') || link.includes('forex')) return 'Reuters Currency Market';
      return 'Reuters';
    }
    if (hostname.includes('forexcalendar.com')) return 'Forex Calendar';
    if (hostname.includes('cnbc.com')) return 'CNBC';
    if (hostname.includes('apnews.com')) return 'AP News';

    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function isValidNewsStory(headline: string, summary: string): boolean {
  const text = `${headline} ${summary}`.toLowerCase();

  const invalidPatterns = [
    'trading economics offers',
    'trading economics provides',
    'million indicators',
    'data on indicators',
    'offers data on',
    'provides data',
    'indicators from',
    'historical data',
    'latest global stock market',
    'rates and bonds market',
    'calendar update and upcoming events',
  ];

  return !invalidPatterns.some(pattern => text.includes(pattern));
}

function stripHtml(html: string): string {
  if (!html) return '';

  let text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z]+;/g, '')
    .replace(/&#\d+;/g, '');

  return text.replace(/\s+/g, ' ').trim();
}

function isValidText(text: string): boolean {
  if (!text) return false;

  const cleaned = stripHtml(text);

  if (cleaned.length < 10) return false;

  if (text.includes('<img') || text.includes('src=') || text.includes('<div>')) {
    return false;
  }

  const htmlTagPattern = /<[^>]+>/;
  if (htmlTagPattern.test(cleaned)) {
    return false;
  }

  return true;
}

function fixGrammar(text: string): string {
  let fixed = stripHtml(text.trim());

  if (fixed.length === 0) return fixed;

  fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);

  fixed = fixed.replace(/\s+/g, ' ');

  if (!/[.!?]$/.test(fixed) && fixed.split(' ').length > 3) {
    fixed += '.';
  }

  return fixed;
}

function categorizeStory(headline: string, summary: string): string {
  const text = `${headline} ${summary}`.toLowerCase();

  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'blockchain', 'altcoin', 'defi', 'nft', 'token', 'coin', 'binance', 'coinbase', 'chainlink', 'solana', 'ripple', 'xrp', 'dogecoin', 'cardano'];
  if (cryptoKeywords.some(keyword => text.includes(keyword))) return 'Crypto';

  const stockKeywords = ['stock', 'nasdaq', 'dow jones', 'nyse', 's&p 500', 'shares', 'equity', 'wall street', 'apple', 'tesla', 'nvidia', 'microsoft', 'amazon', 'google', 'meta'];
  if (stockKeywords.some(keyword => text.includes(keyword))) return 'Stocks';

  const forexKeywords = ['forex', 'currency', 'dollar', 'euro', 'yen', 'pound', 'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'exchange rate', 'fx'];
  if (forexKeywords.some(keyword => text.includes(keyword))) return 'Forex';

  const commodityKeywords = ['gold', 'silver', 'oil', 'crude', 'commodity', 'wheat', 'natural gas', 'copper', 'platinum', 'brent', 'wti', 'heating oil'];
  if (commodityKeywords.some(keyword => text.includes(keyword))) return 'Commodities';

  return 'General';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      let rawBody = await req.text();
      let payload: IncomingPayload;
      let parsedData: any;

      try {
        if (rawBody.includes('```json') || rawBody.includes('```')) {
          rawBody = rawBody.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

        parsedData = JSON.parse(rawBody);

        while (typeof parsedData === 'string') {
          if (parsedData.includes('```json') || parsedData.includes('```')) {
            parsedData = parsedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          }
          parsedData = JSON.parse(parsedData);
        }

        payload = parsedData;
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON format',
            details: e.message,
            rawBody: rawBody.substring(0, 500)
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

      let stories: Story[] = [];

      if (Array.isArray(parsedData)) {
        stories = parsedData;
      } else if (payload.stories && Array.isArray(payload.stories)) {
        stories = payload.stories;
      } else if (parsedData.Headline && parsedData.Summary && parsedData.Link) {
        stories = [parsedData];
      }

      if (stories.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'No stories provided',
            received: payload,
            receivedType: typeof payload,
            isArray: Array.isArray(parsedData)
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

      const lastCheckedAt = payload.last_checked_at || new Date().toISOString();

      const validStories = stories.filter((story: Story) =>
        isValidNewsStory(story.Headline, story.Summary) &&
        isValidText(story.Headline) &&
        isValidText(story.Summary)
      );

      if (validStories.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            count: 0,
            message: 'All stories filtered out as invalid news content',
            filtered: stories.length
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

      const { data: mostRecentStory } = await supabase
        .from('top_stories')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const now = new Date();
      const isNewBatch = !mostRecentStory ||
        (now.getTime() - new Date(mostRecentStory.created_at).getTime()) > 120000;

      if (isNewBatch) {
        const { error: deleteError } = await supabase
          .from('top_stories')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to clear old stories: ' + deleteError.message }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      const storiesToInsert = validStories.map((story: Story) => {
        const source = extractSource(story.Link);
        const category = categorizeStory(story.Headline, story.Summary);

        return {
          headline: fixGrammar(story.Headline),
          summary: fixGrammar(story.Summary),
          link: story.Link,
          source,
          category,
          published_at: lastCheckedAt,
          created_at: new Date().toISOString(),
        };
      });

      const { data, error } = await supabase
        .from('top_stories')
        .insert(storiesToInsert)
        .select();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: data.length,
          stories: data,
          isNewBatch,
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
          message: 'Top Stories Webhook',
          usage: {
            endpoint: 'POST /trending-topics-webhook',
            description: 'Send top news stories with headlines, descriptions, and links',
            example: [
              {
                "Headline": "Example headline",
                "Summary": "Example description",
                "Link": "https://www.coindesk.com/example"
              }
            ]
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