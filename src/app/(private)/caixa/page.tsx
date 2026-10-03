import TransactionTable from "@/components/transactionTable";
import { getAccounts, getTotalBalance } from "@/lib/api/bankAccounts";
import { getTransactions } from "@/lib/api/transaction";
import { isApiError } from "@/lib/api/types";
import { formatBRL } from "@/lib/utils/format";
import buildFilterHref from "@/lib/utils/search-params";
import { ArrowRightLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { filterClass } from "../../../lib/styleFilterButtons";
import { getFinanceCategories } from "@/lib/api/financeCategory";
import SearchInput from "@/components/searchInput";
import Pagination from "@/components/pagination";
import SelectTypeInput from "@/components/selecTypeInput";
import SelectCategoryInput from "@/components/selectCategoryInput";
import SelectBankAccountInput from "@/components/SelectBankAccountInput";
import DateRange from "@/components/dateRangePicker";
import Skeleton from "@/components/skeleton";
import { Suspense } from "react";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <section className="mt-8">
      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between">
        <h1 className="text-8xl font-light">caixa</h1>

        <div className="flex gap-2">
          <Link
            href="caixa/entrada"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <Plus className="text-primary" size={16} />
          </Link>

          <Link
            href="caixa/saida"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <Minus className="text-primary" size={16} />
          </Link>

          <Link
            href="caixa/transferencia"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <ArrowRightLeft className="text-primary" size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex gap-2 justify-end">
          <Link
            href="caixa/entrada"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <Plus className="text-primary" size={16} />
          </Link>

          <Link
            href="caixa/saida"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <Minus className="text-primary" size={16} />
          </Link>

          <Link
            href="caixa/transferencia"
            className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
          >
            <ArrowRightLeft className="text-primary" size={16} />
          </Link>
        </div>
      </div>

      {/* Saldo Total */}
      <div className="ml-1">
        <p className="mt-8 text-start text-lg font-light">saldo total</p>

        <Suspense fallback={<BalanceSkeleton />}>
          <Balance />
        </Suspense>
      </div>

      {/* Accounts */}
      <Suspense fallback={<AccountsSkeleton />}>
        <Accounts searchParams={searchParams} />
      </Suspense>

      <p className="mt-8 text-start text-lg font-light">histórico</p>

      {/* Date Filters */}
      <div className="flex gap-6 overflow-visible">
        <DateRange />

        <div className="flex overflow-x-auto scrollbar-hidden gap-6 justify-start items-center text-center">
          <Link scroll={false} href="/caixa" className="shrink-0 block">
            <p className={filterClass(true)}>tudo</p>
          </Link>

          <DateFilters searchParams={searchParams} />
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-end mt-4 mr-3">
        <SearchInput endpoint="caixa" />
      </div>

      {/* Static Type Filter */}
      <div className="flex w-full">
        <div className="ml-auto mt-4 mr-3 w-fit flex flex-col gap-3">
          <SelectTypeInput />
        </div>
      </div>

      {/* Server-dependent Filters */}
      <Suspense fallback={<ServerFiltersSkeleton />}>
        <ServerFilters />
      </Suspense>

      {/* Transactions */}
      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Balance() {
  const totalBalance = await getTotalBalance();

  if (isApiError(totalBalance)) {
    return <p>{totalBalance.message}</p>;
  }

  return (
    <p className="text-start text-5xl font-normal">
      {formatBRL(totalBalance.total_balance)}
    </p>
  );
}

async function Accounts({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [accounts, params] = await Promise.all([getAccounts(), searchParams]);

  if (isApiError(accounts)) {
    return <p>{accounts.message}</p>;
  }

  const showAllAccount = params.inativas === "true";

  const filtered = showAllAccount
    ? accounts
    : accounts.filter((account) => account.is_active);

  const sorted = [...filtered].sort((a, b) => {
    if (a.name.toLowerCase() === "caixa") return -1;
    if (b.name.toLowerCase() === "caixa") return 1;
    return 0;
  });

  return (
    <>
      {/* Show All Accounts */}
      <Link
        href={showAllAccount ? "/caixa" : "/caixa?inativas=true"}
        className="flex mt-8 ml-1 w-fit h-fit"
      >
        <div className="text-tertiary text-xs">
          {showAllAccount ? <p>todas</p> : <p>ativas</p>}
        </div>
      </Link>

      {/* Bank Account Cards */}
      <div className="overflow-auto flex">
        <div className="overflow-x-auto scrollbar-hidden flex px-1 pt-1 pb-5 gap-4 font-bold items-center">
          {sorted.map((account) => (
            <Link
              href={`/caixa/conta/${account.id}`}
              key={account.id}
              className={`relative flex items-center justify-center min-w-50 min-h-55 shrink-0 overflow-hidden border ${
                !account.is_active
                  ? "border-secondary text-secondary"
                  : "border-primary text-primary"
              }`}
            >
              <p
                className={`text-center text-xl font-normal ${
                  Number(account.balance) < 0 && "text-red-500"
                }`}
              >
                {account.is_active ? formatBRL(account.balance) : "/"}
              </p>

              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 px-2.5 py-1 text-center text-lg normal-case font-light">
                {account.name.toLowerCase()}
              </p>
            </Link>
          ))}

          <Link
            href="/caixa/conta"
            className="relative flex items-center justify-center min-w-50 min-h-55 shrink-0 overflow-hidden"
          >
            <div className="text-primary">
              <Plus strokeWidth={0.8} size={35} />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

async function ServerFilters() {
  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getFinanceCategories(),
  ]);

  if (isApiError(accounts)) {
    return <p>{accounts.message}</p>;
  }

  if (isApiError(categories)) {
    return <p>{categories.message}</p>;
  }

  return (
    <div className="flex w-full">
      <div className="ml-auto mt-4 mr-3 w-fit flex flex-col gap-3">
        <SelectCategoryInput categories={categories} />
        <SelectBankAccountInput accounts={accounts} />
      </div>
    </div>
  );
}

async function DateFilters({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const date = typeof params.date === "string" ? params.date : undefined;

  return (
    <>
      <Link
        scroll={false}
        href={buildFilterHref(params, { date: "today" })}
        className="shrink-0 block"
      >
        <p className={filterClass(date === "today")}>hoje</p>
      </Link>

      <Link
        scroll={false}
        href={buildFilterHref(params, { date: "week" })}
        className="shrink-0 block"
      >
        <p className={filterClass(date === "week")}>essa semana</p>
      </Link>

      <Link
        scroll={false}
        href={buildFilterHref(params, { date: "month" })}
        className="shrink-0 block"
      >
        <p className={filterClass(date === "month")}>esse mês</p>
      </Link>
    </>
  );
}

async function TransactionsSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const transactions = await getTransactions({
    ...(typeof params.bank === "string" && { bank: params.bank }),
    ...(typeof params.date === "string" && { date: params.date }),
    ...(typeof params.type === "string" && { type: params.type }),
    ...(typeof params.search === "string" && { search: params.search }),
    ...(typeof params.category === "string" && {
      category: params.category,
    }),
    ...(typeof params.start_date === "string" && {
      start_date: params.start_date,
    }),
    ...(typeof params.end_date === "string" && {
      end_date: params.end_date,
    }),
    ...(typeof params.page === "string" && { page: params.page }),
  });

  if (isApiError(transactions)) {
    return <p>{transactions.message}</p>;
  }

  const transactionsTotalBalance = String(
    Number(transactions.total_income) + Number(transactions.total_expense),
  );

  return (
    <>
      <div className="flex justify-start gap-6 mt-4">
        <p className="font-medium">
          <span className="block text-xs font-light">entradas</span>
          {formatBRL(transactions.total_income)}
        </p>

        <p className="font-medium">
          <span className="block text-xs font-light">saídas</span>
          {formatBRL(transactions.total_expense)}
        </p>

        <p className="font-medium">
          <span className="block text-xs font-light">balanço</span>
          {formatBRL(transactionsTotalBalance)}
        </p>
      </div>

      <TransactionTable
        transactions={transactions.results.map((result) => result.transaction)}
      />

      <Pagination count={transactions.count} />
    </>
  );
}

function BalanceSkeleton() {
  return <Skeleton className="mt-2 h-10 w-74" />;
}

function AccountsSkeleton() {
  return (
    <>
      {/* Show All Accounts */}
      <div className="flex mt-8 ml-1 w-fit h-fit">
        <div className="text-tertiary text-xs">
          <p>ativas</p>
        </div>
      </div>

      {/* Bank Account Cards */}
      <div className="overflow-auto flex">
        <div className="overflow-x-auto scrollbar-hidden flex px-1 pt-1 pb-5 gap-4 font-bold items-center">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="min-w-50 min-h-55 shrink-0 animate-pulse border border-black"
            />
          ))}

          {/* Add account button stays static */}
          <Link
            href="/caixa/conta"
            className="relative flex items-center justify-center min-w-50 min-h-55 shrink-0 overflow-hidden"
          >
            <div className="text-primary">
              <Plus strokeWidth={0.8} size={35} />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

function ServerFiltersSkeleton() {
  return (
    <div className="flex w-full">
      <div className="ml-auto mt-4 mr-3 w-fit flex flex-col gap-3">
        <div className="h-8 w-32 animate-pulse bg-secondary/80" />
        <div className="h-8 w-40 animate-pulse bg-secondary/80" />
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <>
      {/* Transaction totals */}
      <div className="flex justify-start gap-6 mt-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div className="mt-4 w-full overflow-hidden">
        <Skeleton className="h-10 w-full" />

        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="mt-2">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Skeleton className="mt-4 h-8 w-32" />
    </>
  );
}
