import React, { useState } from 'react';
import { Link, DollarSign, Home, Loader2, Globe, MapPin } from 'lucide-react';
import { SearchParams } from '../types';

interface InputFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  loadingStep?: string;
}

export const InputForm: React.FC<InputFormProps> = ({ onSearch, isLoading, loadingStep }) => {
  const [listingUrl, setListingUrl] = useState('https://www.airbnb.com/rooms/12345678');
  // Pre-filling with the user's specific request to help them test immediately
  const [location, setLocation] = useState('Via Professor Monteggia 8, Laveno-Mombello');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [basePrice, setBasePrice] = useState(150);
  const [listingType, setListingType] = useState<'Entire place' | 'Private room' | 'Shared room'>('Entire place');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ listingUrl, location, startDate, endDate, basePrice, listingType });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-fit sticky top-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Connect Listing
        </h2>
        <p className="text-sm text-slate-500 mt-1">Provide your details to fetch real-time market data.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Listing URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Listing URL</label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm truncate"
              placeholder="https://www.airbnb.com/rooms/..."
              required
            />
          </div>
        </div>

        {/* Location / Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Property Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              placeholder="e.g. Via Roma 1, Milan"
              required
            />
          </div>
          <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
             Required for precise map placement
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-600"
              required
            />
          </div>
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Base Strategy Price (€)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              placeholder="150"
              min="10"
              required
            />
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Listing Type</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white appearance-none"
            >
              <option value="Entire place">Entire place</option>
              <option value="Private room">Private room</option>
              <option value="Shared room">Shared room</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed ${
            isLoading ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs font-mono">{loadingStep}</span>
            </>
          ) : (
            'Sync & Analyze Market'
          )}
        </button>
      </form>
    </div>
  );
};