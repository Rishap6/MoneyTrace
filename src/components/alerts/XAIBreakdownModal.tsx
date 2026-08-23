import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alertData?: any;
}

export const XAIBreakdownModal: React.FC<Props> = ({ isOpen, onClose, alertData }) => {
  if (!isOpen || !alertData) return null;

  const score = alertData.risk_score || 92;
  const amount = alertData.amount || alertData.total_amount || 150000;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                EXPLAINABLE AI (XAI)
              </span>
              <h3 className="text-[16px] font-bold mt-0.5">Why Was This Flagged?</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Risk Score Summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200">
            <div>
              <span className="text-[11px] font-bold uppercase text-red-900 tracking-wider">
                Anomaly Confidence Index
              </span>
              <p className="text-2xl font-extrabold text-red-700 font-mono mt-0.5">{score} / 100</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-gray-500">Transaction Volume</span>
              <p className="text-[14px] font-bold text-gray-900 font-mono mt-0.5">{formatCurrency(amount)}</p>
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-3.5">
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">
              Feature Importance & Weight Attributions
            </h4>

            <div>
              <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Large Transfer Anomaly (&gt; ₹50,000)
                </span>
                <span className="font-mono text-red-600 font-bold">40% (+40 Risk)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Rapid Velocity (3 Transfers in 5 Min)
                </span>
                <span className="font-mono text-amber-600 font-bold">25% (+25 Risk)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  New Beneficiary Account (&lt; 7 Days Old)
                </span>
                <span className="font-mono text-blue-600 font-bold">20% (+20 Risk)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Known Mule Ring Graph Topology Match
                </span>
                <span className="font-mono text-purple-600 font-bold">15% (+15 Risk)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          {/* Compliance & SOP Directives */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-[12px] space-y-1">
            <span className="text-[10px] font-bold uppercase text-gray-500 block">
              Regulatory Context (RBI & PMLA 2002)
            </span>
            <p className="text-gray-700 leading-relaxed font-medium">
              High risk score meets the mandatory threshold under RBI Master Direction on Cyber Fraud Prevention for immediate beneficiary account verification and SAR filing.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
