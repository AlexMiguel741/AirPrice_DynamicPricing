import React from 'react';
import { DailyPricing, DemandLevel } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface PricingTableProps {
  data: DailyPricing[];
  basePrice: number;
}

export const PricingTable: React.FC<PricingTableProps> = ({ data, basePrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">Daily Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Day</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">vs Base</th>
              <th className="px-6 py-3">Demand</th>
              <th className="px-6 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => {
              const diff = item.price - basePrice;
              const dateObj = new Date(item.date);
              return (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-slate-800 font-medium">
                    {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {dateObj.toLocaleDateString(undefined, { weekday: 'long' })}
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-800">
                    €{item.price}
                  </td>
                  <td className="px-6 py-3">
                    <div className={`flex items-center gap-1 ${
                      diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                        {diff > 0 && <ArrowUpRight className="w-4 h-4" />}
                        {diff < 0 && <ArrowDownRight className="w-4 h-4" />}
                        {diff === 0 && <Minus className="w-4 h-4" />}
                        {diff !== 0 ? `${Math.abs(Math.round((diff / basePrice) * 100))}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.demandLevel === DemandLevel.Peak ? 'bg-red-100 text-red-800' :
                      item.demandLevel === DemandLevel.High ? 'bg-orange-100 text-orange-800' :
                      item.demandLevel === DemandLevel.Medium ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.demandLevel}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 truncate max-w-[200px]" title={item.reason}>
                    {item.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};