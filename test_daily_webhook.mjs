const WEBHOOK_URL = 'https://avijzlkdukanneylvtrd.supabase.co/functions/v1/asset-daily-analysis-webhook';

const testPayload = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  'JSON 1': JSON.stringify({
    asset: 'AAPL',
    Price: '150.25',
    'Cumulative Signal': '8.5',
    RSI: '65.2',
    MACD: '1.25'
  }),
  'JSON 8': JSON.stringify({
    sentiment: 'bullish',
    news_count: 15,
    summary: 'Apple showing strong momentum'
  }),
  'JSON 9': JSON.stringify({
    Analysis: 'Strong Buy',
    horizon_30d: '+5.2%',
    horizon_90d: '+12.8%'
  }),
  'Relative Value': JSON.stringify({
    percentile: 85,
    vs_sector: 'Outperforming',
    valuation: 'Fair'
  })
};

console.log('Testing Asset Daily Analysis Webhook...');
console.log('URL:', WEBHOOK_URL);
console.log('\nPayload:');
console.log(JSON.stringify(testPayload, null, 2));

try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload)
  });

  console.log('\n--- Response ---');
  console.log('Status:', response.status, response.statusText);

  const responseText = await response.text();
  console.log('Body:', responseText);

  if (response.ok) {
    console.log('\n✅ SUCCESS: Data should be in the database now');
  } else {
    console.log('\n❌ FAILED: Check the error message above');
  }
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
}
