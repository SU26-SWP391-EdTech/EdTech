import { useRef, useState } from 'react';
import { Bold, Code, Italic, Link2, List, Strikethrough } from 'lucide-react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface ReadingMarkdownEditorProps {
  content: string;
  setContent: (value: string) => void;
}

type EditorMode = 'write' | 'preview';

export function ReadingMarkdownEditor({ content, setContent }: ReadingMarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const updateSelection = (nextValue: string, selectionStart: number, selectionEnd: number) => {
    setContent(nextValue);
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const wrapSelection = (before: string, after = before, placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const nextValue = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    updateSelection(nextValue, start + before.length, start + before.length + selected.length);
  };

  const prefixSelectedLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = content.lastIndexOf('\n', Math.max(0, textarea.selectionStart - 1)) + 1;
    const nextLineBreak = content.indexOf('\n', textarea.selectionEnd);
    const end = nextLineBreak === -1 ? content.length : nextLineBreak;
    const selected = content.slice(start, end) || 'List item';
    const updated = selected.split('\n').map(line => `${prefix}${line.replace(/^#{1,3}\s+|^-\s+/, '')}`).join('\n');
    const nextValue = `${content.slice(0, start)}${updated}${content.slice(end)}`;
    updateSelection(nextValue, start, start + updated.length);
  };

  const insertCode = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selected = content.slice(textarea.selectionStart, textarea.selectionEnd);
    if (selected.includes('\n')) {
      wrapSelection('```\n', '\n```', 'code');
      return;
    }
    wrapSelection('`', '`', 'code');
  };

  const toolbarButton = {
    width: 30,
    height: 28,
    border: 'none',
    background: 'transparent',
    borderRadius: 5,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return (
    <div>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <button type="button" title="Bold" aria-label="Bold" onClick={() => wrapSelection('**')} style={toolbarButton}><Bold size={13} /></button>
            <button type="button" title="Italic" aria-label="Italic" onClick={() => wrapSelection('_')} style={toolbarButton}><Italic size={13} /></button>
            <button type="button" title="Strikethrough" aria-label="Strikethrough" onClick={() => wrapSelection('~~')} style={toolbarButton}><Strikethrough size={13} /></button>
            <button type="button" title="Bulleted list" aria-label="Bulleted list" onClick={() => prefixSelectedLines('- ')} style={toolbarButton}><List size={13} /></button>
            <button type="button" title="Code" aria-label="Code" onClick={insertCode} style={toolbarButton}><Code size={13} /></button>
            <button type="button" title="Link" aria-label="Link" onClick={() => wrapSelection('[', '](https://)', 'link text')} style={toolbarButton}><Link2 size={13} /></button>
            <div style={{ width: 1, height: 18, background: '#E5E7EB', margin: '0 4px' }} />
            {(['H1', 'H2', 'H3'] as const).map((heading, index) => (
              <button type="button" key={heading} onClick={() => prefixSelectedLines(`${'#'.repeat(index + 1)} `)} style={{ ...toolbarButton, width: 'auto', padding: '2px 7px', fontSize: 11.5, fontWeight: 700, color: '#6B7280' }}>{heading}</button>
            ))}
          </div>
          <div style={{ display: 'flex', padding: 2, borderRadius: 7, background: '#E5E7EB' }}>
            {(['write', 'preview'] as const).map(tab => (
              <button
                type="button"
                key={tab}
                onClick={() => setMode(tab)}
                style={{ border: 'none', borderRadius: 5, padding: '4px 10px', background: mode === tab ? '#fff' : 'transparent', color: mode === tab ? '#111827' : '#64748B', cursor: 'pointer', fontSize: 11.5, fontWeight: 600 }}
              >
                {tab === 'write' ? 'Write' : 'Preview'}
              </button>
            ))}
          </div>
        </div>
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder="Write your lesson in Markdown..."
            rows={12}
            style={{ width: '100%', border: 'none', padding: '16px', fontSize: 14, color: '#374151', outline: 'none', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.7, boxSizing: 'border-box', background: '#fff' }}
          />
        ) : (
          <div style={{ minHeight: 316, padding: 16, background: '#fff' }}>
            {content.trim() ? <MarkdownRenderer content={content} /> : <p style={{ color: '#94A3B8', fontSize: 13 }}>Nothing to preview yet.</p>}
          </div>
        )}
      </div>
      <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 6 }}>Markdown is saved as written. Use Preview to check formatting before saving.</p>
    </div>
  );
}