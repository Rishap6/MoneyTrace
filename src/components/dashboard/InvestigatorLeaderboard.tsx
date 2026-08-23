import React from 'react';

interface InvestigatorRank {
  name: string;
  role: string;
  cases_solved: number;
  recovery_rate: number;
  avg_resolution_hrs: number;
  avatar_color: string;
  badge?: string;
}

const LEADERBOARD: InvestigatorRank[] = [
  {
    name: 'Alok Khatri',
    role: 'Lead Forensic Analyst',
    cases_solved: 42,
    recovery_rate: 94.2,
    avg_resolution_hrs: 1.4,
    avatar_color: 'bg-blue-600',
    badge: '🏆 Top Preserver',
  },
  {
    name: 'Nandini Sharma',
    role: 'Cyber Crime Specialist',
    cases_solved: 38,
    recovery_rate: 91.8,
    avg_resolution_hrs: 1.8,
    avatar_color: 'bg-purple-600',
    badge: '⚡ Speed SLA',
  },
  {
    name: 'Priya Sengupta',
    role: 'Lead SOC Supervisor',
    cases_solved: 35,
    recovery_rate: 96.0,
    avg_resolution_hrs: 1.2,
    avatar_color: 'bg-emerald-600',
    badge: '🛡️ Best Recovery %',
  },
  {
    name: 'Eric Miller',
    role: 'AML Compliance Officer',
    cases_solved: 31,
    recovery_rate: 88.5,
    avg_resolution_hrs: 2.1,
    avatar_color: 'bg-amber-600',
  },
];

export const InvestigatorLeaderboard: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">military_tech</span>
          <h3 className="text-[14px] font-bold text-gray-900">SOC Investigator Leaderboard</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide">
          SLA PERFORMANCE
        </span>
      </div>

      <div className="space-y-3">
        {LEADERBOARD.map((item, idx) => (
          <div
            key={item.name}
            className="p-3 rounded-xl bg-gray-50/70 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 text-[12px]"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-extrabold text-gray-400 w-4">
                #{idx + 1}
              </span>
              <div
                className={`w-8 h-8 rounded-full ${item.avatar_color} text-white font-bold flex items-center justify-center text-xs shadow-sm`}
              >
                {item.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900">{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{item.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right font-mono">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Solved</span>
                <span className="font-bold text-gray-900">{item.cases_solved}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Recovery</span>
                <span className="font-bold text-emerald-600">{item.recovery_rate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Avg SLA</span>
                <span className="font-bold text-blue-600">{item.avg_resolution_hrs}h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
