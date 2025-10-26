export default function ProductCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-white/5" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-white/10 rounded-lg w-3/4" />
        
        {/* Category */}
        <div className="h-4 bg-white/10 rounded w-1/2" />
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-white/10 rounded-lg w-1/3" />
          <div className="h-10 bg-white/10 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}
