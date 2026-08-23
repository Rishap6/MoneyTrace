import React, { useState } from 'react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { soundAlarm } from '../../utils/soundAlarm';

interface Props {
  alertId?: string;
  stolenAmount?: number;
  currentHolder?: string;
  holderBank?: string;
  recoveryProbability?: number;
  onFreezeSuccess?: (accountNumber: string) => void;
}

export const RecoveryCommandCenter: React.FC<Props> = ({
  alertId = 'ALT2026081601',
  stolenAmount = 150000,
  currentHolder = 'ACC5008',
  holderBank = 'ICICI Bank (Bangalore)',
  recoveryProbability = 92,
  onFreezeSuccess,
}) => {
  const [isFreezing, setIsFreezing] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [preservedAmount, setPreservedAmount] = useState<number | null>(null);

  const handleExecuteFreeze = async () => {
    setIsFreezing(true);
    try {
      const res = await api.post(`/users/accounts/${currentHolder}/freeze`, {
        reason: `Emergency Freeze Directive issued from SOC Recovery Command Center for Alert ${alertId}`,
      });
      setIsFrozen(true);
      setPreservedAmount((res.data as any)?.balance_preserved || stolenAmount * 0.92);
      soundAlarm.playSuccessChime();
      if (onFreezeSuccess) onFreezeSuccess(currentHolder);
    } catch (err) {
      console.error('Failed to freeze account:', err);
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden shadow-elevated bg-gradient-to-r from-red-950/90 via-slate-900 to-indigo-950/90 border-red-500/60 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Info Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-400 font-mono text-[10px] font-extrabold tracking-widest uppercase animate-pulse">
              🚨 ACTIVE INCIDENT INTERCEPTOR
            </span>
            <span className="text-[11px] font-bold text-gray-400 font-mono">
              ALERT: {alertId}
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>Critical Fund Siphon in Progress</span>
            <span className="text-red-400 font-mono text-base">({formatCurrency(stolenAmount)})</span>
          </h3>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[12px]">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Holding Node</span>
              <span className="font-mono font-extrabold text-amber-400 block mt-0.5">
                {currentHolder}
              </span>
              <span className="text-[10px] text-gray-400 truncate block">{holderBank}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Recovery Window</span>
              <span className="font-mono font-extrabold text-emerald-400 block mt-0.5">
                {recoveryProbability}% Likelihood
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold">Active &lt; 2h Window</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Recommended Directive</span>
              <span className="font-bold text-red-400 block mt-0.5 text-[11px]">
                Section 91 CrPC Freeze
              </span>
              <span className="text-[10px] text-gray-400">Halts Outbound Routing</span>
            </div>
          </div>
        </div>

        {/* Right Action Button Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 flex-shrink-0">
          {isFrozen ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-center space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-1.5 font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>ACCOUNT FROZEN</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-200">
                Preserved: {formatCurrency(preservedAmount || stolenAmount * 0.92)}
              </p>
            </div>
          ) : (
            <button
              onClick={handleExecuteFreeze}
              disabled={isFreezing}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold text-[13px] rounded-xl shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] border border-red-400/40"
            >
              <span className="material-symbols-outlined text-[20px] animate-spin-slow">
                {isFreezing ? 'sync' : 'ac_unit'}
              </span>
              <span>{isFreezing ? 'Executing Directive...' : `Freeze ${currentHolder} Now`}</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full justify-end text-[11px]">
            <a
              href="/flow"
              className="text-gray-300 hover:text-white underline font-semibold flex items-center gap-1"
            >
              <span>View Money Trail Graph</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
