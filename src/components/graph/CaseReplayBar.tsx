import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

export interface ReplayStep {
  step_index: number;
  time_offset: string;
  timestamp: string;
  source_node: string;
  target_node: string;
  amount: number;
  action: string;
  risk_score: number;
}

interface Props {
  steps?: ReplayStep[];
  onStepChange: (stepIndex: number, currentStep: ReplayStep | null) => void;
  onClose: () => void;
}

const DEFAULT_STEPS: ReplayStep[] = [
  {
    step_index: 1,
    time_offset: '00:00',
    timestamp: '09:21:14 AM',
    source_node: 'ACC1001',
    target_node: 'ACC1005',
    amount: 150000.0,
    action: 'Victim credentials compromised via malicious APK. Initial siphoning transfer.',
    risk_score: 88,
  },
  {
    step_index: 2,
    time_offset: '+01:30',
    timestamp: '09:22:44 AM',
    source_node: 'ACC1005',
    target_node: 'ACC2002',
    amount: 145000.0,
    action: 'Immediate pass-through transfer to secondary mule to fragment transaction footprint.',
    risk_score: 92,
  },
  {
    step_index: 3,
    time_offset: '+03:10',
    timestamp: '09:24:24 AM',
    source_node: 'ACC2002',
    target_node: 'ACC5008',
    amount: 138000.0,
    action: 'Consolidation of stolen funds into syndicate collector holding account.',
    risk_score: 95,
  },
  {
    step_index: 4,
    time_offset: '+04:00',
    timestamp: '09:25:14 AM',
    source_node: 'ACC5008',
    target_node: 'ACC5008',
    amount: 138000.0,
    action: 'Funds stationary in ACC5008. Immediate recovery freeze window open!',
    risk_score: 98,
  },
];

export const CaseReplayBar: React.FC<Props> = ({
  steps = DEFAULT_STEPS,
  onStepChange,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(2500);

  const currentStep = steps[currentIndex] || null;

  useEffect(() => {
    onStepChange(currentIndex, currentStep);
  }, [currentIndex, currentStep, onStepChange]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, playSpeed]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-elevated border border-slate-700/80 space-y-3 animate-in slide-in-from-bottom-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">movie</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.2 rounded bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider">
                FORENSIC REPLAY
              </span>
              <span className="text-[12px] font-bold text-gray-200">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              {currentStep ? `${currentStep.timestamp} (${currentStep.time_offset})` : 'Timeline Replay'}
            </p>
          </div>
        </div>

        {/* Media Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-gray-300"
            title="Previous Step"
          >
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentIndex === steps.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-gray-300"
            title="Next Step"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>

          <button
            onClick={() => setCurrentIndex(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300"
            title="Reset"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
            title="Close Replay"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Scrubber Timeline Bar */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx <= currentIndex
                ? 'bg-blue-500 ring-1 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Step Event Narration Box */}
      {currentStep && (
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-400">{currentStep.source_node}</span>
              <span className="text-gray-400">→</span>
              <span className="font-mono font-bold text-amber-400">{currentStep.target_node}</span>
              <span className="font-mono font-extrabold text-white ml-2">
                {formatCurrency(currentStep.amount)}
              </span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">{currentStep.action}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Risk Index</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold text-[11px]">
              {currentStep.risk_score}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
