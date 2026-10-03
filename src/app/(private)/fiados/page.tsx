import { Suspense } from "react";
import DateRange from "@/components/dateRangePicker";
import ReceivableTable from "@/components/receivableTable";
import SearchInput from "@/components/searchInput";
import { getAccounts } from "@/lib/api/bankAccounts";
import { getReceivables, PaymentStatus } from "@/lib/api/receivables";
import { isApiError } from "@/lib/api/types";
import { filterClass } from "@/lib/styleFilterButtons";
import { formatBRL } from "@/lib/utils/format";
import buildFilterHref from "@/lib/utils/search-params";
import { Plus } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/pagination";
import MonthSelect from "@/components/monthSelector";
import { getUser } from "@/lib/api/user";
import Skeleton from "@/components/skeleton";

export default function FiadosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Suspense
          fallback={
            <h1 className="sm:text-8xl text-6xl sm:ml-0 -ml-1 font-light">
              fiados
            </h1>
          }
        >
          <PageTitle />
        </Suspense>

        <Link
          href="fiados/novo"
          className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
        >
          <Plus className="text-primary" size={16} />
        </Link>
      </div>

      <p className="mt-8 text-start text-lg font-light">histórico</p>

      {/* Filters */}
      <Suspense fallback={<FilterSkeleton />}>
        <Filters searchParams={searchParams} />
      </Suspense>

      {/* Receivables History */}
      <Suspense fallback={<ReceivablesSkeleton />}>
        <Receivables searchParams={searchParams} />
      </Suspense>

      {/* Summary */}
      <Suspense fallback={<SummarySkeleton />}>
        <Summary searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function PageTitle() {
  const user = await getUser();

  if (isApiError(user)) {
    return (
      <h1 className="sm:text-8xl text-6xl sm:ml-0 -ml-1 font-light">fiados</h1>
    );
  }

  return (
    <h1 className="sm:text-8xl text-6xl sm:ml-0 -ml-1 font-light">
      {user.username === "hugo" ? "receber" : "fiados"}
    </h1>
  );
}

async function Filters({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const { status, date, search, start_date, end_date } = resolvedParams;

  const isAll = !status && !search && !date && !start_date && !end_date;
  const isPending = status === "pending";
  const isOverdue = status === "overdue";
  const isPaid = status === "paid";
  const isPartiallyPaid = status === "partially_paid";
  const isToday = date === "today";
  const isWeek = date === "week";

  return (
    <>
      {/* Filter Date Buttons */}
      <div className="flex gap-6">
        <DateRange />

        <div className="overflow-hidden">
          <div className="overflow-auto flex">
            <div className="overflow-x-auto scrollbar-hidden flex pt-1 pb-1 gap-6 font-bold items-center">
              <Link
                href="/fiados"
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className={filterClass(isAll)}>tudo</p>
              </Link>

              <Link
                href={buildFilterHref(resolvedParams, { date: "today" })}
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className={filterClass(isToday)}>hoje</p>
              </Link>

              <Link
                href={buildFilterHref(resolvedParams, { date: "week" })}
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className={filterClass(isWeek)}>essa semana</p>
              </Link>

              <MonthSelect endpoint="fiados" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 mr-3">
        <SearchInput endpoint="fiados" />
      </div>

      {/* Filter Status Buttons */}
      <div className="flex w-full">
        <div className="ml-auto mt-4 mr-3 w-fit flex flex-col gap-3">
          <Link
            href={buildFilterHref(resolvedParams, { status: "pending" })}
            className="grid items-center justify-end shrink-0 rounded-md"
          >
            <p className={filterClass(isPending)}>pendente</p>
          </Link>

          <Link
            href={buildFilterHref(resolvedParams, { status: "overdue" })}
            className="grid items-center justify-end shrink-0 rounded-md"
          >
            <p className={filterClass(isOverdue)}>em atraso</p>
          </Link>

          <Link
            href={buildFilterHref(resolvedParams, {
              status: "partially_paid",
            })}
            className="grid items-center justify-end shrink-0 rounded-md"
          >
            <p className={filterClass(isPartiallyPaid)}>parcial</p>
          </Link>

          <Link
            href={buildFilterHref(resolvedParams, { status: "paid" })}
            className="grid items-center justify-end shrink-0 rounded-md"
          >
            <p className={filterClass(isPaid)}>pago</p>
          </Link>
        </div>
      </div>
    </>
  );
}

async function Receivables({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const { status, search, date, start_date, end_date, page } = resolvedParams;

  const [receivables, accounts] = await Promise.all([
    getReceivables({
      type: "receivable",
      ...(typeof status === "string" && {
        status: status as PaymentStatus,
      }),
      ...(typeof search === "string" && { search }),
      ...(typeof date === "string" && { date }),
      ...(typeof start_date === "string" && { start_date }),
      ...(typeof end_date === "string" && { end_date }),
      ...(typeof page === "string" && { page }),
    }),
    getAccounts(),
  ]);

  if (isApiError(receivables)) {
    return <p>{receivables.message}</p>;
  }

  if (isApiError(accounts)) {
    return <p>{accounts.message}</p>;
  }

  return (
    <>
      <ReceivableTable
        receivables={receivables.results.map((s) => s.payment)}
        basePath="fiados"
        accounts={accounts}
      />

      <Pagination count={receivables.count} />
    </>
  );
}

async function Summary({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const { status, search, date, start_date, end_date, page } = resolvedParams;

  const receivables = await getReceivables({
    type: "receivable",
    ...(typeof status === "string" && {
      status: status as PaymentStatus,
    }),
    ...(typeof search === "string" && { search }),
    ...(typeof date === "string" && { date }),
    ...(typeof start_date === "string" && { start_date }),
    ...(typeof end_date === "string" && { end_date }),
    ...(typeof page === "string" && { page }),
  });

  if (isApiError(receivables)) {
    return null;
  }

  return (
    <SummaryContent
      total={receivables.total}
      totalOverdue={receivables.total_overdue}
      totalPaid={receivables.total_paid}
      totalToBePaid={receivables.total_to_be_paid}
    />
  );
}

function SummaryContent({
  total,
  totalOverdue,
  totalPaid,
  totalToBePaid,
}: {
  total: string;
  totalOverdue: string;
  totalPaid: string;
  totalToBePaid: string;
}) {
  return (
    <div className="mt-6 overflow-hidden">
      <div className="overflow-auto flex">
        <div className="overflow-x-auto scrollbar-hidden flex w-full justify-between px-1 pt-1 pb-5 gap-4 font-bold items-center">
          <SummaryCard label="total" value={total} />
          <SummaryCard label="em atraso" value={totalOverdue} />
          <SummaryCard label="pago" value={totalPaid} />
          <SummaryCard label="a pagar" value={totalToBePaid} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid items-center justify-center shrink-0 rounded-md overflow-hidden">
      <p className="text-center text-xs uppercase font-light">{label}</p>

      <p className="w-40 h-fit py-0.5 rounded-md text-center font-medium text-lg uppercase">
        {formatBRL(value)}
      </p>
    </div>
  );
}

function ReceivablesSkeleton() {
  return (
    <>
      {/* Transaction table */}
      <div className="mt-4 w-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="mt-2">
            <Skeleton className="mt-4 h-4 w-20" />
            <Skeleton className="mt-4 h-12 w-full" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Skeleton className="mt-4 h-8 w-32" />
    </>
  );
}

function SummarySkeleton() {
  return (
    <div className="mt-6 overflow-hidden">
      <div className="overflow-auto flex">
        <div className="overflow-x-auto scrollbar-hidden flex w-full justify-between px-1 pt-1 pb-5 gap-4 font-bold items-center">
          <SummarySkeletonCard label="total" />
          <SummarySkeletonCard label="em atraso" />
          <SummarySkeletonCard label="pago" />
          <SummarySkeletonCard label="a pagar" />
        </div>
      </div>
    </div>
  );
}

function SummarySkeletonCard({ label }: { label: string }) {
  return (
    <div className="grid items-center justify-center shrink-0 rounded-md overflow-hidden">
      <p className="text-center text-xs uppercase font-light">{label}</p>

      <div className="w-40 h-7 py-0.5 rounded-md animate-pulse bg-secondary/20" />
    </div>
  );
}

function FilterSkeleton() {
  return (
    <>
      <div className="flex gap-6">
        <DateRange />

        <div className="overflow-hidden">
          <div className="overflow-auto flex">
            <div className="overflow-x-auto scrollbar-hidden flex pt-1 pb-1 gap-6 font-bold items-center">
              <div
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className="text-xs py-0.5">tudo</p>
              </div>

              <div
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className="text-xs py-0.5">hoje</p>
              </div>

              <div
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className="text-xs py-0.5">essa semana</p>
              </div>

              <div
                className="grid items-center justify-center shrink-0 rounded-md"
              >
                <p className="text-xs py-0.5">mês</p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 mr-3">
        <div className="h-10 w-48 rounded-md animate-pulse bg-secondary/20" />
      </div>

      <div className="flex w-full">
        <div className="ml-auto mt-4 mr-3 w-fit flex flex-col gap-3">
          <div className="h-5 w-20 rounded animate-pulse bg-secondary/20" />
          <div className="h-5 w-20 rounded animate-pulse bg-secondary/20" />
          <div className="h-5 w-20 rounded animate-pulse bg-secondary/20" />
          <div className="h-5 w-20 rounded animate-pulse bg-secondary/20" />
        </div>
      </div>
    </>
  );
}
