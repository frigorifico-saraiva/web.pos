import Skeleton from "@/components/skeleton";

export default function Loading() {
  return (
    <section className="mt-6">
      {/* Back */}
      <Skeleton className="h-5 w-20" />

      {/* title */}
      <Skeleton className="mt-8 h-12 w-40" />

      <div className="relative flex items-center justify-center mt-2 ml-auto mr-auto w-full">
        <TransactionFormSkeleton />
      </div>
    </section>
  );
}

function TransactionFormSkeleton() {
  return (
    <div className="w-full max-w-xl mt-12">
      {/* amount */}
      <div className="mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 gap-x-8">
        {/* left */}
        <div className="flex flex-col gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>

        {/* right */}
        <div className="flex flex-col gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* submit */}
      <div className="mt-10 w-full">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
