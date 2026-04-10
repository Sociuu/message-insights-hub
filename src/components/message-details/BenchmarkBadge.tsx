import { type BenchmarkRating } from "@/data/mockMessageData";

const ratingConfig: Record<BenchmarkRating, { label: string; color: string; bg: string }> = {
  excellent: { label: "Excellent", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  good: { label: "Good", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  fair: { label: "Fair", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  poor: { label: "Poor", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export function BenchmarkBadge({ rating }: { rating: BenchmarkRating }) {
  const cfg = ratingConfig[rating];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.color === "text-emerald-700" ? "bg-emerald-500" : cfg.color === "text-blue-700" ? "bg-blue-500" : cfg.color === "text-amber-700" ? "bg-amber-500" : "bg-red-500"}`} />
      {cfg.label}
    </span>
  );
}
