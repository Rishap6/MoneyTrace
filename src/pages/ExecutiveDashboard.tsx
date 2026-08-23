import React from 'react';
import { useDashboardStats } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/formatters';
import { FraudHeatmapSlider } from '../components/dashboard/FraudHeatmapSlider';

export const ExecutiveDashboard: React.FC = () => {
  const { data: stats } = useDashboardStats();

  const recoveryRate = stats?.recovery_rate ?? 85.0;
  const totalVolume = stats?.total_volume ?? 4500000;
  const recoveredAmount = totalVolume * (recoveryRate / 100);
  const exposedAmount = totalVolume - recoveredAmount;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white border border-slate-800 shadow-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                EXECUTIVE INTELLIGENCE • CEO & BOARD VIEW
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Financial Crime & Asset Recovery Command
            </h1>
            <p className="text-[13px] text-slate-300 max-w-2xl">
              High-level strategic telemetries: capital preservation rates, active cyber laundering syndicates, and SLA threat interception benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/reports"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[13px] flex items-center gap-2 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">summarize</span>
              <span>Download Board Briefing</span>
            </a>
          </div>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Capital Monitored</span>
            <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 font-mono">
            {formatCurrency(totalVolume)}
          </p>
          <p className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            99.4% Automated Screening
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-green-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assets Preserved / Recovered</span>
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <p className="text-2xl font-extrabold text-green-700 font-mono">
            {formatCurrency(recoveredAmount)}
          </p>
          <p className="text-[11px] text-green-700 font-semibold">
            {recoveryRate}% Net Preservation Efficiency
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Syndicates Detected</span>
            <span className="material-symbols-outlined text-[20px]">group_work</span>
          </div>
          <p className="text-2xl font-extrabold text-red-600 font-mono">2 Rings</p>
          <p className="text-[11px] text-red-600 font-semibold">7 Coordinated Mule Nodes</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mean SOC Threat Response</span>
            <span className="material-symbols-outlined text-[20px]">speed</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-700 font-mono">4.2 Mins</p>
          <p className="text-[11px] text-indigo-600 font-semibold">Under Section 91 CrPC Directive</p>
        </div>
      </div>

      {/* Middle Grid: Recovery Gauge (5 cols) & India Geospatial Map Flow (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Circular Recovery Probability Gauge (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-card flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                PROBABILISTIC RECOVERY INDEX
              </span>
              <h3 className="text-[15px] font-bold text-gray-900 mt-0.5">Asset Preservation Gauge</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold text-[11px]">
              HIGH LIKELIHOOD
            </span>
          </div>

          {/* SVG Circular / Arc Gauge */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - recoveryRate / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-gray-900 font-mono">
                  {recoveryRate}%
                </span>
                <span className="text-[11px] font-bold uppercase text-green-700 tracking-wider">
                  Success Score
                </span>
              </div>
            </div>

            {/* Gauge Key Drivers */}
            <div className="w-full space-y-2 mt-4 text-[12px]">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50/70 border border-green-200 text-green-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                  Funds Stationary in Holding Node ACC5008
                </span>
                <b className="font-mono text-green-700">+45%</b>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50/70 border border-green-200 text-green-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                  Terminal Account Freeze Window Active (&lt; 2h)
                </span>
                <b className="font-mono text-green-700">+25%</b>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50/70 border border-green-200 text-green-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                  Destination Bank Compliance Gateway Connected
                </span>
                <b className="font-mono text-green-700">+15%</b>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 text-center font-medium">
            Computed by MoneyTrace ML Recovery Engine based on multi-hop graph depth and freeze latency.
          </div>
        </div>

        {/* Right: India Geospatial Fraud Movement Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-elevated flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                GEOSPATIAL THREAT VELOCITY
              </span>
              <h3 className="text-[15px] font-bold text-white mt-0.5">
                India Money Laundering Movement Corridor
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[11px] border border-red-500/30 animate-pulse">
              LIVE CORRIDOR
            </span>
          </div>

          {/* Map Vector Visualization */}
          <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
            {/* Animated Trajectory SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 240">
              {/* Path 1: Mumbai to Delhi */}
              <path
                d="M 120 160 Q 180 80 240 60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              {/* Path 2: Delhi to Pune */}
              <path
                d="M 240 60 Q 200 130 140 180"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              {/* Path 3: Pune to Bangalore */}
              <path
                d="M 140 180 Q 200 200 280 210"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            </svg>

            {/* City Nodes */}
            <div className="absolute left-[110px] top-[150px] flex items-center gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-ping" />
              <span className="text-[11px] font-bold font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-blue-500/40 text-blue-300">
                Mumbai (Victim)
              </span>
            </div>

            <div className="absolute left-[230px] top-[50px] flex items-center gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/30" />
              <span className="text-[11px] font-bold font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300">
                Delhi (Mule 1)
              </span>
            </div>

            <div className="absolute left-[130px] top-[180px] flex items-center gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/30" />
              <span className="text-[11px] font-bold font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-red-500/40 text-red-300">
                Pune (Mule 2)
              </span>
            </div>

            <div className="absolute left-[270px] top-[200px] flex items-center gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/30" />
              <span className="text-[11px] font-bold font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-purple-500/40 text-purple-300">
                Bangalore (Holder Hub)
              </span>
            </div>
          </div>

          {/* Corridor Narration */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase">Primary Vector</span>
              <span className="font-bold text-white">Mumbai → Delhi</span>
              <span className="text-red-400 block text-[10px] font-mono mt-0.5">₹1,50,000 Compromised</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase">Layering Hop</span>
              <span className="font-bold text-white">Delhi → Pune</span>
              <span className="text-amber-400 block text-[10px] font-mono mt-0.5">₹1,45,000 Transferred</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase">Terminal Hub</span>
              <span className="font-bold text-white">Pune → Bangalore</span>
              <span className="text-emerald-400 block text-[10px] font-mono mt-0.5">Section 91 Freeze Sent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Fraud Timeline Slider (Yesterday / 7D / 30D) */}
      <FraudHeatmapSlider />
    </div>
  );
};

export default ExecutiveDashboard;
