// Test script for Blackheath advertiser tracking webhook

const testPayload = {
  user_name: "John Smith",
  user_id: "test_user_123",
  timestamp: new Date().toISOString(),
  event_id: crypto.randomUUID(),
  element_clicked: "AdvertiserBanner:Blackheath:Logo",
  company: "McDonald's Corporation",
  advertiser_id: "BLH001"
};

console.log('Sending test payload to Blackheath tracking webhook:');
console.log(JSON.stringify(testPayload, null, 2));

try {
  const response = await fetch('https://hook.us2.make.com/o1vw60urdl29rc1trvhyi14je1e2dljt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testPayload)
  });

  console.log('\nResponse status:', response.status, response.statusText);

  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (response.ok) {
    console.log('\n✅ Test webhook sent successfully!');
  } else {
    console.log('\n❌ Webhook request failed');
  }
} catch (error) {
  console.error('\n❌ Error sending webhook:', error.message);
}
