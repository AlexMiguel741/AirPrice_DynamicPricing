
import React from 'react';
import { CompetitivenessAudit, ListingDetails } from '../types';
import { CheckCircle2, AlertTriangle, TrendingUp, Award, Zap, Home, MapPin } from 'lucide-react';

interface ListingAuditProps {
  audit: CompetitivenessAudit;
  details: ListingDetails;
}

export const ListingAudit: React.FC<ListingAuditProps> = ({ audit, details }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    if (score >= 60) return 'text-indigo-600 border-indigo-200 bg-indigo-50';
    return 'text-orange-600 border-orange-200 bg-orange-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-900 px-6 py-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
              <Home className="w-3 h-3" />
              Property Analysis
            </div>
            <h2 className="text-xl font-bold">{details.title || "Your Listing"}</h2>
            
            {details.detectedAddress && (
                 <div className="mt-2 flex items-start gap-2 bg-slate-800/50 p-2 rounded border border-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Verified Location</p>
                        <p className="text-xs text-slate-200 leading-snug">{details.detectedAddress}</p>
                    </div>
                 </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-300">
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span>{details.capacity}</span>
              {details.currentRating && (
                <>
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  <span className="flex items-center gap-1 text-yellow-400">
                     ★ {details.currentRating}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {details.detectedFeatures.map((feat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">
                        {feat}
                    </span>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 shrink-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${getScoreColor(audit.score).replace('bg-', 'bg-transparent ')}`}>
              {audit.score}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Competitiveness Score</p>
              <p className="text-lg font-semibold">{audit.marketPosition} Market</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-500" />
            Competitive Strengths
          </h3>
          <ul className="space-y-3">
            {audit.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            Growth Opportunities
          </h3>
          <ul className="space-y-3">
            {audit.improvementSuggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    item.impact === 'High' ? 'text-red-500' : 'text-amber-500'
                }`} />
                <div>
                    <p className="text-sm font-semibold text-slate-800">{item.suggestion}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {item.impact} Impact
                        </span>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
