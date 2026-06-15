import { PlayCircle } from 'lucide-react';
import type { Lesson } from '../../../types/lesson/lesson.types';

interface LessonPlayerProps {
  activeLesson?: Lesson;
  activeVideoUrl?: string;
  youtubeEmbedUrl: string | null;
  onNativeVideoEnded: () => void;
}

export function LessonPlayer({
  activeLesson,
  activeVideoUrl,
  youtubeEmbedUrl,
  onNativeVideoEnded,
}: LessonPlayerProps) {
  return (
    <div className="bg-[#111827] rounded-2xl overflow-hidden shadow-lg">
      <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: 420 }}>
        {youtubeEmbedUrl ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={youtubeEmbedUrl}
            title={activeLesson?.title || 'Lesson video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : activeVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full bg-black object-contain"
            src={activeVideoUrl}
            controls
            onEnded={onNativeVideoEnded}
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
