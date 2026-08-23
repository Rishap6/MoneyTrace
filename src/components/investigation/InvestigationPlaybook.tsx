import React, { useState } from 'react';
import { api } from '../../api';

export interface PlaybookStep {
  id: string;
  step_order: number;
  step_key: string;
  title: string;
  description: string;
  status: string; // PENDING, IN_PROGRESS, COMPLETED, SKIPPED
  action_type: string;
  completed_at?: string | null;
  completed_by?: string | null;
}

interface Props {
  caseId: string;
  steps: PlaybookStep[];
  onStepUpdated: () => void;
  onActionTrigger?: (actionType: string) => void;
}

export const InvestigationPlaybook: React.FC<Props> = ({
  caseId,
  steps,
  onStepUpdated,
  onActionTrigger,
}) => {
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  const handleToggleStep = async (step: PlaybookStep) => {
    const nextStatus = step.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setUpdatingStepId(step.id);
    try {
      await api.patch(`/investigation/${caseId}/playbook/${step.id}`, {
        status_val: nextStatus,
      });
      onStepUpdated();
    } catch (err) {
      console.error('Failed to update playbook step:', err);
    } finally {
      setUpdatingStepId(null);
    }
  };

  const getActionBtnLabel = (actionType: string) => {
    switch (actionType) {
      case 'VERIFY':
        return 'Verify Alert';
      case 'GRAPH_TRACE':
        return 'View Money Trail';
      case 'HOLDER_LOOKUP':
        return 'Inspect Holder';
      case 'FREEZE_DIRECTIVE':
        return 'Simulate / Freeze';
      case 'EXPORT_PDF':
        return 'Generate Dossier';
      default:
        return 'Execute Action';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'VERIFY':
        return 'fact_check';
      case 'GRAPH_TRACE':
        return 'route';
      case 'HOLDER_LOOKUP':
        return 'person_search';
      case 'FREEZE_DIRECTIVE':
        return 'ac_unit';
      case 'EXPORT_PDF':
        return 'picture_as_pdf';
      default:
        return 'play_arrow';
    }
  };

  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-5">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">assignment_turned_in</span>
            <h3 className="text-[14px] font-bold text-gray-900">Standard Forensic Playbook</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide">
              FINANCIAL FRAUD RECOVERY
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Sequential investigative milestones for evidentiary chain of custody and recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-gray-500">Progress</span>
            <span className="text-[13px] font-bold text-gray-900 block font-mono">
              {completedCount} of {steps.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playbook Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isDone
                  ? 'bg-green-50/40 border-green-200'
                  : isInProgress
                  ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                  : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Step Checkbox Button */}
                  <button
                    onClick={() => handleToggleStep(step)}
                    disabled={updatingStepId === step.id}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'border-2 border-gray-300 hover:border-blue-500 text-transparent'
                    }`}
                    title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isDone ? 'check' : 'check_box_outline_blank'}
                    </span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-[13px] font-bold ${
                          isDone ? 'text-gray-900 line-through text-opacity-70' : 'text-gray-900'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isDone
                            ? 'bg-green-100 text-green-700'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1">{step.description}</p>
                    {step.completed_by && isDone && (
                      <p className="text-[11px] text-green-700 font-medium mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Verified by {step.completed_by}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Action Trigger */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {onActionTrigger && (
                    <button
                      onClick={() => onActionTrigger(step.action_type)}
                      className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        {getActionIcon(step.action_type)}
                      </span>
                      <span>{getActionBtnLabel(step.action_type)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
