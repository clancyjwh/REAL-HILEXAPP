import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://avijzlkdukanneylvtrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aWp6bGtkdWthbm5leWx2dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUxNTUsImV4cCI6MjA3NjkxMTE1NX0.w6C4WuyugBoZdFxp6kxPEUuMVgqIaokkhrTyck7hzTY'
);

console.log('=== CHECKING OPTIMIZED PARAMETERS ===');
const { data: forex, error } = await supabase
  .from('forex_top_picks')
  .select('optimized_parameters')
  .eq('symbol', 'EUR/USD')
  .maybeSingle();

if (error) console.error('Error:', error);
else {
  console.log('Type:', typeof forex.optimized_parameters);
  console.log('Keys:', Object.keys(forex.optimized_parameters));
  console.log('\n30 day value:', forex.optimized_parameters['30']);
  console.log('30 day type:', typeof forex.optimized_parameters['30']);
  
  // Try parsing it
  try {
    const parsed = JSON.parse(forex.optimized_parameters['30']);
    console.log('Parsed 30:', parsed);
  } catch (e) {
    console.log('Parse error:', e.message);
  }
}
