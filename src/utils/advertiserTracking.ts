import { supabase } from '../lib/supabase';

interface AdvertiserClickPayload {
  user_name: string;
  user_id: string;
  timestamp: string;
  event_id: string;
  element_clicked: string;
  company: string;
  advertiser_id: string;
}

interface AdvertiserConfig {
  name: string;
  advertiser_company: string;
  advertiser_id: string;
  webhook_url: string;
}

interface UserProfile {
  full_name?: string;
  business_name?: string;
  email?: string;
}

const ADVERTISER_CONFIGS: Record<string, AdvertiserConfig> = {
  blackheath: {
    name: 'Blackheath',
    advertiser_company: 'Blackheath Fund Management Inc',
    advertiser_id: 'BLH001',
    webhook_url: 'https://hook.us2.make.com/o1vw60urdl29rc1trvhyi14je1e2dljt'
  }
};

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, business_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function trackAdvertiserClick(
  advertiserKey: string,
  elementClicked: string,
  userId: string
): Promise<void> {
  const config = ADVERTISER_CONFIGS[advertiserKey];

  if (!config) {
    console.error(`Unknown advertiser: ${advertiserKey}`);
    return;
  }

  const profile = await getUserProfile(userId);

  let userName = 'Anonymous';
  let userCompany = 'Unknown';

  if (profile) {
    if (profile.full_name) {
      userName = profile.full_name;
    } else if (profile.email) {
      userName = profile.email;
    }

    if (profile.business_name) {
      userCompany = profile.business_name;
    }
  }

  const timestamp = new Date().toISOString();
  const event_id = crypto.randomUUID();

  const payload: AdvertiserClickPayload = {
    user_name: userName,
    user_id: userId,
    timestamp,
    event_id,
    element_clicked: elementClicked,
    company: userCompany,
    advertiser_id: config.advertiser_id
  };

  try {
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to send tracking webhook:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending tracking webhook:', error);
  }
}
