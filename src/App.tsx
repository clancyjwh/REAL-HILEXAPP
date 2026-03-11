import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './lib/stripe';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AINewsfeedPage from './pages/AINewsfeedPage';
import NewsResultsPage from './pages/NewsResultsPage';
import AINewsfeedToolPage from './pages/AINewsfeedToolPage';
import AINewsfeedToolResultsPage from './pages/AINewsfeedToolResultsPage';
import ToolsPage from './pages/ToolsPage';
import ConsensusPage from './pages/ConsensusPage';
import HorizonOptimizerPage from './pages/HorizonOptimizerPage';
import AnalysisSelectionPage from './pages/AnalysisSelectionPage';
import AnalysisSearchPage from './pages/AnalysisSearchPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import CumulativeDetailPage from './pages/CumulativeDetailPage';
import MarketMoversPage from './pages/MarketMoversPage';
import MarketMoversCategoryPage from './pages/MarketMoversCategoryPage';
import TopPicksPage from './pages/TopPicksPage';
import TopPicksCategoryPage from './pages/TopPicksCategoryPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AnalyticalScoreBreakdownPage from './pages/AnalyticalScoreBreakdownPage';
import IndicatorDetailPage from './pages/IndicatorDetailPage';
import HorizonDetailPage from './pages/HorizonDetailPage';
import IndicatorBacktestDetailPage from './pages/IndicatorBacktestDetailPage';
import OptimizedParametersPage from './pages/OptimizedParametersPage';
import BacktestDetailPage from './pages/BacktestDetailPage';
import SingleBacktestDetailPage from './pages/SingleBacktestDetailPage';
import LivePricesPage from './pages/LivePricesPage';
import AssetSearchLoadingPage from './pages/AssetSearchLoadingPage';
import AssetSearchResultPage from './pages/AssetSearchResultPage';
import TacoTradePage from './pages/TacoTradePage';
import StopSignalPage from './pages/StopSignalPage';
import ResistanceSignalPage from './pages/ResistanceSignalPage';
import SourcesPage from './pages/SourcesPage';
import CorrelationIndexPage from './pages/CorrelationIndexPage';
import RelativeValueIndexPage from './pages/RelativeValueIndexPage';
import RelativeValueLoadingPage from './pages/RelativeValueLoadingPage';
import RelativeValueResultPage from './pages/RelativeValueResultPage';
import BillingPage from './pages/BillingPage';
import MyAccountPage from './pages/MyAccountPage';
import MyWatchlistPage from './pages/MyWatchlistPage';
import InterestRatesPage from './pages/InterestRatesPage';
import InterestRatesLoadingPage from './pages/InterestRatesLoadingPage';
import InterestRatesResultPage from './pages/InterestRatesResultPage';
import InterestRatesToolPage from './pages/InterestRatesToolPage';
import InterestRatesToolLoadingPage from './pages/InterestRatesToolLoadingPage';
import InterestRatesToolResultPage from './pages/InterestRatesToolResultPage';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import BespokeProjectsPage from './pages/BespokeProjectsPage';
import BespokeUpdatesPage from './pages/BespokeUpdatesPage';
import MetricDefinitionPage from './pages/MetricDefinitionPage';
import DocumentationPage from './pages/DocumentationPage';
import AnalysisTypesPage from './pages/AnalysisTypesPage';
import AnalysisTypeDetailPage from './pages/AnalysisTypeDetailPage';
import NewsfeedMethodologyPage from './pages/NewsfeedMethodologyPage';
import AnalysisToolsPage from './pages/AnalysisToolsPage';
import AssetDataPage from './pages/AssetDataPage';
import ProjectsUpdatesPage from './pages/ProjectsUpdatesPage';
import BespokeUpdatesInfoPage from './pages/BespokeUpdatesInfoPage';
import BespokeProjectsInfoPage from './pages/BespokeProjectsInfoPage';
import ParameterMethodologyPage from './pages/ParameterMethodologyPage';
import HorizonOptimizerInfoPage from './pages/HorizonOptimizerInfoPage';
import RelativeValueInfoPage from './pages/RelativeValueInfoPage';
import InterestRateInfoPage from './pages/InterestRateInfoPage';
import FAQPage from './pages/FAQPage';
import DefinitionsPage from './pages/DefinitionsPage';
import ChatbotPage from './pages/ChatbotPage';
import ChatroomPage from './pages/ChatroomPage';
import ChatroomView from './pages/ChatroomView';
import DailyInsightsPage from './pages/DailyInsightsPage';
import HorizonAssetClassPage from './pages/HorizonAssetClassPage';
import HorizonOptimizerAssetPage from './pages/HorizonOptimizerAssetPage';
import AnalysisAssetClassPage from './pages/AnalysisAssetClassPage';
import AnalysisSelectionAssetPage from './pages/AnalysisSelectionAssetPage';
import SignalDetailPage from './pages/SignalDetailPage';
import LoginStreakPage from './pages/LoginStreakPage';
import ContactPage from './pages/ContactPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ZeroDayOptionsPage from './pages/ZeroDayOptionsPage';
import ZeroDayOptionsLoadingPage from './pages/ZeroDayOptionsLoadingPage';
import ZeroDayOptionsResultPage from './pages/ZeroDayOptionsResultPage';
import ZeroDayOptionsDefinitionPage from './pages/ZeroDayOptionsDefinitionPage';
import StrikePricesDetailPage from './pages/StrikePricesDetailPage';
import EventForecastingPage from './pages/EventForecastingPage';
import EventForecastingLoadingPage from './pages/EventForecastingLoadingPage';
import EventForecastingResultsPage from './pages/EventForecastingResultsPage';
import EventForecastingDefinitionPage from './pages/EventForecastingDefinitionPage';
import PriceForecastingPage from './pages/PriceForecastingPage';
import PriceForecastingLoadingPage from './pages/PriceForecastingLoadingPage';
import PriceForecastingResultPage from './pages/PriceForecastingResultPage';
import PriceForecastMethodologyPage from './pages/PriceForecastMethodologyPage';
import GetPremiumPage from './pages/GetPremiumPage';
import GetPremiumInvoicePage from './pages/GetPremiumInvoicePage';
import GetPremiumConfirmationPage from './pages/GetPremiumConfirmationPage';
import LandingPage from './pages/LandingPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import { features } from './config/features';
import { usePageTracking } from './hooks/useAnalytics';

function AppContent() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/analysis-search" element={<AnalysisResultPage />} />
      {features.showAINewsfeed && <Route path="/ai-newsfeed" element={<AINewsfeedPage />} />}
      {features.showAINewsfeed && <Route path="/ai-newsfeed/results" element={<NewsResultsPage />} />}
      <Route path="/sources" element={<SourcesPage />} />
      {features.showTools && <Route path="/tools" element={<ToolsPage />} />}
      {features.showConsensus && <Route path="/tools/consensus" element={<ConsensusPage />} />}
      {features.showHorizonOptimizer && <Route path="/tools/horizon" element={<HorizonAssetClassPage />} />}
      {features.showHorizonOptimizer && <Route path="/tools/horizon/:assetClass" element={<HorizonOptimizerAssetPage />} />}
      <Route path="/tools/horizon-optimizer" element={<HorizonOptimizerInfoPage />} />
      <Route path="/tools/relative-value-info" element={<RelativeValueInfoPage />} />
      <Route path="/tools/interest-rate-info" element={<InterestRateInfoPage />} />
      <Route path="/tools/ai-newsfeed" element={<AINewsfeedToolPage />} />
      <Route path="/tools/ai-newsfeed/results" element={<AINewsfeedToolResultsPage />} />
      <Route path="/tools/interest-rates" element={<InterestRatesToolPage />} />
      <Route path="/tools/interest-rates/loading" element={<InterestRatesToolLoadingPage />} />
      <Route path="/tools/interest-rates/result" element={<InterestRatesToolResultPage />} />
      <Route path="/tools/zero-day-options" element={<ZeroDayOptionsPage />} />
      <Route path="/tools/zero-day-options/loading" element={<ZeroDayOptionsLoadingPage />} />
      <Route path="/tools/zero-day-options/result" element={<ZeroDayOptionsResultPage />} />
      <Route path="/tools/zero-day-options/strike-prices" element={<StrikePricesDetailPage />} />
      <Route path="/tools/event-forecasting" element={<EventForecastingPage />} />
      <Route path="/tools/event-forecasting/loading" element={<EventForecastingLoadingPage />} />
      <Route path="/tools/event-forecasting/results" element={<EventForecastingResultsPage />} />
      <Route path="/tools/price-forecasting" element={<PriceForecastingPage />} />
      <Route path="/tools/price-forecasting/loading" element={<PriceForecastingLoadingPage />} />
      <Route path="/tools/price-forecasting/result" element={<PriceForecastingResultPage />} />
      <Route path="/tools/analysis" element={<AnalysisAssetClassPage />} />
      <Route path="/tools/analysis/:assetClass" element={<AnalysisSelectionAssetPage />} />
      <Route path="/tools/analysis/:assetClass/search" element={<AnalysisSearchPage />} />
      <Route path="/tools/analysis/detail" element={<AnalysisDetailPage />} />
      <Route path="/tools/analysis/cumulative" element={<CumulativeDetailPage />} />
      <Route path="/tools/relative-value-index" element={<RelativeValueIndexPage />} />
      <Route path="/tools/relative-value-index/loading" element={<RelativeValueLoadingPage />} />
      <Route path="/tools/relative-value-index/result" element={<RelativeValueResultPage />} />
      {features.showMarketMovers && <Route path="/market-movers" element={<MarketMoversPage />} />}
      {features.showMarketMovers && <Route path="/market-movers/:category" element={<MarketMoversCategoryPage />} />}
      {features.showTopPicks && <Route path="/top-picks" element={<TopPicksPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category" element={<TopPicksCategoryPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/optimized-parameters" element={<OptimizedParametersPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/backtest-details" element={<BacktestDetailPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/backtest/:days" element={<SingleBacktestDetailPage />} />}
      {features.showStopSignal && <Route path="/top-picks/:category/:symbol/stop-signal" element={<StopSignalPage />} />}
      {features.showStopSignal && <Route path="/top-picks/:category/:symbol/resistance-signal" element={<ResistanceSignalPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/horizon/:horizonKey/indicator/:indicator" element={<IndicatorBacktestDetailPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/horizon/:horizonKey" element={<HorizonDetailPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/analytical-score" element={<AnalyticalScoreBreakdownPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/sources" element={<SourcesPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/market-analysis" element={<MarketAnalysisPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol/:indicator" element={<IndicatorDetailPage />} />}
      {features.showTopPicks && <Route path="/top-picks/:category/:symbol" element={<AssetDetailPage />} />}
      <Route path="/bespoke-updates" element={<BespokeUpdatesPage />} />
      <Route path="/live-prices" element={<LivePricesPage />} />
      <Route path="/bespoke-projects" element={<BespokeProjectsPage />} />
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/documentation/faq" element={<FAQPage />} />
      <Route path="/documentation/definitions" element={<DefinitionsPage />} />
      <Route path="/documentation/chatbot" element={<ChatbotPage />} />
      <Route path="/documentation/signal/:signalId" element={<SignalDetailPage />} />
      <Route path="/documentation/indicators" element={<AnalysisTypesPage />} />
      <Route path="/documentation/indicators/:type" element={<AnalysisTypeDetailPage />} />
      <Route path="/documentation/analysis-tools" element={<AnalysisToolsPage />} />
      <Route path="/documentation/horizon-optimizer" element={<HorizonOptimizerInfoPage />} />
      <Route path="/documentation/newsfeed" element={<NewsfeedMethodologyPage />} />
      <Route path="/documentation/asset-data" element={<AssetDataPage />} />
      <Route path="/documentation/parameter-methodology" element={<ParameterMethodologyPage />} />
      <Route path="/documentation/projects-updates" element={<ProjectsUpdatesPage />} />
      <Route path="/documentation/bespoke-updates" element={<BespokeUpdatesInfoPage />} />
      <Route path="/documentation/bespoke-projects" element={<BespokeProjectsInfoPage />} />
      <Route path="/documentation/zero-day-options" element={<ZeroDayOptionsDefinitionPage />} />
      <Route path="/documentation/event-forecasting" element={<EventForecastingDefinitionPage />} />
      <Route path="/documentation/price-forecast-methodology" element={<PriceForecastMethodologyPage />} />
      <Route path="/my-watchlist" element={<MyWatchlistPage />} />
      <Route path="/chatroom" element={<ChatroomPage />} />
      <Route path="/chatroom/:roomId" element={<ChatroomView />} />
      <Route path="/daily-insights" element={<DailyInsightsPage />} />
      <Route path="/interest-rates" element={<InterestRatesPage />} />
      <Route path="/interest-rates/loading" element={<InterestRatesLoadingPage />} />
      <Route path="/interest-rates/result" element={<InterestRatesResultPage />} />
      <Route path="/watchlist/:symbol" element={<AssetDetailPage />} />
      <Route path="/watchlist/:symbol/analytical-score" element={<AnalyticalScoreBreakdownPage />} />
      <Route path="/watchlist/:symbol/market-analysis" element={<MarketAnalysisPage />} />
      <Route path="/watchlist/:symbol/optimized-parameters" element={<OptimizedParametersPage />} />
      <Route path="/watchlist/:symbol/backtest-details" element={<BacktestDetailPage />} />
      <Route path="/watchlist/:symbol/backtest/:days" element={<SingleBacktestDetailPage />} />
      <Route path="/watchlist/:symbol/:indicator" element={<IndicatorDetailPage />} />
      <Route path="/my-account" element={<MyAccountPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/analytics" element={<AnalyticsDashboardPage />} />
      <Route path="/get-premium" element={<GetPremiumPage />} />
      <Route path="/get-premium/invoice" element={<GetPremiumInvoicePage />} />
      <Route path="/get-premium/confirmation" element={<GetPremiumConfirmationPage />} />
      <Route path="/login-streak" element={<LoginStreakPage />} />
      <Route path="/asset-search-loading" element={<AssetSearchLoadingPage />} />
      <Route path="/asset-search-result" element={<AssetSearchResultPage />} />
      {features.showTacoTrade && <Route path="/taco-trade" element={<TacoTradePage />} />}
      <Route path="/correlation" element={<CorrelationIndexPage />} />
      <Route path="/metric-definition" element={<MetricDefinitionPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/signup"
            element={
              <Elements
                stripe={stripePromise}
                options={{
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#ea580c',
                      colorBackground: '#334155',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <SignupPage />
              </Elements>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-[#020617]">
                  {/* Mobile Restriction Guard */}
                  <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-8 text-center md:hidden">
                    <div className="max-w-md">
                      <h1 className="text-3xl font-bold text-white mb-4 italic">DESKTOP ACCESS ONLY</h1>
                      <p className="text-slate-400 mb-6">HilEX Optimized Trends is a heavy-duty analytical platform designed specifically for desktop and laptop environments. Mobile access is currently unsupported to ensure data accuracy and performance.</p>
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider">Please switch to a desktop or laptop device</p>
                      </div>
                    </div>
                  </div>

                  <Sidebar />
                  <GlobalSearch />
                  <main className="ml-64 p-8">
                    <AppContent />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
