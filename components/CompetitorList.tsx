
import React from 'react';
import { Competitor } from '../types';
import { Star, MapPin, ExternalLink, Users, BedDouble, CheckCircle, AlertCircle } from 'lucide-react';

interface CompetitorListProps {
  competitors: Competitor[];
  userPrice: number;
}

export const CompetitorList: React.FC<CompetitorListProps> = ({ competitors, userPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
            <h3 className="text-lg font-semibold text-slate-800">Comp Set ({competitors.length})</h3>
            <p className="text-xs text-slate-500">Strictly matched by features & location</p>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
        <div className="divide-y divide-slate-100">
            {competitors.map((comp, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-2">
                         <div className="flex-1 pr-2">
                            {comp.url ? (
                                <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline hover:text-indigo-700 flex items-center gap-1">
                                    {comp.name}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <p className="text-sm font-semibold text-slate-800 line-clamp-2">{comp.name}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mt-1">
                                {comp.platform && (
                                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                        comp.platform === 'Airbnb' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                        comp.platform === 'Booking' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                        {comp.platform}
                                    </span>
                                )}
                                {comp.dataConfidence && (
                                    <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                        comp.dataConfidence === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {comp.dataConfidence === 'Verified' ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                                        {comp.dataConfidence === 'Verified' ? 'Verified Price' : 'Est. Market Rate'}
                                    </span>
                                )}
                            </div>
                         </div>
                         <div className="text-right ml-2 shrink-0">
                            <p className={`text-sm font-bold ${comp.price > userPrice ? 'text-red-500' : 'text-emerald-600'}`}>
                                €{comp.price}
                            </p>
                         </div>
                    </div>

                    {/* Strict Match Verification Badges */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                        {comp.capacity && (
                             <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                <Users className="w-3 h-3" /> {comp.capacity}
                             </span>
                        )}
                        {comp.bedrooms && (
                             <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                <BedDouble className="w-3 h-3" /> {comp.bedrooms}
                             </span>
                        )}
                        {comp.isAvailable === false && (
                            <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                SOLD OUT
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                        {comp.features?.slice(0, 3).map((feat, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded">
                                {feat}
                            </span>
                        ))}
                    </div>

                    {comp.matchReason && (
                        <p className="text-[10px] text-emerald-600 italic mb-2">
                           ✓ {comp.matchReason}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500">
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                <span>{comp.rating} ({comp.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{comp.distance}</span>
                            </div>
                         </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
