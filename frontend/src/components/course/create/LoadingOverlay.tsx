interface LoadingOverlayProps {
  isEditMode: boolean;
}

export function LoadingOverlay({ isEditMode }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
      <p className="text-white text-base font-semibold animate-pulse">
        {isEditMode ? 'Updating course, please wait...' : 'Creating course & uploading image, please wait...'}
      </p>
    </div>
  );
}
