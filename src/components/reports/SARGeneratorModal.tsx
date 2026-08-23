import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Props {
  caseId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SARGeneratorModal: React.FC<Props> = ({
  caseId = 'CASE-2026-0801',
  isOpen,
  onClose,
}) => {
  const [reportingEntity] = useState('HDFC Bank Ltd (Central Compliance Operations)');
  const [reportDate] = useState(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }));
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const reportText = `FINANCIAL INTELLIGENCE UNIT - INDIA (FIU-IND)
SUSPICIOUS TRANSACTION REPORT (STR / SAR)
===================================================
Reference ID: STR-${caseId}-FIU
Date of Transmission: ${reportDate}
Reporting Entity: ${reportingEntity}

1. REASON FOR SUSPICION:
- Coordinated multi-hop mule account layering under Section 3 of PMLA 2002.
- High velocity fund forwarding (>95%) executed within 90 seconds.
- Terminal holding account ACC5008 retains unspent liquidity of ₹1,38,000.

2. SUSPECT / BENEFICIAL OWNER DETAILS:
- Primary Victim: ACC1001 (Rahul Sharma) - ₹1,50,000 Compromised
- Layer 1 Mule: ACC1005 (SBI Delhi) - ₹1,45,000 Forwarded
- Layer 2 Mule: ACC2002 (HDFC Pune) - ₹1,38,000 Forwarded
- Terminal Holder: ACC5008 (Vikram Sethi, ICICI Bangalore) - FROZEN

3. STATUTORY ACTIONS TAKEN:
- Emergency Section 91 CrPC freeze directive issued on ACC5008.
- Assets Preserved: ₹1,38,000 (92% of victim capital).
- Central Fraud Registry (CFR) alert broadcasted.`;

    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  FIU-IND COMPLIANT TEMPLATE
                </span>
                <span className="font-mono text-[11px] text-gray-300">STR-{caseId}</span>
              </div>
              <h3 className="text-[16px] font-bold mt-0.5">Suspicious Transaction Report (STR / SAR)</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 text-[13px]">
          {/* Official Letterhead */}
          <div className="border-b-2 border-gray-900 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                FINANCIAL INTELLIGENCE UNIT – INDIA (FIU-IND)
              </h2>
              <p className="text-[11px] font-semibold text-gray-500">
                Statutory Reporting under Prevention of Money Laundering Act (PMLA), 2002
              </p>
            </div>
            <div className="text-right font-mono text-[11px]">
              <p className="font-bold text-gray-900">FORM STR-1</p>
              <p className="text-gray-500">{reportDate}</p>
            </div>
          </div>

          {/* Section 1: Reporting Entity */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-1 rounded">
              1. Reporting Financial Institution Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[12px] p-2 bg-gray-50 rounded-lg">
              <div>
                <span className="text-gray-400 block text-[10px]">Entity Name</span>
                <span className="font-bold text-gray-900">{reportingEntity}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Reporting Category</span>
                <span className="font-bold text-gray-900">Scheduled Commercial Bank / SOC Portal</span>
              </div>
            </div>
          </div>

          {/* Section 2: Grounds of Suspicion */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-900 bg-red-50 px-2 py-1 rounded">
              2. Grounds of Suspicion (Modus Operandi)
            </h4>
            <div className="p-3 bg-red-50/40 border border-red-200 rounded-lg space-y-1.5 text-[12px] text-gray-700">
              <p>
                • <b>Coordinated Fund Siphoning:</b> Victim <code>ACC1001</code> suffered unauthorized balance debit of <b>{formatCurrency(150000)}</b> following credential theft via deceptive APK.
              </p>
              <p>
                • <b>Rapid Multi-Hop Layering:</b> Within 4 minutes, funds were fragmented and passed through 2 intermediary mule accounts (<code>ACC1005</code>, <code>ACC2002</code>) before pooling into holding account <code>ACC5008</code>.
              </p>
              <p>
                • <b>Syndicate Clustering:</b> Graph pattern topology matches known mule syndicate ring <i>Alpha</i> with <b>92% algorithmic confidence</b>.
              </p>
            </div>
          </div>

          {/* Section 3: Suspect Accounts Ledger Table */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 bg-gray-100 px-2 py-1 rounded">
              3. Suspect & Beneficiary Entity Schedule
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-2">Role</th>
                    <th className="p-2">Account Number</th>
                    <th className="p-2">Bank / IFSC</th>
                    <th className="p-2">Amount In/Out</th>
                    <th className="p-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-2 font-bold text-red-600">Victim</td>
                    <td className="p-2 font-mono">ACC1001</td>
                    <td className="p-2">HDFC Bank</td>
                    <td className="p-2 font-mono font-bold">- {formatCurrency(150000)}</td>
                    <td className="p-2"><span className="text-gray-600">Active</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-amber-600">Mule Layer 1</td>
                    <td className="p-2 font-mono">ACC1005</td>
                    <td className="p-2">SBI (Delhi)</td>
                    <td className="p-2 font-mono font-bold">₹1,45,000 (Pass-thru)</td>
                    <td className="p-2"><span className="text-amber-700 font-bold">Under Monitoring</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-amber-600">Mule Layer 2</td>
                    <td className="p-2 font-mono">ACC2002</td>
                    <td className="p-2">HDFC (Pune)</td>
                    <td className="p-2 font-mono font-bold">₹1,38,000 (Pass-thru)</td>
                    <td className="p-2"><span className="text-amber-700 font-bold">Under Monitoring</span></td>
                  </tr>
                  <tr className="bg-red-50/50">
                    <td className="p-2 font-bold text-purple-700">Terminal Holder</td>
                    <td className="p-2 font-mono font-bold text-purple-900">ACC5008</td>
                    <td className="p-2">ICICI Bank (BLR)</td>
                    <td className="p-2 font-mono font-extrabold text-green-700">+ {formatCurrency(138000)} Retained</td>
                    <td className="p-2"><span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">FROZEN (Sec 91)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Directives Mandate */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-900 bg-green-50 px-2 py-1 rounded">
              4. Statutory Directives & Preservation Outcome
            </h4>
            <div className="p-3 bg-green-50/50 border border-green-200 rounded-lg text-[12px] space-y-1">
              <p className="font-semibold text-green-900">
                ✓ Emergency Section 91 CrPC freeze executed on ACC5008.
              </p>
              <p className="text-green-800">
                Preserved Capital: <b>{formatCurrency(138000)}</b> (92% of stolen funds secured before off-ramp).
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">
              {isCopied ? 'check' : 'content_copy'}
            </span>
            <span>{isCopied ? 'Copied to Clipboard' : 'Copy STR Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
