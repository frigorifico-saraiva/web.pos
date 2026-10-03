import { Suspense } from "react";
import { isApiError } from "@/lib/api/types";
import buildFilterHref from "@/lib/utils/search-params";
import Link from "next/link";
import { filterClass } from "@/lib/styleFilterButtons";
import SearchInput from "@/components/searchInput";
import { Plus } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import ProductCard from "@/components/productCard";
import Pagination from "@/components/pagination";
import Skeleton from "@/components/skeleton";

export default function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="sm:text-8xl text-5xl font-light">produtos</h1>

        <Link
          href="produtos/novo"
          className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
        >
          <Plus className="text-primary" size={16} />
        </Link>
      </div>

      <div className="flex justify-end mt-8">
        <SearchInput endpoint="produtos" />
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <Filters searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsPayload searchParams={searchParams} />
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
  const { status, sort } = resolvedParams;

  const isAll = !status;
  const isAvailable = status === "available";
  const isUnavailable = status === "unavailable";

  const currentSort = typeof sort === "string" ? sort : "name";
  const isSortByName = currentSort === "name";
  const isSortBySku = currentSort === "sku";
  const isSortByStock = currentSort === "stock";

  return (
    <>
      {/* Status Filters */}
      <div className="mt-2 ml-1 overflow-hidden">
        <div className="overflow-auto flex">
          <div className="overflow-x-auto scrollbar-hidden flex pt-1 pb-0 gap-2 font-bold items-center">
            <Link
              href="/produtos"
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isAll)}>todos</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                status: "available",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isAvailable)}>disponíveis</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                status: "unavailable",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isUnavailable)}>indisponíveis</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Sort Filters */}
      <div className="mt-0 ml-1 overflow-hidden">
        <div className="overflow-auto flex">
          <div className="overflow-x-auto scrollbar-hidden flex pb-5 gap-2 font-bold items-center">
            <p className="text-xs text-primary/50 shrink-0">ordenar por</p>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "name",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByName)}>nome</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "sku",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortBySku)}>sku</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                sort: "stock",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByStock)}>estoque</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

async function ProductsPayload({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const { search, status, sort, page } = resolvedParams;

  const isAvailable = status === "available";
  const isUnavailable = status === "unavailable";

  const currentSort = typeof sort === "string" ? sort : "name";

  const currentPage =
    typeof page === "string" && Number(page) > 0 ? Number(page) : 1;

  const pageSize = 50;

  const allProducts = await getProducts({
    search:
      typeof search === "string" && search.length >= 3 ? search : undefined,
    is_active: true,
  });

  if (isApiError(allProducts)) {
    return <p>{allProducts.message}</p>;
  }

  const sortedProducts = allProducts
    .filter((product) => {
      if (isAvailable) return product.is_available;
      if (isUnavailable) return !product.is_available;
      return true;
    })
    .sort((a, b) => {
      if (currentSort === "sku") {
        const skuA = a.sku || "";
        const skuB = b.sku || "";

        return skuA.localeCompare(skuB, "pt-BR", {
          sensitivity: "base",
        });
      }

      if (currentSort === "stock") {
        return b.stock - a.stock;
      }

      return a.name.localeCompare(b.name, "pt-BR", {
        sensitivity: "base",
      });
    });

  const pagedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      <div className="grid mt-0 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {pagedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination count={sortedProducts.length} pageSize={pageSize} />
    </>
  );
}

function FiltersSkeleton() {
  return (
    <>
      {/* Status filters */}
      <div className="mt-2 ml-1">
        <div className="flex pt-1 gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>

      {/* Sort filters */}
      <div className="mt-0 ml-1 pb-5">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </>
  );
}

function ProductsSkeleton() {
  return (
    <>
      <div className="grid mt-0 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Skeleton className="h-8 w-32" />
      </div>
    </>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="border p-4 min-h-32">
      <Skeleton className="h-5 w-32" />

      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
