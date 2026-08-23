import React, { useState } from 'react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  caseId: string;
  defaultTargetAccount?: string;
  isOpen: boolean;
  onClose: () => void;
  onFreezeExecuted?: (targetAccount: string) => void;
}

export const WhatIfSimulatorModal: React.FC<Props> = ({
  caseId,
  defaultTargetAccount = 'ACC5008',
  isOpen,
  onClose,
  onFreezeExecuted,
}) => {
  const [targetAccount, setTargetAccount] = useState(defaultTargetAccount);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecutingFreeze, setIsExecutingFreeze] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post(`/investigation/${caseId}/simulate-freeze`, {
        target_account: targetAccount.trim().toUpperCase(),
      });
      setSimulationResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecuteRealFreeze = async () => {
    setIsExecutingFreeze(true);
    try {
      await api.post(`/users/accounts/${targetAccount.trim().toUpperCase()}/freeze`, {
        reason: `Emergency Freeze Directive issued from Investigation Case ${caseId}`,
      });
      setFreezeSuccess(true);
      if (onFreezeExecuted) onFreezeExecuted(targetAccount);
    } catch (err) {
      console.error('Freeze error:', err);
    } finally {
      setIsExecutingFreeze(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[24px]">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  AI DECISION SIMULATOR
                </span>
              </div>
              <h3 className="text-[16px] font-bold mt-0.5">"What-If" Freeze Intelligence Engine</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Target Account Input & Action */}
          <div className="flex flex-col sm:flex-row items-end gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                Candidate Account to Simulate Freeze
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  account_balance
                </span>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => {
                    setTargetAccount(e.target.value);
                    setSimulationResult(null);
                  }}
                  placeholder="e.g. ACC5008"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 font-mono text-[13px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating || !targetAccount.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-[13px] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSimulating ? 'refresh' : 'play_arrow'}
              </span>
              <span>{isSimulating ? 'Computing...' : 'Simulate Freeze'}</span>
            </button>
          </div>

          {/* Simulation Output */}
          {simulationResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Preserved Capital */}
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-1">
                  <div className="flex items-center justify-between text-green-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Potentially Preserved</span>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <p className="text-xl font-extrabold text-green-800 font-mono">
                    {formatCurrency(simulationResult.preserved_amount)}
                  </p>
                  <p className="text-[11px] text-green-600 font-medium">82% of Stolen Capital</p>
                </div>

                {/* Remaining Exposed */}
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
                  <div className="flex items-center justify-between text-red-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Remaining Exposed</span>
                    <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                  </div>
                  <p className="text-xl font-extrabold text-red-800 font-mono">
                    {formatCurrency(simulationResult.remaining_exposed)}
                  </p>
                  <p className="text-[11px] text-red-600 font-medium">Secondary Mule Layer</p>
                </div>

                {/* Recovery Probability Jump */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-blue-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Recovery Surge</span>
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  </div>
                  <p className="text-xl font-extrabold text-blue-800 font-mono">
                    {simulationResult.current_recovery_rate}% →{' '}
                    <span className="text-green-600">{simulationResult.projected_recovery_rate}%</span>
                  </p>
                  <p className="text-[11px] text-blue-700 font-bold">
                    Gain: {simulationResult.probability_gain}
                  </p>
                </div>
              </div>

              {/* Directive Card */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-[22px] mt-0.5">
                  lightbulb
                </span>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-bold text-amber-900 uppercase tracking-wide">
                    AI Decision Recommendation
                  </h4>
                  <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                    {simulationResult.recommended_directive}
                  </p>
                </div>
              </div>

              {/* Execute Real Directive Button */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-[13px] font-bold text-gray-900">Authorize Freeze Directive</h5>
                  <p className="text-[11px] text-gray-500">
                    Broadcasts ACCOUNT_FROZEN and issues Section 91 CrPC notice.
                  </p>
                </div>

                <button
                  onClick={handleExecuteRealFreeze}
                  disabled={isExecutingFreeze || freezeSuccess}
                  className={`px-5 py-2.5 font-bold rounded-lg text-[12px] flex items-center justify-center gap-2 transition-all ${
                    freezeSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {freezeSuccess ? 'check_circle' : 'ac_unit'}
                  </span>
                  <span>
                    {freezeSuccess
                      ? 'Account Successfully Frozen!'
                      : isExecutingFreeze
                      ? 'Executing...'
                      : `Freeze ${targetAccount} Now`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
