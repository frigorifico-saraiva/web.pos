import { Suspense } from "react";
import OrderCard from "@/components/orderCard";
import { filterClass } from "@/lib/styleFilterButtons";
import { getOrders, type OrderStatus } from "@/lib/api/orders";
import { isApiError } from "@/lib/api/types";
import buildFilterHref from "@/lib/utils/search-params";
import Link from "next/link";
import Pagination from "@/components/pagination";
import SearchInput from "@/components/searchInput";
import DateRange from "@/components/dateRangePicker";
import Skeleton from "@/components/skeleton";

const statusFilters: { label: string; value: "all" | OrderStatus }[] = [
  { label: "todas", value: "all" },
  { label: "abertas", value: "open" },
  { label: "pagas", value: "paid" },
  { label: "concluídas", value: "completed" },
  { label: "canceladas", value: "cancelled" },
];

export default function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h1 className="sm:text-8xl text-5xl font-light">vendas</h1>
      </div>

      <div className="flex justify-end mt-8">
        <SearchInput endpoint="vendas" />
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <Filters searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersPayload searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Filters({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const selectedStatus =
    typeof resolvedParams.status === "string"
      ? (resolvedParams.status as OrderStatus)
      : undefined;

  const currentSort =
    typeof resolvedParams.sort === "string" ? resolvedParams.sort : "recent";

  const isSortByRecent = currentSort === "recent";
  const isSortByOldest = currentSort === "oldest";
  const isSortByTotal = currentSort === "total";

  return (
    <>
      {/* Filter Status Buttons */}
      <div className="flex w-full">
        <div className="ml-auto mt-4 mr-0 w-fit flex flex-col gap-3">
          {statusFilters.map((filter) => {
            const isSelected =
              (filter.value === "all" && !selectedStatus) ||
              filter.value === selectedStatus;

            const href =
              filter.value === "all"
                ? "/vendas"
                : buildFilterHref(resolvedParams, {
                    status: filter.value,
                  });

            return (
              <Link
                key={filter.value}
                href={href}
                className="grid items-center justify-end shrink-0 rounded-md"
              >
                <p className={filterClass(isSelected)}>{filter.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Order Buttons */}
      <div className="flex gap-6 ml-1 mt-2">
        <DateRange />

        <div className="overflow-auto flex">
          <div className="overflow-x-auto scrollbar-hidden flex pb-0 gap-6 font-bold items-center">
            <p className="text-xs text-primary/50 shrink-0">ordenar por</p>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "recent",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByRecent)}>recentes</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "oldest",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByOldest)}>antigas</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "total",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByTotal)}>valor</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

async function OrdersPayload({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const { search, date, start_date, end_date, page } = resolvedParams;

  const selectedStatus =
    typeof resolvedParams.status === "string"
      ? (resolvedParams.status as OrderStatus)
      : undefined;

  const currentSort =
    typeof resolvedParams.sort === "string" ? resolvedParams.sort : "recent";

  const orders = await getOrders({
    search:
      typeof search === "string" && search.length >= 3 ? search : undefined,
    date: typeof date === "string" ? date : undefined,
    start_date: typeof start_date === "string" ? start_date : undefined,
    end_date: typeof end_date === "string" ? end_date : undefined,
    page: typeof page === "string" ? page : undefined,
  });

  if (isApiError(orders)) {
    return <p>{orders.message}</p>;
  }

  const sortedOrders = orders.results
    .filter((order) => {
      if (!selectedStatus) return true;
      return order.status === selectedStatus;
    })
    .sort((a, b) => {
      if (currentSort === "oldest") {
        return a.created_at.localeCompare(b.created_at);
      }

      if (currentSort === "total") {
        return parseFloat(b.total_amount) - parseFloat(a.total_amount);
      }

      return b.created_at.localeCompare(a.created_at);
    });

  return (
    <>
      <div className="grid mt-8 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <Pagination count={orders.count} />
    </>
  );
}

function FiltersSkeleton() {
  return (
    <>
      <div className="flex w-full">
        <div className="ml-auto mt-4 mr-0 w-fit flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>

      <div className="flex gap-6 ml-1 mt-2">
        <Skeleton className="h-5 w-24" />

        <div className="flex gap-6 items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <>
      <div className="grid mt-8 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border p-4 min-h-32">
            <Skeleton className="h-5 w-32" />

            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Skeleton className="h-8 w-32" />
      </div>
    </>
  );
}
