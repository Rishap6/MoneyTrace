import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services';

export interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  selectedAccountId?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  'Why was this account flagged?',
  'Show circular laundering loop',
  'Optimal fund recovery strategy',
  'List structuring transactions',
  'RBI digital fraud compliance',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  selectedAccountId,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `### 🛡️ AI Forensic Copilot Ready
- 🔍 **Flag Reasons**: Risk scoring & rule breakdown
- 🕸️ **Money Trails**: Multi-hop layering & mule ring tracing
- ⚡ **Asset Recovery**: Section 91 freeze probability
- 📜 **RBI Compliance**: Regulatory & FIU guidelines`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (initialQuestion) {
      setInput(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || input).trim();
    if (!q) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.sendMessage({
        message: q,
        context: {
          account_number: selectedAccountId,
          investigation_type: 'graph_money_flow',
        } as any,
      });

      const resAny = res as any;
      const reply =
        resAny?.data?.answer ||
        resAny?.data?.message?.content ||
        resAny?.data?.response ||
        resAny?.answer ||
        resAny?.message?.content ||
        resAny?.response ||
        'No detailed AI response returned from the server.';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **AI Copilot Error**: ${
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'Unable to reach AI engine.'
          }`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[420px] sm:w-[460px] max-w-full bg-[#090D16] border-l border-slate-800/90 flex flex-col h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300 font-sans">
      {/* 1. Header (Fixed Height / flex-none) */}
      <div className="flex-none px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#0F172A]/90 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              AI Investigator Copilot
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-500/30">
                PRO v2.4
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {selectedAccountId ? `Account Context: ${selectedAccountId}` : 'Contextual Graph Intelligence'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* 2. Messages History (flex-1 min-h-0 overflow-y-auto) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-slate-400">
              <span>{m.role === 'user' ? 'Investigator' : 'AI Copilot'}</span>
              <span>•</span>
              <span>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Requirement 4: Bubble Width max-w-[85%] */}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                  : 'bg-[#131B2E] border border-slate-800/90 text-slate-200 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line font-sans space-y-1.5">
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 p-2 font-mono bg-blue-950/30 rounded-xl border border-blue-800/40">
            <span className="material-symbols-outlined text-base animate-spin">sync</span>
            <span>Synthesizing topological graph evidence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Queries (Requirement 3 & 6: Fixed bottom, single-line horizontal scroll) */}
      <div className="flex-none px-3.5 py-2 border-t border-slate-800/80 bg-[#0A0E17]">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar scrollbar-none">
          {DEFAULT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] font-medium text-slate-300 bg-slate-900/90 hover:bg-blue-600 hover:text-white border border-slate-700/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-[12px] text-blue-400">sparkles</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Fixed Input Footer (Requirement 3 & 9: Microsoft Copilot / ChatGPT sidebar UX) */}
      <div className="flex-none p-3 border-t border-slate-800/90 bg-[#0F172A] flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Ask Copilot about accounts, hops, or rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-[#1E293B] border border-slate-700/80 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">send</span>
        </button>
      </div>
    </div>
  );
};

export default AICopilotDrawer;
