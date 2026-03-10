import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

const payload = {
  "bias": "upside_tilt",
  "symbol": "DPRO",
  "Summary": "DPRO is likely to drift up with moderate confidence based on 80 similar past cases. The expected move over the next 5 minutes is about 0.26%. The model sees a clear tilt toward upward movement.",
  "direction": "up",
  "spot price": "7.69",
  "top strikes": "{\"type\":\"call\",\"strike\":10,\"volume\":1343,\"popularity\":0.73,\"open_interest\":4237}, {\"type\":\"call\",\"strike\":10,\"volume\":263,\"popularity\":0.595,\"open_interest\":8568}, {\"type\":\"put\",\"strike\":5,\"volume\":1285,\"popularity\":0.538,\"open_interest\":1306}, {\"type\":\"put\",\"strike\":7.5,\"volume\":1390,\"popularity\":0.536,\"open_interest\":610}, {\"type\":\"call\",\"strike\":7.5,\"volume\":88,\"popularity\":0.509,\"open_interest\":8180}",
  "probability up": "0.575",
  "put wall strike": "5",
  "call wall strike": "10",
  "confidence label": "moderate",
  "confidence score": "0.19999999999999996",
  "probability down": "0.375",
  "scenarios tested": "80",
  "put wall distance": "-34.98",
  "call wall distance": "30.04",
  "expected move next 5 minutes": "0.259572690459988",
  "average historical move percent": "0.259572690459988"
};

console.log('Sending zero day options data with strike prices to webhook...\n');
console.log('Payload:', JSON.stringify(payload, null, 2), '\n');

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/zero-day-options-webhook?horizon=5`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✓ Successfully saved zero day options result!');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('\nResult ID:', result.id);
    console.log('View result at: /tools/zero-day-options/result?id=' + result.id);
    console.log('View strike prices at: /tools/zero-day-options/strike-prices?id=' + result.id);
  } else {
    console.error('✗ Error saving zero day options result');
    console.error('Response:', JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error('✗ Failed to save zero day options result:', error.message);
}
