import React from 'react';

interface ThreatItem {
  id: string;
  source: string;
  threat_type: string;
  headline: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  timestamp: string;
}

const THREATS: ThreatItem[] = [
  {
    id: 'TH-01',
    source: 'CERT-In / I4C Feed',
    threat_type: 'Malicious APK Campaign',
    headline: "Active trojan 'SafeBank_v4.apk' bypassing SMS OTP permissions via WhatsApp lure links.",
    severity: 'CRITICAL',
    timestamp: '10 mins ago',
  },
  {
    id: 'TH-02',
    source: 'National Cyber Crime Cell',
    threat_type: 'Mule Account Syndicate',
    headline: 'High-velocity pass-through transfers detected across Tier-2 state bank cooperative nodes.',
    severity: 'HIGH',
    timestamp: '25 mins ago',
  },
  {
    id: 'TH-03',
    source: 'RBI Fraud Intelligence Gateway',
    threat_type: 'QR Overlay Tampering',
    headline: 'Physical static QR stickers compromised at high-volume metropolitan transit hubs.',
    severity: 'WARNING',
    timestamp: '1 hour ago',
  },
  {
    id: 'TH-04',
    source: 'Dark Web Intelligence',
    threat_type: 'Synthetic Identity Dump',
    headline: '450+ compromised KYC documents flagged on dark web forums being used for rapid account generation.',
    severity: 'HIGH',
    timestamp: '2 hours ago',
  },
];

export const ThreatIntelFeed: React.FC = () => {
  const getBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[20px]">rss_feed</span>
          <h3 className="text-[14px] font-bold text-gray-900">Live Threat Intelligence Feed</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold tracking-wide animate-pulse">
          INTERPOL & I4C SYNCED
        </span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {THREATS.map((t) => (
          <div
            key={t.id}
            className="p-3 rounded-xl bg-gray-50/70 border border-gray-200 hover:border-gray-300 transition-all space-y-1.5 text-[12px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${getBadge(t.severity)}`}>
                  {t.severity}
                </span>
                <span className="font-bold text-gray-900">{t.threat_type}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">{t.timestamp}</span>
            </div>

            <p className="text-gray-700 leading-relaxed text-[12px]">{t.headline}</p>

            <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Source: <b className="text-gray-600">{t.source}</b></span>
              <span className="text-blue-600 font-bold hover:underline cursor-pointer">Advisory Bulletin →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
