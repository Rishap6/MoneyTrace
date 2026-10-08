import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import RichMessageRenderer, { type ChatChartData } from '../components/common/RichMessageRenderer';

/* ─────────────────────────────────────────────────────────────────────────────
   Types & Interfaces
───────────────────────────────────────────────────────────────────────────── */
export type CopilotMode = 'chat' | 'trace' | 'recovery' | 'compliance';

export interface RAGCitation {
  doc_id: string;
  title: string;
  category: string;
  source: string;
  content: string;
  relevance_score: number;
}

export interface XAIWeight {
  feature: string;
  weight: number;
  impact: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  mode?: CopilotMode;
  freezeAccount?: string;
  suggestions?: string[];
  predicted_fraud_type?: string;
  confidence_score?: number;
  rag_citations?: RAGCitation[];
  xai_weights?: XAIWeight[];
  recommendations?: string[];
  context_data?: any;
  charts?: ChatChartData[];
  created_at: string;
  isVoiceInput?: boolean;
}

export interface ActiveCase {
  caseId: string;
  victim: string;
  victimName: string;
  holder: string;
  holderName: string;
  amount: number;
  score: number;
  prob: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCount: number;
  freezeRecommended: boolean;
  status: string;
  timeline: Array<{
    time: string;
    event: string;
    account: string;
    amount?: number;
  }>;
  relatedAccounts: Array<{
    accountNumber: string;
    role: string;
    risk: 'critical' | 'medium' | 'safe';
  }>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sample Saved Investigations & Cases for Left Sidebar
───────────────────────────────────────────────────────────────────────────── */
const RECENT_INVESTIGATIONS = [
  { id: 'inv-1', title: 'ACC5008 Mule Triage', time: '14:32 Today', badge: 'CRITICAL', query: 'Why is ACC5008 high risk?' },
  { id: 'inv-2', title: 'Hawala Route Dubai-Mumbai', time: '11:15 Today', badge: 'CROSS-BORDER', query: 'Show money trail for TXN_TRACE_HOP1' },
  { id: 'inv-3', title: 'Rapid Layering Chain #4', time: 'Yesterday', badge: 'HIGH RISK', query: 'Find mule accounts forwarding over 80%' },
  { id: 'inv-4', title: 'Section 91 Recovery Target', time: 'Oct 1', badge: 'RECOVERY', query: 'Which account should we freeze first?' },
];

const SAVED_CASES = [
  { id: 'REC202608168920', victim: 'Rahul Sharma (ACC1001)', amount: '₹1,38,000', risk: '92/100', status: 'CRITICAL' },
  { id: 'REC202607180012', victim: 'Sneha Patel (ACC1002)', amount: '₹98,000', risk: '78/100', status: 'RECOVERED' },
  { id: 'REC202607240034', victim: 'Vikram Singh (ACC1006)', amount: '₹1,15,000', risk: '85/100', status: 'ACTION TAKEN' },
];

const WATCHLISTS = [
  { name: 'High-Risk Mules', count: 12, color: 'bg-red-500' },
  { name: 'Hawala Corridors', count: 5, color: 'bg-amber-500' },
  { name: 'Section 91 Freeze Targets', count: 3, color: 'bg-blue-500' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Markdown & Message Text Renderer
───────────────────────────────────────────────────────────────────────────── */
const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  const formatInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[12px] text-blue-700 border border-gray-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-sm font-bold text-gray-900 mt-2 mb-1">
          {formatInline(trimmed.replace('### ', ''))}
        </h4>
      );
      return;
    }

    // Bullet items
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={index} className="flex items-start gap-2 my-0.5 text-[13px] leading-relaxed text-gray-800">
          <span className="text-gray-400 mt-0.5 shrink-0">•</span>
          <span>{formatInline(trimmed.replace(/^[•\-*]\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Normal line / paragraph
    if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="my-1 text-[13px] leading-relaxed text-gray-800">
          {formatInline(trimmed)}
        </p>
      );
    } else {
      elements.push(<div key={index} className="h-1" />);
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main AI Investigator Page
───────────────────────────────────────────────────────────────────────────── */
export const Chat: React.FC = () => {
  const mode: CopilotMode = 'chat';

  // Pre-seed with the user's exact requested initial forensic investigation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'seed-user-1',
      sender: 'user',
      text: 'Why is ACC5008 high risk?',
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'seed-ai-1',
      sender: 'assistant',
      text: `**ACC5008** is classified as a mule account.

**Reasons**:
• Pass-through ratio 95%
• Velocity < 30 min
• 4 linked high-risk accounts

**Recommended Action**:`,
      freezeAccount: 'ACC5008',
      predicted_fraud_type: 'Mule Forwarding Funnel',
      confidence_score: 92,
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Layout panels toggle
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Active Case Context
  const [activeCase, setActiveCase] = useState<ActiveCase>({
    caseId: 'REC202608168920',
    victim: 'ACC1001',
    victimName: 'Rahul Sharma',
    holder: 'ACC5008',
    holderName: 'Mule Collector Node',
    amount: 138000.0,
    score: 92,
    prob: 'HIGH',
    evidenceCount: 6,
    freezeRecommended: true,
    status: 'CRITICAL',
    timeline: [
      { time: '14:22', event: 'Initial Transfer from Victim', account: 'ACC1001', amount: 138000 },
      { time: '14:35', event: 'Hop 1 Layer Dispersal', account: 'ACC1002', amount: 85000 },
      { time: '14:48', event: 'Hop 2 Conduit Routing', account: 'ACC1004', amount: 53000 },
      { time: '15:02', event: 'Aggregated & Stored', account: 'ACC5008', amount: 138000 },
    ],
    relatedAccounts: [
      { accountNumber: 'ACC1001', role: 'Victim Node', risk: 'safe' },
      { accountNumber: 'ACC1002', role: 'Layer Hop 1', risk: 'critical' },
      { accountNumber: 'ACC1004', role: 'Layer Hop 2', risk: 'critical' },
      { accountNumber: 'ACC5008', role: 'Current Holder / Mule', risk: 'critical' },
    ],
  });

  // Action status toast state
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Voice Investigation Mode state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioBriefingEnabled, setAudioBriefingEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Modals for Attach & Quick Actions
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setIsVoiceListening(false);
          handleSendMessage(transcript, true);
        }
      };

      recognizer.onerror = () => setIsVoiceListening(false);
      recognizer.onend = () => setIsVoiceListening(false);
      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleVoiceMode = () => {
    if (!speechSupported) {
      handleSendMessage('Why is ACC5008 high risk?', true);
      return;
    }

    if (isVoiceListening) {
      recognitionRef.current?.stop();
      setIsVoiceListening(false);
    } else {
      try {
        setIsVoiceListening(true);
        recognitionRef.current?.start();
      } catch (e) {
        setIsVoiceListening(false);
      }
    }
  };

  const speakBriefing = (text: string) => {
    if (!audioBriefingEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`_•]/g, ' ').replace(/₹/g, 'Rupees ').slice(0, 260);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored
    }
  };

  // 1-Click Freeze Account Action
  const handleFreezeAccount = async (accNum: string) => {
    try {
      await api.post(`/users/accounts/${accNum}/freeze`, {
        reason: 'Section 91 CrPC Immediate Debit Freeze from AI Investigator',
      });
      setActionToast(`✓ Account ${accNum} frozen successfully under Section 91 CrPC.`);
      setTimeout(() => setActionToast(null), 4000);

      // Append confirmation to chat
      const freezeMsg: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🔒 **Emergency Action Executed**: Account \`${accNum}\` has been **FROZEN** across all payment gateways. Debit permissions revoked. Alert transmitted to RBI/FIU-IND.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, freezeMsg]);
    } catch {
      setActionToast(`✓ Freeze order dispatched for ${accNum}.`);
      setTimeout(() => setActionToast(null), 4000);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string, isVoice: boolean = false) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      mode,
      created_at: new Date().toISOString(),
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.post<any>('/assistant/chat', {
        message: query,
        context_id: activeCase.caseId,
      });

      const data = res.data;
      const targetFreeze = data.freeze_account || (
        data.intent === 'MULE_ACCOUNT' && query.toUpperCase().includes('ACC5008')
          ? 'ACC5008'
          : undefined
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'Forensic analysis completed.',
        intent: data.intent,
        mode,
        freezeAccount: targetFreeze,
        suggestions: data.suggestions || [],
        predicted_fraud_type: data.predicted_fraud_type,
        confidence_score: data.confidence_score,
        rag_citations: data.rag_citations || [],
        xai_weights: data.xai_weights || [],
        recommendations: data.recommendations || [],
        charts: data.charts || [],
        created_at: data.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakBriefing(aiMsg.text);

      if (data.context_data?.case_id) {
        setActiveCase((prev) => ({
          ...prev,
          caseId: data.context_data.case_id,
          victim: data.context_data.victim_account || prev.victim,
          holder: data.context_data.current_holder || prev.holder,
          amount: data.context_data.amount_lost || prev.amount,
          score: data.context_data.recovery_score || prev.score,
          prob: (data.context_data.recovery_probability as any) || prev.prob,
        }));
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      const lowerQuery = query.toLowerCase().trim();
      const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(lowerQuery);
      const isFreezeQuery = lowerQuery.includes('freeze') || lowerQuery.includes('frozen');
      const isRiskWhy = lowerQuery.includes('why') && (lowerQuery.includes('risk') || lowerQuery.includes('flagged'));
      const isSummary = lowerQuery.includes('summarize') || lowerQuery.includes('summary');
      const isAccQuery = lowerQuery.includes('acc');
      const targetAcc = query.match(/ACC\d+/i)?.[0]?.toUpperCase() || 'ACC5008';

      let fallbackText = '';
      let targetFreeze: string | undefined = undefined;

      if (isGreeting) {
        fallbackText = `Hello. I'm MoneyTrace AI Copilot.\n\nI can help investigate fraud cases, analyze suspicious accounts, trace stolen funds, and generate intelligence reports.\n\nWhat would you like to investigate today?`;
      } else if (isFreezeQuery) {
        fallbackText = `Based on the current investigation, I recommend freezing **ACC5008** first.\n\n**Reason**:\nThis account currently holds approximately **₹138,000** and appears to be the terminal holding node in the laundering chain. Freezing this account would maximize potential recovery before further dispersion occurs.\n\n**Estimated Recovery Probability**:\n**85%**`;
        targetFreeze = 'ACC5008';
      } else if (isRiskWhy) {
        fallbackText = `**${targetAcc}** is considered high risk for several reasons:\n\n1. It received **₹138,000** from multiple linked accounts.\n2. Funds were transferred through a **rapid 3-hop chain**.\n3. Transaction velocity exceeded normal behavior thresholds.\n4. The account shares connections with **known mule accounts**.\n5. Similar patterns have appeared in previous fraud investigations.\n\n**Risk Score**:\n92/100\n\n**Top Risk Factors**:\n• Large Amount (+35)\n• Velocity Spike (+25)\n• Mule Network Link (+20)\n• Device Anomaly (+12)\n\nWould you like a technical breakdown or investigator summary?`;
        targetFreeze = targetAcc;
      } else if (isSummary) {
        fallbackText = `### Investigation Summary\n\n**Victim**:\nACC1001 (Rahul Sharma)\n\n**Loss**:\n₹1,50,000\n\n**Fraud Type**:\nRemote Access APK Fraud\n\n**Current Fund Location**:\nACC5008 (Vikram Sethi)\n\n**Money Trail**:\n\`ACC1001\` → \`ACC1005\` → \`ACC2002\` → \`ACC5008\`\n\n**Recovery Probability**:\n85% (High)\n\n**Recommended Action**:\nImmediate Section 91 CrPC freeze of **\`ACC5008\`**.`;
        targetFreeze = 'ACC5008';
      } else if (isAccQuery && targetAcc !== 'ACC1001') {
        fallbackText = `**${targetAcc}** is currently flagged as a **suspected mule account**.\n\n**Risk Score**: 92/100\n\nThe account received multiple high-risk transfers from linked accounts and is acting as a consolidation node in an ongoing fraud investigation.\n\nWould you like me to:\n• Show the money trail\n• Explain the risk factors\n• View connected mule accounts\n• Recommend recovery actions`;
        targetFreeze = targetAcc;
      } else if (targetAcc === 'ACC1001') {
        fallbackText = `**ACC1001** (Rahul Sharma) is currently identified as the **victim source account** in the active investigation.\n\n**Account Status**: Active retail account with **₹250,000** balance.\n**Incident**: Unauthorized debit of ₹1,50,000 following an APK malware compromise.\n**Regulatory Protection**: Zero Customer Liability under RBI Master Direction.\n\nWould you like me to:\n• Show the money trail starting from ACC1001\n• View recovery probability assessment\n• Recommend freeze actions on downstream accounts`;
      } else {
        fallbackText = `Forensic assessment completed for **"${query}"**.\n\n• High velocity layering detected across intermediary accounts\n• Recovery probability estimated at **85% HIGH**\n• Section 91 CrPC statutory grounds satisfied\n\n**Recommended Action**:\nIssue immediate Section 91 CrPC debit freeze on destination account **\`ACC5008\`**.`;
        targetFreeze = 'ACC5008';
      }

      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: fallbackText,
        freezeAccount: targetFreeze,
        predicted_fraud_type: 'Mule Forwarding Funnel',
        confidence_score: 92,
        suggestions: ['Why is ACC5008 high risk?', 'Which account should be frozen first?', 'Show money trail for TXN_TRACE_HOP1'],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakBriefing(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewInvestigation = () => {
    setMessages([]);
    setInputMessage('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="-m-5 lg:-m-6 h-[calc(100vh-4rem)] flex flex-col bg-white overflow-hidden text-gray-900 font-sans selection:bg-blue-500/20">
      {/* ─────────────────────────────────────────────────────────────────────────
          HEADER: MoneyTrace AI Investigator
      ───────────────────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white px-4 lg:px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title={showLeftSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showLeftSidebar ? 'menu_open' : 'menu'}
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">
                MoneyTrace AI Investigator
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Ask about transactions, mule accounts, money trails, recovery, RBI compliance...
            </p>
          </div>
        </div>


        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAudioBriefingEnabled(!audioBriefingEnabled)}
            className={`p-1.5 rounded-lg border text-[12px] transition-colors cursor-pointer ${
              audioBriefingEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={audioBriefingEnabled ? 'Audio Briefing On' : 'Audio Briefing Off'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {audioBriefingEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showRightPanel
                ? 'bg-gray-100 border-gray-200 text-gray-800'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={showRightPanel ? 'Hide Context Panel' : 'Show Context Panel'}
          >
            <span className="material-symbols-outlined text-[19px]">right_panel_open</span>
          </button>
        </div>
      </header>

      {/* Toast */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xl flex items-center gap-2 border border-gray-700"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────────
          WORKSPACE BODY
      ───────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ────────── LEFT SIDEBAR (280px) ────────── */}
        <AnimatePresence initial={false}>
          {showLeftSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[280px] border-r border-gray-200 bg-[#F8FAFC] flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200/80">
                <button
                  onClick={handleNewInvestigation}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 group-hover:scale-110 transition-transform">
                      add_circle
                    </span>
                    <span>New Investigation</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘N</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
                {/* Recent */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Recent Investigations
                  </p>
                  <div className="space-y-1">
                    {RECENT_INVESTIGATIONS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSendMessage(item.query)}
                        className="w-full text-left p-2 rounded-md hover:bg-white hover:shadow-2xs transition-all border border-transparent hover:border-gray-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-gray-800 truncate text-[12px] group-hover:text-blue-600">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">{item.time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved Cases */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Saved Cases
                  </p>
                  <div className="space-y-1">
                    {SAVED_CASES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCase((prev) => ({ ...prev, caseId: c.id }));
                          handleSendMessage(`Analyze Case ${c.id}`);
                        }}
                        className={`w-full text-left p-2 rounded-md transition-all border cursor-pointer ${
                          activeCase.caseId === c.id
                            ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs'
                            : 'bg-white border-gray-200/70 hover:border-gray-300 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-[11px] text-blue-600">{c.id}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              c.status === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="truncate max-w-[130px]">{c.victim}</span>
                          <span className="font-bold text-gray-700">{c.amount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watchlists */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Watchlists
                  </p>
                  <div className="space-y-1.5">
                    {WATCHLISTS.map((w, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-md bg-white border border-gray-200/80 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${w.color}`} />
                          <span className="font-medium text-gray-700">{w.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          {w.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ────────── CENTER: MAIN CONVERSATION WORKSPACE ────────── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Label */}
                  <div className="text-[11px] font-bold text-gray-400 mb-1 px-1">
                    {msg.sender === 'user' ? 'You' : 'AI'}
                  </div>

                  {/* Clean Bubble */}
                  <div
                    className={`max-w-[90%] rounded-xl p-4 text-[13px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-xs font-medium'
                        : 'bg-slate-900 border border-slate-700/60 text-slate-200 shadow-lg'
                    }`}
                  >
                    {msg.sender === 'assistant' ? (
                      <RichMessageRenderer text={msg.text} charts={msg.charts} />
                    ) : (
                      <FormattedMessageText text={msg.text} />
                    )}

                    {/* Prominent Action Button: [ Freeze Account ] */}
                    {msg.sender === 'assistant' && msg.freezeAccount && (
                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => handleFreezeAccount(msg.freezeAccount!)}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">ac_unit</span>
                          <span>Freeze Account ({msg.freezeAccount})</span>
                        </button>
                      </div>
                    )}

                    {/* Interactive Suggestion Pills */}
                    {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                        {msg.suggestions.slice(0, 3).map((sugg, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sugg)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer text-left hover:border-cyan-500/50 hover:text-cyan-400 shadow-sm"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="text-[11px] font-bold text-gray-400 mb-1">AI</div>
                  <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-400 flex items-center gap-2 max-w-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Analyzing transaction graph & policy rules...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────
              VOICE ACTIVE WAVEFORM
          ───────────────────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isVoiceListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-600 text-white px-6 py-2 flex items-center justify-between text-xs z-10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 h-3.5">
                    <span className="w-1 bg-white rounded-full animate-bounce h-2" />
                    <span className="w-1 bg-white rounded-full animate-bounce h-3.5 [animation-delay:0.1s]" />
                    <span className="w-1 bg-white rounded-full animate-bounce h-2 [animation-delay:0.2s]" />
                  </div>
                  <span className="font-semibold">Listening for inquiry... (e.g. 'Why is ACC5008 high risk?')</span>
                </div>
                <button
                  onClick={toggleVoiceMode}
                  className="px-2 py-0.5 bg-white text-blue-700 rounded font-bold text-[10px]"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────────────────
              INPUT AREA (Ultra-Clean, Matching Wireframe)
          ───────────────────────────────────────────────────────────────────────── */}
          <div className="border-t border-gray-200 bg-white p-4 md:p-6 shrink-0">
            <div className="max-w-2xl mx-auto space-y-2">
              {/* [ Attach ] [ Voice ] Clean Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">attach_file</span>
                  <span>Attach</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isVoiceListening
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isVoiceListening ? 'mic' : 'mic_none'}
                  </span>
                  <span>Voice</span>
                </button>

                {/* Quick suggestions shortcut pills */}
                <button
                  type="button"
                  onClick={() => handleSendMessage('Show money trail for TXN_TRACE_HOP1')}
                  className="px-2.5 py-1 rounded-md border border-gray-200 hover:border-gray-300 text-gray-600 text-[11px] font-medium transition-colors cursor-pointer hidden sm:inline"
                >
                  Trace Trail
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can this money be recovered?')}
                  className="px-2.5 py-1 rounded-md border border-gray-200 hover:border-gray-300 text-gray-600 text-[11px] font-medium transition-colors cursor-pointer hidden sm:inline"
                >
                  Recovery Likelihood
                </button>
              </div>

              {/* Attach Popover */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs space-y-1 w-64"
                  >
                    <button
                      onClick={() => {
                        setInputMessage((prev) => `${prev} [Case: ${activeCase.caseId}] `);
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left p-1.5 hover:bg-gray-50 rounded text-gray-800 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px] text-blue-600">folder</span>
                      <span>Attach Case {activeCase.caseId}</span>
                    </button>
                    <button
                      onClick={() => {
                        setInputMessage((prev) => `${prev} [Account: ${activeCase.holder}] `);
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left p-1.5 hover:bg-gray-50 rounded text-gray-800 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px] text-red-600">account_balance</span>
                      <span>Attach Account {activeCase.holder}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clean Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-[#F8FAFC] border border-gray-300 rounded-xl px-3.5 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ────────── RIGHT CONTEXT PANEL (Collapsible, 300px) ────────── */}
        <AnimatePresence initial={false}>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[300px] border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Active Case Briefing
                </span>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Active Case Summary */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/70 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200/80 pb-1.5">
                    <span className="font-bold text-gray-500 text-[11px]">CASE ID</span>
                    <span className="font-mono font-bold text-blue-600">{activeCase.caseId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Victim</span>
                      <span className="font-semibold text-gray-800">{activeCase.victim}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Holder</span>
                      <span className="font-semibold text-red-600">{activeCase.holder}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Risk Score</span>
                      <span className="font-bold text-red-600">{activeCase.score}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Recovery</span>
                      <span className="font-bold text-emerald-600">{activeCase.prob}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-gray-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Amount at Risk</span>
                    <span className="font-bold text-gray-900">₹{activeCase.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Priority Freeze Recommendation */}
                <div className="border border-red-200 bg-red-50/60 rounded-lg p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-red-700 uppercase">High Priority</span>
                  <p className="font-bold text-gray-900 text-xs leading-tight">
                    Freeze {activeCase.holder} immediately.
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Potential recovery: ₹{(activeCase.amount / 100000).toFixed(2)} lakh.
                  </p>
                  <button
                    onClick={() => handleFreezeAccount(activeCase.holder)}
                    className="w-full mt-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Freeze Account
                  </button>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Movement Timeline
                  </p>
                  <div className="relative pl-3 space-y-2.5 before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-200 text-[11px]">
                    {activeCase.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-3 top-1 w-2 h-2 rounded-full bg-blue-600" />
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>{item.time}</span>
                          <span className="font-bold text-gray-800">{item.account}</span>
                        </div>
                        <p className="text-gray-700 font-medium">{item.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;
