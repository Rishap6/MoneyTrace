import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatDate } from '../utils/formatters';

interface AuditLogItem {
  id: string;
  user_name: string;
  user_email?: string | null;
  user_role: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: any;
  ip_address?: string | null;
  timestamp: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>('/audit-logs', {
        params: {
          search: search || undefined,
          action: actionFilter || undefined,
        },
      });
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('FREEZE') || action.includes('CRITICAL')) {
      return 'bg-red-50 text-red-700 border-red-200';
    } else if (action.includes('CASE') || action.includes('PLAYBOOK')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (action.includes('REPORT') || action.includes('EVIDENCE')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (action.includes('LOGIN') || action.includes('PIN')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Enterprise Audit Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
              IMMUTABLE CHAIN OF CUSTODY
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Complete compliance trail recording logins, case notes, freeze directives, playbook updates, and report exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
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
            placeholder="Search investigator, action, or case target..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-700 font-medium"
          >
            <option value="">All Action Types</option>
            <option value="LOGIN">User Logins</option>
            <option value="CASE_CREATED">Case Created</option>
            <option value="ACCOUNT_FROZEN">Account Freeze Directives</option>
            <option value="REPORT_GENERATED">Report Exports</option>
            <option value="NOTE_ADDED">Notes Logged</option>
            <option value="PIN_SET">Security PIN Setup</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50/70 text-gray-500 font-bold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP / Client</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 animate-pulse">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No audit logs matching current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[12px] text-gray-600">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{log.user_name}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{log.user_role}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <span className="text-[10px] font-semibold uppercase text-gray-400 mr-1.5">
                        {log.target_type}:
                      </span>
                      {log.target_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-gray-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">Audit Record</span>
                <h3 className="text-[15px] font-bold text-gray-900">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-[12px]">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Actor</span>
                  <span className="font-bold text-gray-900">{selectedLog.user_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Role</span>
                  <span className="font-bold text-gray-900 capitalize">{selectedLog.user_role}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Target Entity</span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedLog.target_type}: {selectedLog.target_id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Client IP</span>
                  <span className="font-mono text-gray-700">{selectedLog.ip_address || '127.0.0.1'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Event Payload Metadata
                </span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
