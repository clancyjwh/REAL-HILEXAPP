import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function displaySecurityDashboard() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          SECURITY MONITORING DASHBOARD                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Webhook Security Stats
    console.log('📊 WEBHOOK SECURITY STATISTICS (Last 24 Hours)\n');

    const { data: webhookStats } = await supabase.rpc('get_webhook_security_stats', {
      p_hours: 24
    });

    if (webhookStats) {
      console.log(`   Total Webhook Calls:        ${webhookStats.total_calls || 0}`);
      console.log(`   ✓ Authenticated:            ${webhookStats.authenticated_calls || 0}`);
      console.log(`   ✗ Failed Authentication:    ${webhookStats.failed_auth_attempts || 0}`);
      console.log(`   ✓ Successful:               ${webhookStats.successful_calls || 0}`);
      console.log(`   ✗ Failed:                   ${webhookStats.failed_calls || 0}`);
      console.log(`   Unique IP Addresses:        ${webhookStats.unique_ips || 0}\n`);

      if (webhookStats.top_ips_by_calls && webhookStats.top_ips_by_calls.length > 0) {
        console.log('   🔝 Top IPs by Call Volume:');
        webhookStats.top_ips_by_calls.slice(0, 5).forEach((ip, i) => {
          console.log(`      ${i + 1}. ${ip.ip}: ${ip.calls} calls`);
        });
        console.log('');
      }

      if (webhookStats.calls_by_webhook_type) {
        console.log('   📊 Calls by Webhook Type:');
        Object.entries(webhookStats.calls_by_webhook_type).forEach(([type, count]) => {
          console.log(`      • ${type}: ${count} calls`);
        });
        console.log('');
      }
    }

    // 2. Suspicious Activity Summary
    console.log('⚠️  SUSPICIOUS ACTIVITY SUMMARY (Last 24 Hours)\n');

    const { data: suspiciousLogs, error: suspiciousError } = await supabase
      .from('suspicious_activity_logs')
      .select('severity, activity_type, count:id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    let totalAlerts = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    if (!suspiciousError && suspiciousLogs) {
      totalAlerts = suspiciousLogs.length;
      criticalCount = suspiciousLogs.filter(l => l.severity === 'CRITICAL').length;
      highCount = suspiciousLogs.filter(l => l.severity === 'HIGH').length;
      mediumCount = suspiciousLogs.filter(l => l.severity === 'MEDIUM').length;

      console.log(`   Total Alerts:               ${totalAlerts}`);
      console.log(`   🔴 Critical:                ${criticalCount}`);
      console.log(`   🟠 High:                    ${highCount}`);
      console.log(`   🟡 Medium:                  ${mediumCount}\n`);

      // Group by activity type
      const activityCounts = {};
      suspiciousLogs.forEach(log => {
        activityCounts[log.activity_type] = (activityCounts[log.activity_type] || 0) + 1;
      });

      if (Object.keys(activityCounts).length > 0) {
        console.log('   Activity Breakdown:');
        Object.entries(activityCounts).forEach(([type, count]) => {
          console.log(`      • ${type}: ${count} alerts`);
        });
        console.log('');
      }
    }

    // 3. Rate Limiting Status
    console.log('🚦 RATE LIMITING STATUS\n');

    const { data: blockedUsers, error: blockedError } = await supabase
      .from('blocked_users')
      .select('*')
      .gt('blocked_until', new Date().toISOString());

    if (!blockedError) {
      console.log(`   Currently Blocked Users:    ${blockedUsers?.length || 0}\n`);

      if (blockedUsers && blockedUsers.length > 0) {
        console.log('   Blocked Users:');
        blockedUsers.forEach(user => {
          const remainingTime = Math.round((new Date(user.blocked_until) - new Date()) / 1000 / 60);
          console.log(`      • User ${user.user_id.substring(0, 8)}...`);
          console.log(`        Reason: ${user.reason}`);
          console.log(`        Unblocks in: ${remainingTime} minutes\n`);
        });
      }
    }

    // 4. Tool Usage Stats (User-Facing Tools)
    console.log('📈 TOOL USAGE STATISTICS (Last 24 Hours)\n');

    const { data: toolStats } = await supabase.rpc('get_tool_usage_stats', {
      p_hours: 24
    });

    if (toolStats) {
      console.log(`   Total Tool Requests:        ${toolStats.total_tool_requests || 0}`);
      console.log(`   Unique Users:               ${toolStats.unique_users || 0}`);
      console.log(`   Currently Blocked:          ${toolStats.currently_blocked || 0}\n`);

      if (toolStats.most_used_tools && toolStats.most_used_tools.length > 0) {
        console.log('   🔝 Most Used Tools:');
        toolStats.most_used_tools.slice(0, 5).forEach((tool, i) => {
          console.log(`      ${i + 1}. ${tool.tool}: ${tool.requests} requests`);
        });
        console.log('');
      }

      if (toolStats.top_users_by_requests && toolStats.top_users_by_requests.length > 0) {
        console.log('   👥 Most Active Users:');
        toolStats.top_users_by_requests.slice(0, 3).forEach((user, i) => {
          console.log(`      ${i + 1}. ${user.user_id.substring(0, 8)}...: ${user.requests} requests`);
        });
        console.log('');
      }
    }

    // 5. Webhook Notification Queue
    console.log('📤 WEBHOOK NOTIFICATION QUEUE\n');

    const { data: pendingWebhooks, error: webhookError } = await supabase
      .from('webhook_notifications')
      .select('status, count:id')
      .eq('status', 'pending')
      .lt('attempts', 3);

    if (!webhookError) {
      console.log(`   Pending Notifications:      ${pendingWebhooks?.length || 0}\n`);
    }

    // 6. Premium Access Stats
    console.log('💎 PREMIUM ACCESS STATISTICS\n');

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('tier');

    if (!profileError && profiles) {
      const tierCounts = {
        free: 0,
        pro: 0,
        premium: 0,
        enterprise: 0
      };

      profiles.forEach(profile => {
        if (tierCounts.hasOwnProperty(profile.tier)) {
          tierCounts[profile.tier]++;
        }
      });

      console.log(`   Total Users:                ${profiles.length}`);
      console.log(`   Free Tier:                  ${tierCounts.free}`);
      console.log(`   Pro Tier:                   ${tierCounts.pro}`);
      console.log(`   Premium Tier:               ${tierCounts.premium}`);
      console.log(`   Enterprise Tier:            ${tierCounts.enterprise}`);
      console.log(`   Conversion Rate:            ${((1 - tierCounts.free / profiles.length) * 100).toFixed(1)}%\n`);
    }

    // 7. Security Recommendations
    console.log('💡 SECURITY RECOMMENDATIONS\n');

    const recommendations = [];

    if (webhookStats && webhookStats.failed_auth_attempts > 10) {
      recommendations.push('⚠️  High number of failed webhook authentication attempts');
      recommendations.push('   → Review webhook secrets and rotate if necessary');
    }

    if (toolStats && toolStats.currently_blocked > 5) {
      recommendations.push('⚠️  Multiple users blocked for tool rate limit violations');
      recommendations.push('   → Review blocked users and investigate patterns');
    }

    if (blockedUsers && blockedUsers.length > 0) {
      recommendations.push('⚠️  Users are currently blocked for tool abuse');
      recommendations.push('   → Review blocked users list above');
    }

    if (suspiciousLogs && criticalCount > 0) {
      recommendations.push('🔴 Critical suspicious activity detected');
      recommendations.push('   → Investigate immediately');
    }

    if (webhookStats && webhookStats.total_calls > 1000) {
      recommendations.push('⚠️  High webhook call volume detected');
      recommendations.push('   → Verify all calls are from legitimate sources');
    }

    if (recommendations.length === 0) {
      console.log('   ✅ No immediate security concerns detected\n');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
      console.log('');
    }

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  Dashboard refresh: Run this script again to update stats    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Error generating dashboard:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Helper function to get webhook secrets (for admin use)
async function getWebhookSecrets() {
  console.log('\n🔑 WEBHOOK SECRETS (Keep these secure!)\n');

  try {
    const { data: secrets, error } = await supabase
      .from('webhook_secrets')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching secrets:', error.message);
      return;
    }

    if (secrets && secrets.length > 0) {
      secrets.forEach(secret => {
        console.log(`   ${secret.webhook_type}:`);
        console.log(`      Secret: ${secret.secret_key}`);
        console.log(`      Last Rotated: ${new Date(secret.last_rotated_at).toLocaleDateString()}`);
        console.log(`      Notes: ${secret.notes || 'None'}\n`);
      });
    } else {
      console.log('   No active webhook secrets found.\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'secrets') {
  getWebhookSecrets();
} else {
  displaySecurityDashboard();
}
