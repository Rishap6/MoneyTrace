import React, { useState } from 'react';
import type { LayoutResultNode, AggregatedEdge } from '../../utils/graphLayouts';
import { NODE_THEMES } from './GraphCanvas';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../api';

export interface NodeInspectorProps {
  node: LayoutResultNode | null;
  edges: AggregatedEdge[];
  onClose: () => void;
  onTraceAccount: (accountId: string) => void;
  onFocusCounterparty: (accountId: string) => void;
  onAskCopilot: (question: string) => void;
  onFreezeAccount?: (accountId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  edges,
  onClose,
  onTraceAccount,
  onFocusCounterparty,
  onAskCopilot,
  onFreezeAccount,
}) => {
  const [isFreezing, setIsFreezing] = useState(false);
  const [frozenLocal, setFrozenLocal] = useState(false);

  if (!node) return null;

  const isFrozen = node.status === 'frozen' || frozenLocal;
  const theme = NODE_THEMES[node.type] || NODE_THEMES.normal;
  const risk = node.risk_score ?? 0;

  // Inflow edges (incoming) & Outflow edges (outgoing)
  const incomingEdges = edges.filter(e => e.target === node.id);
  const outgoingEdges = edges.filter(e => e.source === node.id);

  const handleExecuteFreeze = async () => {
    setIsFreezing(true);
    try {
      await api.post(`/users/accounts/${node.id}/freeze`, {
        reason: `Emergency Freeze Directive issued from Graph Node Inspector for Account ${node.id}`,
      });
      setFrozenLocal(true);
      if (onFreezeAccount) onFreezeAccount(node.id);
    } catch (err) {
      console.error('Failed to freeze account:', err);
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <div className="w-88 max-w-sm bg-white border border-gray-200 rounded-xl shadow-card flex flex-col animate-in slide-in-from-right-4 duration-300 overflow-hidden">
      {/* ───── Header ───── */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between relative">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: isFrozen ? '#0284C7' : theme.border }}
        />
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
              isFrozen ? 'bg-sky-600' : ''
            }`}
            style={{ backgroundColor: isFrozen ? undefined : theme.bg }}
          >
            <span className="material-symbols-outlined text-2xl">
              {isFrozen ? 'ac_unit' : theme.icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-gray-900 text-sm">{node.id}</h3>
              <span
                className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  isFrozen
                    ? 'bg-sky-100 text-sky-800 border-sky-300 font-mono'
                    : ''
                }`}
                style={
                  isFrozen
                    ? undefined
                    : {
                        color: theme.border,
                        borderColor: `${theme.border}60`,
                        backgroundColor: `${theme.bg}20`,
                      }
                }
              >
                {isFrozen ? 'FROZEN (SEC 91)' : node.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">{node.user_name || 'Anonymous Entity'}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* ───── Scrollable Body ───── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Risk Score Meter */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              Threat Assessment
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                risk >= 75 ? 'text-red-600' : risk >= 40 ? 'text-amber-600' : 'text-green-600'
              }`}
            >
              {risk} / 100
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                risk >= 75
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : risk >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${risk}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">
            {risk >= 75
              ? '🚨 High confidence mule or illicit fund accumulation hub.'
              : risk >= 40
              ? '⚠️ Rapid transaction velocity or structuring behavior detected.'
              : '✅ Baseline activity within normal operational parameters.'}
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Current Balance</span>
            <span className="font-mono font-bold text-gray-900 text-xs">{formatCurrency(node.balance ?? 0)}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Account Status</span>
            <span
              className={`font-mono font-bold text-xs uppercase ${
                isFrozen ? 'text-sky-700 font-extrabold' : 'text-green-600'
              }`}
            >
              {isFrozen ? 'FROZEN' : node.status || 'ACTIVE'}
            </span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Total Inflow</span>
            <span className="font-mono font-bold text-blue-600 text-xs">{formatCurrency(node.total_inflow)}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Total Outflow</span>
            <span className="font-mono font-bold text-amber-600 text-xs">{formatCurrency(node.total_outflow)}</span>
          </div>
        </div>

        {/* ───── Device Intelligence ───── */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-purple-600">devices</span>
              Device Fingerprint Intelligence
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
              <span className="text-gray-700">✓ Redmi Note 13 (Android 14)</span>
              <span className="text-green-700 font-bold text-[10px]">Trusted Device</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
              <span>⚠ Samsung Galaxy A15</span>
              <span className="font-mono font-bold text-[10px] text-red-600">+15 Risk (New Swap)</span>
            </div>
          </div>
        </div>

        {/* ───── Account Forensic Timeline ───── */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-blue-600">history</span>
            Forensic Account Lifecycle
          </span>

          <div className="space-y-2 text-[11px] pl-2 border-l-2 border-gray-200">
            <div>
              <span className="text-gray-400 text-[10px]">10:20 AM</span>
              <p className="font-semibold text-gray-800">Account Active / Normal Inflow</p>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">10:21 AM</span>
              <p className="font-semibold text-red-600">Large Transfer Spike (₹1,50,000)</p>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">10:22 AM</span>
              <p className="font-semibold text-amber-700">Rapid Velocity Pass-Through (96%)</p>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">10:27 AM</span>
              <p className={`font-semibold ${isFrozen ? 'text-sky-700' : 'text-purple-700'}`}>
                {isFrozen ? '❄️ Frozen Under Section 91 CrPC' : 'Recovery Window Open'}
              </p>
            </div>
          </div>
        </div>

        {/* Counterparties: Incoming Senders */}
        {incomingEdges.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
              Incoming Senders ({incomingEdges.length})
            </span>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {incomingEdges.map(e => (
                <div
                  key={e.id}
                  onClick={() => onFocusCounterparty(e.source)}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <span className="font-mono text-blue-600 text-[10px] truncate max-w-[100px]">{e.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 text-[10px] font-bold">{formatCurrency(e.totalAmount)}</span>
                    <span className="material-symbols-outlined text-xs text-gray-400">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Counterparties: Outgoing Receivers */}
        {outgoingEdges.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
              Outgoing Receivers ({outgoingEdges.length})
            </span>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {outgoingEdges.map(e => (
                <div
                  key={e.id}
                  onClick={() => onFocusCounterparty(e.target)}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <span className="font-mono text-red-600 text-[10px] truncate max-w-[100px]">{e.target}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 text-[10px] font-bold">{formatCurrency(e.totalAmount)}</span>
                    <span className="material-symbols-outlined text-xs text-gray-400">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investigator Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onTraceAccount(node.id)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">route</span>
            Trace Money Trail from {node.id}
          </button>

          <button
            onClick={() => onAskCopilot(`Explain the risk factors and transaction pattern for account ${node.id} (${node.user_name || 'unnamed'})`)}
            className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs border border-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-purple-600">psychology</span>
            Ask AI Copilot About Account
          </button>

          {!isFrozen && (
            <button
              onClick={handleExecuteFreeze}
              disabled={isFreezing}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {isFreezing ? 'sync' : 'ac_unit'}
              </span>
              <span>{isFreezing ? 'Executing Freeze...' : 'Emergency Freeze Account'}</span>
            </button>
          )}

          {isFrozen && (
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-center font-bold text-[11px] flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-sky-600">verified</span>
              <span>Account Frozen • Outbound Blocked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeInspector;
