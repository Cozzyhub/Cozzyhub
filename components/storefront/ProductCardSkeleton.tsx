export default function ProductCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gradient-to-br from-pale-taupe/30 to-misty-gray/20 rounded-t-3xl" />

      {/* Content skeleton */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-100/40 rounded-lg w-3/4" />

        {/* Category */}
        <div className="h-4 bg-gray-100/30 rounded w-1/2" />

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gray-100/40 rounded-lg w-1/3" />
          <div className="h-10 w-10 bg-gray-100/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
