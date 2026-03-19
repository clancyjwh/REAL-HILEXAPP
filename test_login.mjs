import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://avijzlkdukanneylvtrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aWp6bGtkdWthbm5leWx2dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUxNTUsImV4cCI6MjA3NjkxMTE1NX0.w6C4WuyugBoZdFxp6kxPEUuMVgqIaokkhrTyck7hzTY'
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'thodgins@blackheath.ca',
    password: 'DEMO2026H!L3X',
  });

  if (error) {
    console.error('Login Error:', error.message);
  } else {
    console.log('Login Successful!');
    console.log('User ID:', data.user.id);
  }
}

testLogin();
