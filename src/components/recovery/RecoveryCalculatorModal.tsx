import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [frozenAmount, setFrozenAmount] = useState<number>(138000);
  const [networkHops, setNetworkHops] = useState<number>(3);
  const [hoursElapsed, setHoursElapsed] = useState<number>(1.5);
  const [hasDirectGateway, setHasDirectGateway] = useState<boolean>(true);

  if (!isOpen) return null;

  // ML Recovery Formula Simulation
  // Baseline = 95%
  // -3% per hop > 1
  // -1.5% per hour elapsed
  // -8% if no direct gateway
  // +5% if frozen amount > 75% of total
  const hopPenalty = (networkHops - 1) * 3.0;
  const timePenalty = hoursElapsed * 1.5;
  const gatewayBonus = hasDirectGateway ? 0 : 8.0;

  const rawScore = 98.0 - hopPenalty - timePenalty - gatewayBonus;
  const recoveryProbability = Math.max(10, Math.min(99, Math.round(rawScore)));

  const getTierBadge = (score: number) => {
    if (score >= 85) return { text: 'VERY HIGH LIKELIHOOD', bg: 'bg-green-100 text-green-800' };
    if (score >= 65) return { text: 'MODERATE RECOVERY', bg: 'bg-amber-100 text-amber-800' };
    return { text: 'LOW / DEGRADED', bg: 'bg-red-100 text-red-800' };
  };

  const badge = getTierBadge(recoveryProbability);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <span className="material-symbols-outlined text-[24px]">calculate</span>
            </div>
            <div>
              <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                ML SENSITIVITY ENGINE
              </span>
              <h3 className="text-[16px] font-bold mt-0.5">Recovery Prediction AI Calculator</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Sliders and Result */}
        <div className="p-6 space-y-5 text-gray-800 text-[13px]">
          {/* Result Arc Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badge.bg}`}>
                {badge.text}
              </span>
              <p className="text-3xl font-extrabold text-emerald-900 font-mono mt-1">
                {recoveryProbability}%
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Predicted Asset Preservation Likelihood
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Est. Preserved Capital</span>
              <span className="text-lg font-mono font-bold text-gray-900 mt-0.5 block">
                {formatCurrency(frozenAmount)}
              </span>
              <span className="text-[10px] text-gray-400">Available for Reversal</span>
            </div>
          </div>

          {/* Interactive Parameters */}
          <div className="space-y-4">
            {/* Slider 1: Frozen Amount */}
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-bold text-gray-700">
                <span>Frozen Capital Amount</span>
                <span className="font-mono text-emerald-700">{formatCurrency(frozenAmount)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={frozenAmount}
                onChange={(e) => setFrozenAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Slider 2: Network Hop Depth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-bold text-gray-700">
                <span>Layering Network Depth</span>
                <span className="font-mono text-blue-700">{networkHops} Hops</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={networkHops}
                onChange={(e) => setNetworkHops(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Slider 3: Time Elapsed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-bold text-gray-700">
                <span>Time Elapsed Since Fraud Transfer</span>
                <span className="font-mono text-amber-700">{hoursElapsed} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="48"
                step="0.5"
                value={hoursElapsed}
                onChange={(e) => setHoursElapsed(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Toggle: Direct Gateway */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <span className="font-bold text-[12px] text-gray-900 block">
                  Direct Bank Compliance Liaison API
                </span>
                <span className="text-[11px] text-gray-500">
                  Instant webhook directive without manual wire delay
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasDirectGateway}
                onChange={(e) => setHasDirectGateway(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
