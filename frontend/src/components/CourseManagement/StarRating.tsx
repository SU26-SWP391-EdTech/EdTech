import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating: number }) {
  if (!rating) return <span className="text-xs text-[#9CA3AF]">—</span>;
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
      <span className="text-xs text-[#374151]" style={{ fontWeight: 600 }}>{rating.toFixed(1)}</span>
    </div>
  );
}
