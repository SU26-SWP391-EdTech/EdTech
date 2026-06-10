import { Clock, FileText, Trash2 } from 'lucide-react';
import type { Note } from './types';

interface NotesPanelProps {
  notes: Note[];
  noteText: string;
  videoProgress: number;
  onNoteTextChange: (value: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: number) => void;
}

export function NotesPanel({
  notes,
  noteText,
  videoProgress,
  onNoteTextChange,
  onAddNote,
  onDeleteNote,
}: NotesPanelProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <textarea
          value={noteText}
          onChange={e => onNoteTextChange(e.target.value)}
          placeholder="Add a note about this lesson..."
          rows={3}
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] resize-none"
        />
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
            <Clock className="w-3.5 h-3.5" />
            Timestamp at {Math.floor((videoProgress / 100) * 18)}:30
          </button>
          <button
            onClick={onAddNote}
            disabled={!noteText.trim()}
            className="px-4 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontWeight: 500 }}
          >
            Save Note
          </button>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>SAVED NOTES ({notes.length})</p>
          {notes.map(note => (
            <div key={note.id} className="flex gap-3 p-3.5 rounded-xl border border-[#E5E7EB]" style={{ backgroundColor: note.color + '60' }}>
              <button className="flex-shrink-0 px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#E11D48] hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 600 }}>
                {note.timestamp}
              </button>
              <p className="flex-1 text-sm text-[#374151] leading-relaxed">{note.content}</p>
              <button
                type="button"
                onClick={() => onDeleteNote(note.id)}
                className="self-start rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-white hover:text-[#E11D48]"
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10">
          <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-[#9CA3AF]" />
          </div>
          <p className="text-sm text-[#374151]" style={{ fontWeight: 600 }}>No notes yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1 text-center">Add a timestamped note while learning.</p>
        </div>
      )}
    </div>
  );
}
