import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

const payload = {
  questions: [
    "Will Tesla stock hit $500 by end of Q1?",
    "Will the Fed cut rates in January?",
    "Will the Lakers make the playoffs?",
    "Will AI regulation pass in the EU this quarter?",
    "Will oil prices exceed $100/barrel this month?"
  ]
};

console.log('Sending new example questions to webhook...\n');
console.log('Questions:', JSON.stringify(payload, null, 2), '\n');

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/event-forecasting-examples-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✓ Successfully updated examples!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } else {
    console.error('✗ Error updating examples');
    console.error('Response:', JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error('✗ Failed to update examples:', error.message);
}
