import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

export const FraudHeatmapSlider: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'yesterday' | '7d' | '30d'>('7d');

  const dataMap = {
    yesterday: {
      label: 'Yesterday (24h Window)',
      volume: 450000,
      cases: 4,
      nodes: 5,
      cities: ['Mumbai (Victim Hub)', 'Delhi (L1 Mule)'],
      description: 'Localized compromise origin in Mumbai with single pass-through hop to Delhi.',
    },
    '7d': {
      label: 'Last 7 Days',
      volume: 2450000,
      cases: 19,
      nodes: 24,
      cities: ['Mumbai', 'Delhi', 'Pune', 'Bangalore'],
      description: 'Syndicate Alpha expansion across 4 major banking hubs via high-velocity mule chains.',
    },
    '30d': {
      label: 'Last 30 Days (Full Trajectory)',
      volume: 12000000,
      cases: 87,
      nodes: 112,
      cities: ['Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Kolkata'],
      description: 'Nationwide coordinated syndicate infrastructure with 112 active nodes.',
    },
  };

  const current = dataMap[timeframe];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-elevated">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-[20px]">timeline</span>
            <h3 className="text-[14px] font-bold text-white">Geospatial Fraud Spread Timeline</h3>
          </div>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Slide timeline to observe cyber financial laundering vectors expand across Indian corridors.
          </p>
        </div>

        {/* Segmented Button Slider */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'yesterday'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '7d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '30d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Laundered Volume</span>
          <span className="font-mono text-[14px] font-extrabold text-red-400 block mt-0.5">
            {formatCurrency(current.volume)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Cases</span>
          <span className="font-mono text-[14px] font-extrabold text-amber-400 block mt-0.5">
            {current.cases} Incidents
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Involved Nodes</span>
          <span className="font-mono text-[14px] font-extrabold text-blue-400 block mt-0.5">
            {current.nodes} Accounts
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Corridor Hubs</span>
          <span className="font-bold text-emerald-400 block mt-0.5 truncate">
            {current.cities.length} Metros
          </span>
        </div>
      </div>

      {/* Corridor Description */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[12px] flex items-start gap-2.5">
        <span className="material-symbols-outlined text-blue-400 text-[18px] mt-0.5">info</span>
        <div>
          <span className="font-bold text-slate-200 block">{current.label} Pattern Analysis:</span>
          <p className="text-slate-400 mt-0.5">{current.description}</p>
        </div>
      </div>
    </div>
  );
};
