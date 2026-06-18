import { Upload, Link2, Bold, Italic, List, Code, CheckCircle2, Trash2 } from 'lucide-react';

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  if (ytMatch?.[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/)\d+/i);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[0].split('/').pop()}`;
  return null;
}

interface Props {
  hasVideo: boolean;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  videoFile: File | null;
  videoUploaded: boolean;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  hasReading: boolean;
  content: string;
  setContent: (v: string) => void;
  handleVideoFileChange: (file?: File) => void;
  clearVideo: () => void;
}

export function LessonContentSection({
  hasVideo, videoUrl, setVideoUrl, videoFile, videoUploaded,
  videoInputRef, hasReading, content, setContent,
  handleVideoFileChange, clearVideo,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── VIDEO SECTION ── */}
      {hasVideo && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Video Lecture Content</h2>
            {(videoUploaded || videoFile || videoUrl) && (
              <button
                type="button"
                onClick={clearVideo}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                  border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2',
                  color: '#B91C1C', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                }}
              >
                <Trash2 size={13} /> Remove video
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Upload area */}
            <div
              onClick={() => videoInputRef.current?.click()}
              style={{
                border: `2px dashed ${videoUploaded ? '#86EFAC' : '#E5E7EB'}`,
                borderRadius: 12, padding: '32px 24px', textAlign: 'center',
                cursor: 'pointer', background: videoUploaded ? '#F0FDF4' : '#FAFAFA',
                transition: 'all 0.2s',
              }}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={e => handleVideoFileChange(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
              {videoUploaded ? (
                <>
                  <CheckCircle2 size={28} style={{ color: '#16A34A', marginBottom: 8 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#16A34A', marginBottom: 3 }}>Video uploaded successfully</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>
                    {videoFile ? `${videoFile.name} · ${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : videoUrl || 'Existing lesson video'}
                  </p>
                </>
              ) : (
                <>
                  <Upload size={28} style={{ color: '#9CA3AF', marginBottom: 8 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Drag & drop your video here</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Supported formats: MP4, MOV, AVI, WebM · Max 4 GB</p>
                  <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Browse Files</span>
                </>
              )}
            </div>

            {/* YouTube / direct URL */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Or paste a video URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Link2 size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{ width: '100%', paddingLeft: 30, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px 8px 30px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                  />
                </div>
                <button type="button" style={{ padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Embed</button>
              </div>
            </div>

            {/* Live preview */}
            {(videoFile || videoUrl) && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Video Preview</label>
                <div style={{ maxWidth: 360, width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                  {videoFile ? (
                    <video src={URL.createObjectURL(videoFile)} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : getEmbedUrl(videoUrl) ? (
                    <iframe
                      src={getEmbedUrl(videoUrl)!}
                      title="Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <video src={videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── READING SECTION ── */}
      {hasReading && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Reading Material Content</h2>
          </div>

          <div>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {[Bold, Italic, List, Code, Link2].map((Icon, i) => (
                  <button type="button" key={i} style={{ width: 30, height: 28, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={13} style={{ color: '#374151' }} />
                  </button>
                ))}
                <div style={{ width: 1, height: 18, background: '#E5E7EB', margin: '0 4px' }} />
                {['H1', 'H2', 'H3'].map(h => (
                  <button type="button" key={h} style={{ padding: '2px 7px', border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: '#6B7280' }}>{h}</button>
                ))}
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Start writing your lesson content here..."
                rows={12}
                style={{ width: '100%', border: 'none', padding: '16px', fontSize: 14, color: '#374151', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', background: '#fff' }}
              />
            </div>
            <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>Estimated reading time: ~5 min based on content length</p>
          </div>
        </div>
      )}
    </div>
  );
}
