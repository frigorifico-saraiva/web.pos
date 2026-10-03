export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-gray-200/70 ${className}`}
    >
      <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
