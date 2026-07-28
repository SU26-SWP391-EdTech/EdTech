import { useEffect, useRef } from 'react';
import { PlayCircle } from 'lucide-react';
import type { Lesson } from '../../../types/lesson/lesson.types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

interface LessonPlayerProps {
  activeLesson?: Lesson;
  activeVideoUrl?: string;
  youtubeEmbedUrl: string | null;
  onNativeVideoEnded?: () => void;
  onVideoProgressReach80?: () => void;
}

export function LessonPlayer({
  activeLesson,
  activeVideoUrl,
  youtubeEmbedUrl,
  onNativeVideoEnded,
  onVideoProgressReach80,
}: LessonPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const hasTriggered80Ref = useRef(false);

  // Reset trigger flag when switching lessons
  useEffect(() => {
    hasTriggered80Ref.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [activeLesson?.id]);

  // Handle YouTube iFrame API player tracking
  useEffect(() => {
    if (!youtubeEmbedUrl) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          playerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onStateChange: (event: any) => {
                // YT.PlayerState.PLAYING === 1
                if (event.data === 1) {
                  if (!intervalRef.current) {
                    intervalRef.current = setInterval(() => {
                      if (!playerRef.current || hasTriggered80Ref.current) return;
                      try {
                        const duration = playerRef.current.getDuration?.();
                        const currentTime = playerRef.current.getCurrentTime?.();
                        if (duration && duration > 0 && currentTime / duration >= 0.8) {
                          hasTriggered80Ref.current = true;
                          onVideoProgressReach80?.();
                          if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                          }
                        }
                      } catch (e) {
                        // ignore API error
                      }
                    }, 1000);
                  }
                } else if (event.data === 0) { // YT.PlayerState.ENDED === 0
                  if (!hasTriggered80Ref.current) {
                    hasTriggered80Ref.current = true;
                    onVideoProgressReach80?.();
                  }
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                } else {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                }
              },
            },
          });
        } catch (e) {
          console.warn('Failed to init YT player:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
      const fallbackTimer = setTimeout(initPlayer, 1500);
      return () => clearTimeout(fallbackTimer);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [youtubeEmbedUrl, activeLesson?.id, onVideoProgressReach80]);

  // Construct iframe URL with enablejsapi=1
  const finalYoutubeUrl = youtubeEmbedUrl
    ? `${youtubeEmbedUrl}${youtubeEmbedUrl.includes('?') ? '&' : '?'}enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : null;

  const handleNativeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!hasTriggered80Ref.current && video.duration && video.duration > 0) {
      if (video.currentTime / video.duration >= 0.8) {
        hasTriggered80Ref.current = true;
        onVideoProgressReach80?.();
      }
    }
  };

  const handleNativeEnded = () => {
    if (onNativeVideoEnded) onNativeVideoEnded();
    if (!hasTriggered80Ref.current) {
      hasTriggered80Ref.current = true;
      onVideoProgressReach80?.();
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl overflow-hidden shadow-lg">
      <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: 420 }}>
        {finalYoutubeUrl ? (
          <iframe
            ref={iframeRef}
            id="youtube-player-iframe"
            className="absolute inset-0 h-full w-full"
            src={finalYoutubeUrl}
            title={activeLesson?.title || 'Lesson video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : activeVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full bg-black object-contain"
            src={activeVideoUrl}
            controls
            onTimeUpdate={handleNativeTimeUpdate}
            onEnded={handleNativeEnded}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] px-6 text-center">
            <PlayCircle className="mb-3 h-12 w-12 text-white/60" />
            <p className="text-sm text-white" style={{ fontWeight: 600 }}>Video is not available yet.</p>
            <p className="mt-1 max-w-sm text-xs text-white/50">
              Add a YouTube or Cloudinary URL to this lesson's videoUrl field in mock data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
