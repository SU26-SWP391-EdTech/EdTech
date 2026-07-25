import { useEffect, useState } from 'react';
import { Upload, Link2, Trash2 } from 'lucide-react';
import { ReadingMarkdownEditor } from './ReadingMarkdownEditor';

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
  const [embedRequested, setEmbedRequested] = useState(Boolean(videoUrl && videoUploaded));
  const [videoUrlError, setVideoUrlError] = useState('');
  const embeddedUrl = getEmbedUrl(videoUrl);
  const hasPreview = Boolean(videoFile || (videoUrl && (embedRequested || videoUploaded)));

  useEffect(() => {
    if (!videoUrl) {
      setEmbedRequested(false);
      setVideoUrlError('');
    }
  }, [videoUrl]);

  const handleEmbed = () => {
    try {
      const parsed = new URL(videoUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
      setVideoUrlError('');
      setEmbedRequested(true);
    } catch {
      setEmbedRequested(false);
      setVideoUrlError('Enter a valid YouTube, Vimeo, or direct video URL.');
    }
  };

  const handleClearVideo = () => {
    setEmbedRequested(false);
    setVideoUrlError('');
    clearVideo();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── VIDEO SECTION ── */}
      {hasVideo && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Video Lecture Content</h2>
            {hasPreview && (
              <button
                type="button"
                onClick={handleClearVideo}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
              >
                <Trash2 size={13} /> Remove video
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              onClick={() => !hasPreview && videoInputRef.current?.click()}
              style={{
                border: `2px dashed ${hasPreview ? '#CBD5E1' : '#E5E7EB'}`,
                borderRadius: 12,
                minHeight: hasPreview ? 360 : 210,
                padding: hasPreview ? 0 : '32px 24px',
                textAlign: 'center',
                cursor: hasPreview ? 'default' : 'pointer',
                background: hasPreview ? '#000' : '#FAFAFA',
                transition: 'all 0.2s',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={event => handleVideoFileChange(event.target.files?.[0])}
                style={{ display: 'none' }}
              />
              {hasPreview ? (
                videoFile ? (
                  <video src={URL.createObjectURL(videoFile)} controls style={{ width: '100%', height: '100%', minHeight: 360, objectFit: 'contain' }} />
                ) : embeddedUrl ? (
                  <iframe
                    src={embeddedUrl}
                    title="Embedded video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', minHeight: 360, border: 0 }}
                  />
                ) : (
                  <video src={videoUrl} controls style={{ width: '100%', height: '100%', minHeight: 360, objectFit: 'contain' }} />
                )
              ) : (
                <div>
                  <Upload size={28} style={{ color: '#9CA3AF', marginBottom: 8 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Drag & drop your video here</p>
                  <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Supported formats: MP4, MOV, AVI, WebM · Max 4 GB</p>
                  <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Browse Files</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Or paste a video URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Link2 size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    value={videoUrl}
                    onChange={event => {
                      setVideoUrl(event.target.value);
                      setEmbedRequested(false);
                      setVideoUrlError('');
                    }}
                    placeholder="https://youtube.com/watch?v=..."
                    aria-invalid={Boolean(videoUrlError)}
                    style={{ width: '100%', paddingLeft: 30, border: `1px solid ${videoUrlError ? '#EF4444' : '#E5E7EB'}`, borderRadius: 8, padding: '8px 12px 8px 30px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                  />
                </div>
                <button type="button" onClick={handleEmbed} disabled={!videoUrl.trim()} style={{ padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: videoUrl.trim() ? 'pointer' : 'not-allowed', opacity: videoUrl.trim() ? 1 : 0.6, fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Embed</button>
              </div>
              {videoUrlError && <p role="alert" style={{ color: '#DC2626', fontSize: 11.5, marginTop: 5 }}>{videoUrlError}</p>}
            </div>
          </div>
        </div>
      )}
      {/* ── READING SECTION ── */}
      {hasReading && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Reading Material Content</h2>
          </div>

          <ReadingMarkdownEditor content={content} setContent={setContent} />
        </div>
      )}
    </div>
  );
}
