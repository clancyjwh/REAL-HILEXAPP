import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://avijzlkdukanneylvtrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aWp6bGtkdWthbm5leWx2dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUxNTUsImV4cCI6MjA3NjkxMTE1NX0.w6C4WuyugBoZdFxp6kxPEUuMVgqIaokkhrTyck7hzTY'
);

console.log('=== CHECKING EUR/USD IN FOREX_TOP_PICKS ===');
const { data: forexData, error: forexError } = await supabase
  .from('forex_top_picks')
  .select('*')
  .eq('symbol', 'EUR/USD')
  .maybeSingle();

if (forexError) {
  console.error('Forex Error:', forexError);
} else if (!forexData) {
  console.log('NO EUR/USD FOUND IN FOREX_TOP_PICKS');
} else {
  console.log('Symbol:', forexData.symbol);
  console.log('Name:', forexData.pair_name);
  console.log('Signal:', forexData.signal);
  console.log('Indicators:', forexData.indicators ? 'EXISTS' : 'NULL');
  console.log('News Summary:', forexData.news_summary ? 'EXISTS' : 'NULL');
  console.log('Optimized Params:', forexData.optimized_parameters ? 'EXISTS' : 'NULL');
  console.log('Raw Data:', forexData.raw_data ? 'EXISTS' : 'NULL');
  if (forexData.raw_data) {
    console.log('Raw Data Keys:', Object.keys(forexData.raw_data));
  }
}

console.log('\n=== CHECKING A STOCK FOR COMPARISON ===');
const { data: stockData, error: stockError } = await supabase
  .from('stocks_top_picks')
  .select('*')
  .limit(1)
  .maybeSingle();

if (stockError) {
  console.error('Stock Error:', stockError);
} else if (stockData) {
  console.log('Symbol:', stockData.symbol);
  console.log('Name:', stockData.stock_name);
  console.log('Indicators:', stockData.indicators ? 'EXISTS' : 'NULL');
  console.log('News Summary:', stockData.news_summary ? 'EXISTS' : 'NULL');
  console.log('Optimized Params:', stockData.optimized_parameters ? 'EXISTS' : 'NULL');
  console.log('Raw Data:', stockData.raw_data ? 'EXISTS' : 'NULL');
}
