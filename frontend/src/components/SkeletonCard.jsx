export default function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}
