export function PostCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[16/9] mb-4" />
      <div className="skeleton h-3 w-20 mb-2" />
      <div className="skeleton h-6 w-full mb-1" />
      <div className="skeleton h-6 w-3/4 mb-3" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-5/6 mb-3" />
      <div className="skeleton h-3 w-32" />
    </div>
  )
}

export function FeaturedPostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[21/9] mb-8" />
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-10 w-full mb-2" />
      <div className="skeleton h-10 w-4/5 mb-4" />
      <div className="skeleton h-5 w-full mb-1" />
      <div className="skeleton h-5 w-3/4" />
    </div>
  )
}
