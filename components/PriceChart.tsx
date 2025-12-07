import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DailyPricing } from '../types';

interface PriceChartProps {
  data: DailyPricing[];
  basePrice: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyPricing;
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-slate-800">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        <p className="text-indigo-600 font-bold text-lg">€{data.price}</p>
        <p className="text-slate-500 text-xs mt-1">Demand: <span className={`font-medium ${
          data.demandLevel === 'Peak' ? 'text-red-500' :
          data.demandLevel === 'High' ? 'text-orange-500' :
          data.demandLevel === 'Medium' ? 'text-blue-500' :
          'text-green-500'
        }`}>{data.demandLevel}</span></p>
        <p className="text-slate-400 text-xs italic mt-1">{data.reason}</p>
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC<PriceChartProps> = ({ data, basePrice }) => {
  return (
    <div className="w-full h-[350px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Price Fluctuation</h3>
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-indigo-500/20 border border-indigo-500 rounded-sm"></div>
                    <span className="text-slate-500">Dynamic Rate</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-0.5 bg-orange-400 border-dashed"></div>
                    <span className="text-slate-500">Base Price (€{basePrice})</span>
                </div>
            </div>
        </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={basePrice} stroke="#fb923c" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};