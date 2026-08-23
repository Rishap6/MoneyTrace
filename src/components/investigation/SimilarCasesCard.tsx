import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';

interface SimilarCase {
  case_number: string;
  title: string;
  similarity_score: number;
  stolen_amount: number;
  recovered_amount: number;
  resolution_time_hrs: number;
  outcome: string;
  key_tactics: string;
}

interface Props {
  caseId: string;
}

export const SimilarCasesCard: React.FC<Props> = ({ caseId }) => {
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<any>(`/investigation/${caseId}/similar`);
        setSimilarCases(res.data?.similar_cases || []);
      } catch (err) {
        console.error('Failed to fetch similar cases:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (caseId) fetchSimilar();
  }, [caseId]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-600 text-[20px]">hub</span>
          <h3 className="text-[14px] font-bold text-gray-900">AI Similar Precedent Cases</h3>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold tracking-wide">
            COSINE EMBEDDING MATCH
          </span>
        </div>
        <span className="text-[11px] font-semibold text-gray-500 font-mono">
          Historical Intelligence
        </span>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-gray-400 text-xs animate-pulse">
          Searching vector database for matching modus operandi...
        </div>
      ) : similarCases.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-xs">No matching cases found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {similarCases.map((c) => (
            <div
              key={c.case_number}
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {c.case_number}
                  </span>
                  <span className="text-[11px] font-extrabold text-green-700 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    {c.similarity_score}% Match
                  </span>
                </div>

                <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{c.title}</h4>
                <p className="text-[11px] text-gray-600 font-medium">
                  Tactic: <b className="text-gray-900">{c.key_tactics}</b>
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200 text-[11px] space-y-1 text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Stolen: {formatCurrency(c.stolen_amount)}</span>
                  <span className="text-green-700 font-bold">
                    Recovered: {formatCurrency(c.recovered_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolved: in {c.resolution_time_hrs} hrs</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-green-100 text-green-800">
                    {c.outcome}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
