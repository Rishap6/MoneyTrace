import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';

interface FraudRing {
  ring_id: string;
  name: string;
  confidence_score: number;
  risk_tier: string;
  leader_account: string;
  leader_name: string;
  total_accounts: number;
  member_accounts: string[];
  path_flow: string[];
  total_volume_moved: number;
  velocity_txns_per_hr: number;
  typology: string;
  recommended_action: string;
}

interface Props {
  onHighlightRing: (accounts: string[]) => void;
  selectedRingId: string | null;
  onSelectRingId: (ringId: string | null) => void;
}

export const FraudRingPanel: React.FC<Props> = ({
  onHighlightRing,
  selectedRingId,
  onSelectRingId,
}) => {
  const [rings, setRings] = useState<FraudRing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<any>('/fraud/rings');
        setRings(res.data?.rings || []);
      } catch (err) {
        console.error('Failed to fetch fraud rings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRings();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[18px]">group_work</span>
          <h3 className="text-[13px] font-bold text-gray-900">Fraud Ring Detection</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
          {rings.length} Active Syndicates
        </span>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-400 text-xs animate-pulse">
          Detecting graph communities & clusters...
        </div>
      ) : rings.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-xs">No active rings detected.</div>
      ) : (
        <div className="space-y-2.5">
          {rings.map((ring) => {
            const isSelected = selectedRingId === ring.ring_id;

            return (
              <div
                key={ring.ring_id}
                className={`p-3 rounded-xl border transition-all space-y-2 ${
                  isSelected
                    ? 'bg-red-50/60 border-red-400 ring-1 ring-red-400'
                    : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-900">{ring.name}</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-extrabold font-mono">
                    {ring.confidence_score}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Leader Hub</span>
                    <span className="font-mono font-bold text-red-700">{ring.leader_account}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Laundered Volume</span>
                    <span className="font-mono font-bold text-gray-900">
                      {formatCurrency(ring.total_volume_moved)}
                    </span>
                  </div>
                </div>

                {/* Member Nodes Path */}
                <div className="pt-1.5 border-t border-gray-200/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 font-mono text-[10px] text-gray-500 overflow-x-auto">
                    {ring.member_accounts.map((acc, i) => (
                      <span key={acc} className="flex items-center">
                        <b className={acc === ring.leader_account ? 'text-red-600' : 'text-gray-700'}>
                          {acc}
                        </b>
                        {i < ring.member_accounts.length - 1 && <span className="mx-1 text-gray-400">→</span>}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (isSelected) {
                        onSelectRingId(null);
                        onHighlightRing([]);
                      } else {
                        onSelectRingId(ring.ring_id);
                        onHighlightRing(ring.member_accounts);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isSelected ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{isSelected ? 'Clear' : 'Highlight'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
