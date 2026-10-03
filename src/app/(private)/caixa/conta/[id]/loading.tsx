import Skeleton from "@/components/skeleton";

export default function Loading() {
  return (
    <section className="mt-6">
      {/* BackButton */}
      <Skeleton className="h-5 w-20" />

      {/* title */}
      <Skeleton className="mt-8 h-12 w-64" />

      <div className="flex flex-col items-center">
        <div className="mt-2 relative ml-auto mr-auto flex items-center justify-center sm:w-150 sm:min-h-95 w-full">
          
          {/* form (no outer card) */}
          <div className="w-full sm:w-150 flex flex-col gap-4">
            
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
