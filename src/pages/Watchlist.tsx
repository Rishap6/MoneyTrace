import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency, formatDate } from '../utils/formatters';

interface WatchlistAccount {
  id: string;
  account_number: string;
  account_holder_name: string;
  bank_name: string;
  risk_tier: string;
  risk_score: number;
  reason: string;
  typology: string;
  is_active: boolean;
  flagged_by: string;
  total_flagged_transactions: number;
  total_flagged_volume: number;
  added_at: string;
}

export const Watchlist: React.FC = () => {
  const [accounts, setAccounts] = useState<WatchlistAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskTier, setRiskTier] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [tier, setTier] = useState('HIGH');
  const [reason, setReason] = useState('');
  const [typology, setTypology] = useState('Mule Account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/watchlist', {
        params: {
          search: search || undefined,
          risk_tier: riskTier || undefined,
        },
      });
      setAccounts(res.data?.watchlist || []);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [search, riskTier]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/watchlist', {
        account_number: accountNumber.trim().toUpperCase(),
        account_holder_name: holderName.trim() || `Holder of ${accountNumber}`,
        bank_name: bankName,
        risk_tier: tier,
        reason: reason.trim() || 'Suspect mule holding account.',
        typology: typology,
      });
      setShowAddModal(false);
      setAccountNumber('');
      setHolderName('');
      setReason('');
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (accNum: string) => {
    try {
      await api.delete(`/watchlist/${accNum}`);
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to deactivate watchlist entry:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Suspect Account Watchlist</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Active Interception
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Real-time registry of suspect mule nodes and high-velocity laundering accounts monitored across the banking network.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_moderator</span>
          <span>Add Suspect Node</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account number, holder, or reason..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={riskTier}
            onChange={(e) => setRiskTier(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-700 font-medium"
          >
            <option value="">All Risk Tiers</option>
            <option value="CRITICAL">Critical Tier</option>
            <option value="HIGH">High Tier</option>
            <option value="MEDIUM">Medium Tier</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50/70 text-gray-500 font-bold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Suspect Account</th>
                <th className="py-3 px-4">Holder & Bank</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Typology & Reason</th>
                <th className="py-3 px-4">Flagged Volume</th>
                <th className="py-3 px-4">Flagged By</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 animate-pulse">
                    Loading watchlist accounts...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No accounts currently on watchlist.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const isCrit = acc.risk_tier === 'CRITICAL';
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {acc.account_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{acc.account_holder_name}</p>
                        <p className="text-[11px] text-gray-400">{acc.bank_name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCrit
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {acc.risk_tier} ({acc.risk_score}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-gray-100 text-gray-700 block w-fit mb-0.5">
                          {acc.typology}
                        </span>
                        <p className="text-[12px] text-gray-600 line-clamp-2">{acc.reason}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {formatCurrency(acc.total_flagged_volume)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 text-[12px]">
                        <p className="font-medium text-gray-900">{acc.flagged_by}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(acc.added_at)}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeactivate(acc.account_number)}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-gray-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900">Add Account to Watchlist</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. ACC1005"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="e.g. Vikas Dubey (Suspect Mule)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Risk Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Reason for Watchlist
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe suspicious velocity, known mule connections..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[13px] font-semibold"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
