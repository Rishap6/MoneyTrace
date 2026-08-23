import React, { useState } from 'react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export interface InvestigatorNoteItem {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  note_type: string; // GENERAL, FINDING, LEGAL_HOLD, ESCALATION
  created_at: string;
}

interface Props {
  caseId: string;
  notes: InvestigatorNoteItem[];
  onNoteAdded: () => void;
}

export const InvestigatorNotes: React.FC<Props> = ({ caseId, notes, onNoteAdded }) => {
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('FINDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/investigation/${caseId}/notes`, {
        content: content.trim(),
        note_type: noteType,
      });
      setContent('');
      onNoteAdded();
    } catch (err) {
      console.error('Failed to submit note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'LEGAL_HOLD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FINDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ESCALATION':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">edit_note</span>
          <h3 className="text-[14px] font-bold text-gray-900">Investigator Case Notes</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500 font-mono">
          {notes.length} Recorded Entries
        </span>
      </div>

      {/* Note Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter forensic finding, legal notice update, or suspect account observation..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all placeholder:text-gray-400"
          required
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">Category:</span>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="FINDING">Forensic Finding</option>
              <option value="LEGAL_HOLD">Legal Hold / Notice</option>
              <option value="ESCALATION">Supervisor Escalation</option>
              <option value="GENERAL">General Note</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-[12px] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>{isSubmitting ? 'Recording...' : 'Add Note'}</span>
          </button>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-[13px]">
            No notes logged yet. Use the box above to log your first case finding.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">
                    {note.author_name?.charAt(0) || 'I'}
                  </span>
                  <span className="text-[12px] font-bold text-gray-900">{note.author_name}</span>
                  <span className="text-[11px] text-gray-400">({note.author_role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTypeBadge(
                      note.note_type
                    )}`}
                  >
                    {note.note_type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {formatDate(note.created_at)}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
