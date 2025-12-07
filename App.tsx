
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { PriceChart } from './components/PriceChart';
import { PricingTable } from './components/PricingTable';
import { CompetitorList } from './components/CompetitorList';
import { ListingAudit } from './components/ListingAudit';
import { CompetitorMap } from './components/CompetitorMap';
import { generatePricingStrategy } from './services/geminiService';
import { PricingAnalysis, SearchParams } from './types';
import { TrendingUp, Info, Sparkles, Search, Globe, ExternalLink, Database, Tag } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<PricingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setLastSearchParams(params);
    setData(null);

    try {
        setLoadingStep('Verifying 20+ active competitors & dates...');
        // The API call itself takes time, so we don't need artificial delays anymore.
        
        const result = await generatePricingStrategy(params);
        setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve market data. Please verify the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely format currency diffs
  const formatPriceDiff = (recommended: number, average: number) => {
    const diff = recommended - average;
    const sign = diff > 0 ? '+' : '';
    // Fix: Handle floating point errors by toFixed(2)
    return `${sign}€${Math.abs(diff).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AirPrice <span className="text-indigo-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                <Globe className="w-3 h-3" />
                Live Web Data
             </span>
             <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">API Docs</a>
             <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="User" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-3">
            <InputForm onSearch={handleSearch} isLoading={loading} loadingStep={loadingStep} />
            
            {/* Real Data Sources Box */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    Data Provenance
                </h4>
                
                {!data && !loading && (
                    <p className="text-xs text-slate-400 italic">Run a search to see live data sources.</p>
                )}

                {loading && (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>
                )}

                {data && (
                    <div className="space-y-2">
                        {data.sourceUrls && data.sourceUrls.length > 0 ? (
                             data.sourceUrls.slice(0, 5).map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-start gap-2 text-xs text-slate-600 hover:text-indigo-600 hover:underline group"
                                >
                                    <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-slate-400 group-hover:text-indigo-500" />
                                    <span className="line-clamp-2">{source.title}</span>
                                </a>
                             ))
                        ) : (
                            <p className="text-xs text-slate-500">Data synthesized from general market knowledge.</p>
                        )}
                        {data.sourceUrls && data.sourceUrls.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <p className="text-[10px] text-slate-400">
                                    Retrieved via Google Search Real-Time Index.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
                <Info className="w-5 h-5" />
                {error}
              </div>
            )}

            {!data && !loading && !error && (
               <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                     <Search className="w-8 h-8 text-indigo-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Waiting for Listing URL</h3>
                  <p className="text-sm max-w-md text-center mt-2">Enter a property URL to begin the competitive analysis and pricing engine.</p>
               </div>
            )}

            {loading && (
               <div className="flex flex-col items-center justify-center h-[500px] text-indigo-600 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg font-medium mt-6 text-slate-800">{loadingStep}</p>
                  <p className="text-sm text-slate-400 mt-2">Parsing listing details and querying global travel indices...</p>
               </div>
            )}

            {data && lastSearchParams && (
              <>
                {/* 1. Property Audit Section */}
                {data.listingDetails && data.audit && (
                    <ListingAudit audit={data.audit} details={data.listingDetails} />
                )}

                {/* 2. CUSTOMIZED PRICING RECOMMENDATION - NEW */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
                    {/* Fixed absolute overflow issue by reducing size or using proper container */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-300 mb-2">
                                <Tag className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Your Customized Base Price</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">€{Math.round(data.summary.recommendedBasePrice)}</span>
                                <span className="text-indigo-300 font-medium">/ night</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs border border-white/10 flex items-center gap-2">
                                    <span className="text-slate-400">Market Avg:</span>
                                    <span className="font-semibold text-white">€{Math.round(data.marketMetrics.competitorAveragePrice)}</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs border border-white/10 flex items-center gap-2">
                                    <span className="text-slate-400">vs. Market:</span>
                                    <span className={`font-semibold ${data.summary.recommendedBasePrice > data.marketMetrics.competitorAveragePrice ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        {formatPriceDiff(data.summary.recommendedBasePrice, data.marketMetrics.competitorAveragePrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10 max-w-md w-full">
                            <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Pricing Logic
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                "{data.summary.pricingStrategyLogic}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Market Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500 mb-1">Market Occupancy</p>
                        <p className="text-2xl font-bold text-slate-800">{data.marketMetrics.marketOccupancyRate}%</p>
                        <p className="text-xs text-slate-400 mt-1">Based on {data.competitors.length} similar listings</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500 mb-1">Competitor Avg.</p>
                        <p className="text-2xl font-bold text-slate-800">€{Math.round(data.marketMetrics.competitorAveragePrice)}</p>
                        <p className="text-xs text-slate-400 mt-1">Strict match only</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500 mb-1">Active Peers</p>
                        <p className="text-2xl font-bold text-slate-800">{data.marketMetrics.activeListingsInArea}</p>
                        <p className="text-xs text-slate-400 mt-1">In immediate area</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-500 mb-1">Search Volume</p>
                        <p className="text-2xl font-bold text-slate-800">{data.marketMetrics.searchVolume}</p>
                         <p className="text-xs text-slate-400 mt-1">Current demand</p>
                    </div>
                </div>

                {/* 4. Map & Competitors - Fixed Layout Overlap */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
                    <div className="lg:col-span-2 h-[400px] lg:h-full">
                        <CompetitorMap competitors={data.competitors} userListing={data.listingDetails} />
                    </div>
                    <div className="lg:col-span-1 h-[400px] lg:h-full">
                        <CompetitorList competitors={data.competitors} userPrice={data.summary.recommendedBasePrice} />
                    </div>
                </div>

                {/* 5. Main Chart */}
                <PriceChart data={data.dailyBreakdown} basePrice={data.summary.recommendedBasePrice} />

                {/* 6. Detailed Table */}
                <PricingTable data={data.dailyBreakdown} basePrice={data.summary.recommendedBasePrice} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
