const adjectives = [
  'Swift', 'Brave', 'Clever', 'Mighty', 'Noble', 'Wise', 'Gentle', 'Fierce',
  'Bold', 'Bright', 'Quick', 'Strong', 'Proud', 'Silent', 'Golden', 'Silver',
  'Crimson', 'Azure', 'Emerald', 'Jade', 'Ruby', 'Crystal', 'Mystic', 'Ancient',
  'Wild', 'Free', 'Happy', 'Lucky', 'Nimble', 'Agile', 'Radiant', 'Cosmic'
];

const animals = [
  'Eagle', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Hawk', 'Falcon', 'Panther',
  'Leopard', 'Jaguar', 'Cheetah', 'Fox', 'Owl', 'Raven', 'Phoenix', 'Dragon',
  'Dolphin', 'Shark', 'Whale', 'Orca', 'Octopus', 'Penguin', 'Seal', 'Otter',
  'Deer', 'Elk', 'Moose', 'Buffalo', 'Rhino', 'Elephant', 'Giraffe', 'Zebra'
];

export function generateRandomAnimalName(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomAdjective} ${randomAnimal}`;
}

export function getDefaultNotificationPreferences() {
  return {
    email_notifications: true,
    push_notifications: true,
    daily_insights: true,
    top_picks: true,
    taco_trade_updates: true,
    bespoke_projects: true,
    correlation_updates: false,
    interest_rate_updates: false,
  };
}
