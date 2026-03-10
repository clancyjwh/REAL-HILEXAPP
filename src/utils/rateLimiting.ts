import { supabase } from '../lib/supabase';

export interface RateLimitResult {
  allowed: boolean;
  blocked: boolean;
  reason?: string;
  message?: string;
  blocked_until?: string;
  tool_count?: number;
  tool_limit?: number;
  total_count?: number;
  total_limit?: number;
}

export async function checkRateLimit(toolName: string): Promise<RateLimitResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        allowed: false,
        blocked: false,
        message: 'You must be logged in to use this tool.'
      };
    }

    const { data, error } = await supabase.rpc('check_rate_limit_and_log', {
      check_user_id: user.id,
      check_tool_name: toolName,
      check_ip_address: null,
      check_user_agent: navigator.userAgent
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return {
        allowed: false,
        blocked: false,
        message: 'Unable to verify rate limit. Please try again.'
      };
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return {
      allowed: false,
      blocked: false,
      message: 'An error occurred. Please try again.'
    };
  }
}

export async function isUserBlocked(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_until')
      .eq('user_id', user.id)
      .gte('blocked_until', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Block check error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Block check failed:', error);
    return false;
  }
}

export async function getUserBlockStatus(): Promise<{ blocked: boolean; blocked_until?: string; reason?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { blocked: false };
    }

    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('user_id', user.id)
      .gte('blocked_until', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Block status error:', error);
      return { blocked: false };
    }

    if (data) {
      return {
        blocked: true,
        blocked_until: data.blocked_until,
        reason: data.reason
      };
    }

    return { blocked: false };
  } catch (error) {
    console.error('Block status check failed:', error);
    return { blocked: false };
  }
}
