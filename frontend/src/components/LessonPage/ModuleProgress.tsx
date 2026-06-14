interface ModuleProgressProps {
  progress: number;
}

export function ModuleProgress({ progress }: ModuleProgressProps) {
  const color = progress === 100 ? '#10B981' : progress > 0 ? '#E11D48' : '#E5E7EB';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] text-[#9CA3AF]" style={{ fontWeight: 500 }}>{progress}%</span>
    </div>
  );
}
