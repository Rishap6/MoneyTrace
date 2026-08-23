import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  caseData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AICaseSummaryModal: React.FC<Props> = ({ caseData, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !caseData) return null;

  const summaryText =
    caseData.ai_summary ||
    `Victim ${caseData.victim_account || 'ACC1001'} lost ${formatCurrency(
      caseData.total_amount || 150000
    )}.\n\nFunds moved through ${
      caseData.mule_chain_count || 3
    } mule accounts.\n\nCurrent holder: ${
      caseData.current_holder_account || 'ACC5008'
    }.\n\nRecovery probability: ${caseData.recovery_probability || 85}%.\n\nRecommended Action: Freeze destination account immediately under Section 91 CrPC.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                EXECUTIVE BRIEFING
              </span>
              <h3 className="text-[16px] font-bold mt-0.5">AI Case Intelligence Summary</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Victim Lost</span>
              <span className="text-[14px] font-extrabold text-red-600 font-mono mt-0.5 block">
                {formatCurrency(caseData.total_amount || 150000)}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Holding Node</span>
              <span className="text-[13px] font-bold text-blue-700 font-mono mt-0.5 block">
                {caseData.current_holder_account || 'ACC5008'}
              </span>
            </div>

            <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
              <span className="text-[10px] font-bold uppercase text-green-700 block">Recovery Chance</span>
              <span className="text-[14px] font-extrabold text-green-800 font-mono mt-0.5 block">
                {caseData.recovery_probability || 85}%
              </span>
            </div>
          </div>

          {/* AI Narrative Briefing */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-blue-600">auto_awesome</span>
                Synthesized Executive Narrative
              </span>
            </div>
            <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-line font-medium">
              {summaryText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied to Clipboard' : 'Copy Briefing'}</span>
            </button>

            <a
              href={`/reports`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export Legal PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
