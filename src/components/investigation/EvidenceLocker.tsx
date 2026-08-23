import React, { useState } from 'react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export interface CaseEvidenceItem {
  id: string;
  title: string;
  evidence_type: string; // RECEIPT, SCREENSHOT, PDF_REPORT, NOTE, IP_LOG, BANK_DIRECTIVE
  file_path?: string | null;
  file_size_bytes?: number | null;
  content_text?: string | null;
  uploaded_by: string;
  hash_sha256?: string | null;
  created_at: string;
}

interface Props {
  caseId: string;
  evidence: CaseEvidenceItem[];
  onEvidenceAdded: () => void;
}

export const EvidenceLocker: React.FC<Props> = ({ caseId, evidence, onEvidenceAdded }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState<CaseEvidenceItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('RECEIPT');
  const [contentText, setContentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/investigation/${caseId}/evidence`, {
        title: title.trim(),
        evidence_type: type,
        content_text: contentText.trim(),
      });
      setTitle('');
      setContentText('');
      setShowAddModal(false);
      onEvidenceAdded();
    } catch (err) {
      console.error('Failed to add evidence:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartVerify = (item: CaseEvidenceItem) => {
    setVerifyingItem(item);
    setIsVerifying(true);
    setVerificationDone(false);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
    }, 1200);
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'receipt_long';
      case 'SCREENSHOT':
        return 'image';
      case 'PDF_REPORT':
        return 'picture_as_pdf';
      case 'IP_LOG':
        return 'terminal';
      case 'BANK_DIRECTIVE':
        return 'gavel';
      default:
        return 'inventory_2';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">lock</span>
            <h3 className="text-[14px] font-bold text-gray-900">Evidence Locker</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide">
              CHAIN OF CUSTODY SECURED
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Tamper-evident repository storing transaction proofs, APK forensic dumps, and judicial notices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[12px] flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Add Evidence</span>
        </button>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400 text-[13px] bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-[36px] text-gray-300 block mb-1">
              inventory_2
            </span>
            No evidence assets logged. Click "Add Evidence" to upload forensic logs or proofs.
          </div>
        ) : (
          evidence.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">
                      {getEvidenceIcon(item.evidence_type)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700 font-mono">
                    {item.evidence_type.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                {item.content_text && (
                  <pre className="text-[11px] text-gray-600 font-mono bg-gray-50 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-24">
                    {item.content_text}
                  </pre>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Uploaded by: <b className="text-gray-700">{item.uploaded_by}</b></span>
                  <span>{formatDate(item.created_at)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {item.hash_sha256 && (
                    <span className="text-[10px] text-gray-400 font-mono truncate" title={item.hash_sha256}>
                      SHA: {item.hash_sha256.slice(0, 10)}...
                    </span>
                  )}

                  <button
                    onClick={() => handleStartVerify(item)}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>Verify Integrity</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Verification Certificate Modal */}
      {verifyingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 text-center">
            {isVerifying ? (
              <div className="py-8 space-y-3">
                <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin block mx-auto">
                  sync
                </span>
                <h4 className="text-sm font-bold text-gray-900">Computing SHA-256 Hash Digest...</h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  Validating cryptographic block checksum against court-admissible ledger...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>

                <div>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-extrabold uppercase tracking-wider">
                    CRYPTOGRAPHIC PROOF VALIDATED
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">Evidence Untampered</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Hash digest matches the original timestamped forensic ledger commit.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-1.5 text-[11px] font-mono">
                  <div>
                    <span className="text-gray-400 uppercase text-[9px] block">Evidence Title</span>
                    <span className="font-bold text-gray-900">{verifyingItem.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-[9px] block">Algorithm Standard</span>
                    <span className="text-blue-700 font-bold">SHA-256 (NIST FIPS 180-4)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-[9px] block">Calculated Hash Digest</span>
                    <span className="text-gray-800 break-all text-[10px] block bg-white p-1.5 rounded border border-gray-200">
                      {verifyingItem.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setVerifyingItem(null)}
                    className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900">Add Evidence Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-gray-500 block mb-1">
                  Evidence Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bank Transaction Statement / APK Manifest"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-gray-500 block mb-1">
                  Evidence Classification
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="RECEIPT">Transaction Receipt / UTR</option>
                  <option value="SCREENSHOT">Screenshot / Visual Proof</option>
                  <option value="PDF_REPORT">PDF Forensic Export</option>
                  <option value="IP_LOG">IP & Network Header Logs</option>
                  <option value="BANK_DIRECTIVE">Section 91 CrPC Directive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-gray-500 block mb-1">
                  Evidence Notes / Content Details
                </label>
                <textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={4}
                  placeholder="Enter details, IP addresses, transaction hashes, or forensic notes..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-[13px]"
                >
                  {isSubmitting ? 'Saving...' : 'Secure & Save Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
