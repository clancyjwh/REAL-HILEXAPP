import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://avijzlkdukanneylvtrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aWp6bGtkdWthbm5leWx2dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzUxNTUsImV4cCI6MjA3NjkxMTE1NX0.w6C4WuyugBoZdFxp6kxPEUuMVgqIaokkhrTyck7hzTY'
);

console.log('=== FOREX EUR/USD ===');
const { data: forex, error: forexError } = await supabase
  .from('forex_top_picks')
  .select('symbol, pair_name, signal, indicators, news_summary, optimized_parameters, historical_performance')
  .eq('symbol', 'EUR/USD')
  .maybeSingle();

if (forexError) console.error('Error:', forexError);
else {
  console.log('Symbol:', forex.symbol);
  console.log('Name:', forex.pair_name);
  console.log('Signal:', forex.signal);
  console.log('\nIndicators type:', typeof forex.indicators);
  console.log('Indicators value:', forex.indicators ? JSON.stringify(forex.indicators).substring(0, 100) : 'NULL');
  console.log('\nNews Summary type:', typeof forex.news_summary);
  console.log('News Summary value:', forex.news_summary ? JSON.stringify(forex.news_summary).substring(0, 100) : 'NULL');
  console.log('\nOptimized Params type:', typeof forex.optimized_parameters);
  console.log('Optimized Params value:', forex.optimized_parameters ? JSON.stringify(forex.optimized_parameters).substring(0, 100) : 'NULL');
  console.log('\nHistorical Performance type:', typeof forex.historical_performance);
  console.log('Historical Performance:', forex.historical_performance ? 'EXISTS' : 'NULL');
}

console.log('\n\n=== STOCK GOOGL ===');
const { data: stock, error: stockError } = await supabase
  .from('stocks_top_picks')
  .select('symbol, stock_name, signal, indicators, news_summary, optimized_parameters, historical_performance')
  .eq('symbol', 'GOOGL')
  .maybeSingle();

if (stockError) console.error('Error:', stockError);
else {
  console.log('Symbol:', stock.symbol);
  console.log('Name:', stock.stock_name);
  console.log('Signal:', stock.signal);
  console.log('\nIndicators type:', typeof stock.indicators);
  console.log('Indicators value:', stock.indicators ? JSON.stringify(stock.indicators).substring(0, 100) : 'NULL');
  console.log('\nNews Summary type:', typeof stock.news_summary);
  console.log('News Summary value:', stock.news_summary ? JSON.stringify(stock.news_summary).substring(0, 100) : 'NULL');
  console.log('\nOptimized Params type:', typeof stock.optimized_parameters);
  console.log('Optimized Params value:', stock.optimized_parameters ? JSON.stringify(stock.optimized_parameters).substring(0, 100) : 'NULL');
  console.log('\nHistorical Performance type:', typeof stock.historical_performance);
  console.log('Historical Performance:', stock.historical_performance ? 'EXISTS' : 'NULL');
}
