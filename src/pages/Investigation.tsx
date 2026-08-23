import React, { useState } from 'react';
import { useInvestigations, useInvestigationDetail, useInvestigationFilters } from '../hooks/useInvestigations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { InvestigationPlaybook } from '../components/investigation/InvestigationPlaybook';
import { InvestigatorNotes } from '../components/investigation/InvestigatorNotes';
import { EvidenceLocker } from '../components/investigation/EvidenceLocker';
import { WhatIfSimulatorModal } from '../components/investigation/WhatIfSimulatorModal';
import { SimilarCasesCard } from '../components/investigation/SimilarCasesCard';
import { AICaseSummaryModal } from '../components/investigation/AICaseSummaryModal';
import { api } from '../api';

export const Investigation: React.FC = () => {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useInvestigationFilters();
  const { data, isLoading, error, refetch: refetchList } = useInvestigations(filters);

  // Selected case state for master-detail view
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const { data: caseDetail, refetch: refetchDetail } = useInvestigationDetail(selectedCaseId);

  // Active Dossier Tab
  const [activeTab, setActiveTab] = useState<'playbook' | 'timeline' | 'evidence' | 'similar'>('playbook');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // New Case Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('150000');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newVictim, setNewVictim] = useState('ACC1001');
  const [newHolder, setNewHolder] = useState('ACC5008');

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>('/investigation', {
        title: newTitle,
        description: newDesc,
        total_amount: parseFloat(newAmount) || 150000,
        priority: newPriority,
        victim_account: newVictim,
        current_holder_account: newHolder,
        assign_to_self: true,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      refetchList();
      if (res.data?.case_number) setSelectedCaseId(res.data.case_number);
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseDetail) return;
    try {
      await api.patch(`/investigation/${caseDetail.case_number}`, {
        status: newStatus,
      });
      refetchDetail();
      refetchList();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAssignChange = async (analystName: string) => {
    if (!caseDetail) return;
    try {
      await api.patch(`/investigation/${caseDetail.case_number}`, {
        priority: caseDetail.priority,
      });
      refetchDetail();
    } catch (err) {
      console.error('Failed to update assignment:', err);
    }
  };

  const handleActionTrigger = (actionType: string) => {
    if (actionType === 'FREEZE_DIRECTIVE') {
      setShowWhatIfModal(true);
    } else if (actionType === 'GRAPH_TRACE') {
      window.location.href = `/flow`;
    } else if (actionType === 'EXPORT_PDF') {
      window.location.href = `/reports`;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Case Investigation Dossier</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Enterprise SOC Hub
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Forensic case management, interactive recovery playbooks, evidence lockers, and What-If intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Total Active Cases</span>
          <p className="text-xl font-bold text-gray-900 mt-1 font-mono">{data?.total ?? '—'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Open Detections</span>
          <p className="text-xl font-bold text-blue-600 mt-1 font-mono">{data?.open_count ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">In-Progress Tracing</span>
          <p className="text-xl font-bold text-amber-600 mt-1 font-mono">{data?.in_progress_count ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 block">Recovered & Resolved</span>
          <p className="text-xl font-bold text-green-600 mt-1 font-mono">{data?.closed_30d ?? 0}</p>
        </div>
      </div>

      {/* Main Grid: Master Case List (Left 4 cols) & Detail Dossier (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Case Browser / Filter List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-900">Cases ({data?.total || 0})</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search case, title, account..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-[12px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RECOVERED">Recovered</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-700"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 text-xs animate-pulse">
                Loading active cases...
              </div>
            ) : data?.investigations?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-200">
                No cases found.
              </div>
            ) : (
              data?.investigations?.map((inv: any) => {
                const isSelected = selectedCaseId === inv.case_number || selectedCaseId === inv.id;
                const isCrit = inv.priority === 'critical';

                return (
                  <div
                    key={inv.id || inv.case_number}
                    onClick={() => setSelectedCaseId(inv.case_number)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {inv.case_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCrit ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.priority}
                      </span>
                    </div>

                    <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{inv.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{inv.description}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="font-mono font-bold text-gray-900">
                        {formatCurrency(inv.total_amount || 0)}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        {inv.playbook_progress} Steps
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Comprehensive Case Dossier (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {caseDetail ? (
            <div className="space-y-5">
              {/* Dossier Top Banner */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[12px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                        {caseDetail.case_number}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                        {caseDetail.priority} PRIORITY
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        STATUS: {caseDetail.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mt-2">{caseDetail.title}</h2>
                    <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                      {caseDetail.description}
                    </p>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowSummaryModal(true)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[12px] flex items-center gap-1.5 transition-colors border border-blue-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      <span>AI Briefing</span>
                    </button>
                    <button
                      onClick={() => setShowWhatIfModal(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[12px] flex items-center gap-1.5 transition-colors border border-indigo-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">science</span>
                      <span>"What-If" Freeze</span>
                    </button>
                  </div>
                </div>

                {/* Case Metadata Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-[12px]">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Total At Risk</span>
                    <span className="font-mono text-[13px] font-bold text-gray-900 block mt-0.5">
                      {formatCurrency(caseDetail.total_amount)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Terminal Holder</span>
                    <span className="font-mono text-[13px] font-bold text-red-600 block mt-0.5">
                      {caseDetail.current_holder_account}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-[10px] font-bold uppercase text-green-700 block">Recovery Probability</span>
                    <span className="font-mono text-[13px] font-extrabold text-green-800 block mt-0.5">
                      {caseDetail.recovery_probability}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Assigned Analyst</span>
                    <span className="text-[12px] font-bold text-gray-800 block mt-0.5 truncate">
                      {caseDetail.assigned_to?.full_name || 'Alok Khatri'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dossier Tabs Header */}
              <div className="flex border-b border-gray-200 gap-2">
                <button
                  onClick={() => setActiveTab('playbook')}
                  className={`pb-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'playbook'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                  <span>Playbook & Directives</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                  <span>Timeline & Notes ({caseDetail.notes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`pb-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'evidence'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Evidence Locker ({caseDetail.evidence?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('similar')}
                  className={`pb-3 px-3 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'similar'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                  <span>Similar Precedents</span>
                </button>
              </div>

              {/* Tab 1: Playbook */}
              {activeTab === 'playbook' && (
                <div className="space-y-5">
                  <InvestigationPlaybook
                    caseId={caseDetail.case_number}
                    steps={caseDetail.playbook_steps || []}
                    onStepUpdated={refetchDetail}
                    onActionTrigger={handleActionTrigger}
                  />
                </div>
              )}

              {/* Tab 2: Timeline & Notes */}
              {activeTab === 'timeline' && (
                <div className="space-y-5">
                  {/* Investigator Chronological Milestone Timeline */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">history</span>
                      <h3 className="text-[14px] font-bold text-gray-900">Case Chronology Stream</h3>
                    </div>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                      {caseDetail.timeline_events?.map((evt: any) => (
                        <div key={evt.id} className="relative group">
                          <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white text-[12px] shadow-sm">
                            <span className="material-symbols-outlined text-[12px]">{evt.icon || 'info'}</span>
                          </span>
                          <div>
                            <span className="text-[12px] font-bold text-gray-900">{evt.title}</span>
                            <p className="text-[12px] text-gray-600 mt-0.5">{evt.description}</p>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                              Actor: {evt.actor_name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investigator Notes */}
                  <InvestigatorNotes
                    caseId={caseDetail.case_number}
                    notes={caseDetail.notes || []}
                    onNoteAdded={refetchDetail}
                  />
                </div>
              )}

              {/* Tab 3: Evidence Locker */}
              {activeTab === 'evidence' && (
                <EvidenceLocker
                  caseId={caseDetail.case_number}
                  evidence={caseDetail.evidence || []}
                  onEvidenceAdded={refetchDetail}
                />
              )}

              {/* Tab 4: Similar Cases & Risk Attribution */}
              {activeTab === 'similar' && (
                <div className="space-y-5">
                  <SimilarCasesCard caseId={caseDetail.case_number} />

                  {/* Explainable AI Risk Factor Weights */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600 text-[20px]">analytics</span>
                        <h3 className="text-[14px] font-bold text-gray-900">Explainable AI Risk Attribution Breakdown</h3>
                      </div>
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono">
                        Composite Risk: 92/100
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                          <span>Large Transfer Anomaly (&gt; ₹50,000)</span>
                          <span className="font-mono text-red-600 font-bold">40% Factor Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                          <span>Rapid Pass-Through Velocity (3 Hops in 5 Min)</span>
                          <span className="font-mono text-amber-600 font-bold">25% Factor Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                          <span>New Unverified Beneficiary Node</span>
                          <span className="font-mono text-blue-600 font-bold">20% Factor Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[12px] font-semibold text-gray-700 mb-1">
                          <span>Known Mule Ring Topology Match</span>
                          <span className="font-mono text-purple-600 font-bold">15% Factor Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-card space-y-3">
              <span className="material-symbols-outlined text-[48px] text-gray-300">folder_open</span>
              <h3 className="text-base font-bold text-gray-900">Select an Investigation Case</h3>
              <p className="text-[13px] text-gray-500 max-w-md mx-auto">
                Choose a case from the list on the left to inspect its active forensic playbook, timeline events, evidence locker, and AI simulations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Case Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900">Open New Investigation Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Syndicate Alpha: High-Velocity Fund Siphon"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe initial anomaly and suspected victim account..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Victim Account</label>
                  <input
                    type="text"
                    value={newVictim}
                    onChange={(e) => setNewVictim(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Suspect Holder</label>
                  <input
                    type="text"
                    value={newHolder}
                    onChange={(e) => setNewHolder(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[13px] text-gray-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold"
                >
                  Initialize Case Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* What-If Simulation Modal */}
      <WhatIfSimulatorModal
        caseId={caseDetail?.case_number || 'CASE-2026-0801'}
        defaultTargetAccount={caseDetail?.current_holder_account || 'ACC5008'}
        isOpen={showWhatIfModal}
        onClose={() => setShowWhatIfModal(false)}
        onFreezeExecuted={() => {
          refetchDetail();
          refetchList();
        }}
      />

      {/* AI Case Summary Modal */}
      <AICaseSummaryModal
        caseData={caseDetail}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
};

export default Investigation;