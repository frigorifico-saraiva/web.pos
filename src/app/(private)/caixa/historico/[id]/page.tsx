import { Suspense } from "react";
import BackButton from "@/components/backButton";
import DeleteTransactionButton from "@/components/deleteTransactionButton";
import PrintOrderReceiptButton from "@/components/printOrderReceiptButton";
import PrintTransactionReceipt from "@/components/printTransactionReceipt";
import { getTransactionByID } from "@/lib/api/transaction";
import { isApiError } from "@/lib/api/types";
import { formatBRL, formatDateTime } from "@/lib/utils/format";
import Link from "next/link";

async function TransactionPayload({ id }: { id: string }) {
  const transaction = await getTransactionByID(id);

  if (isApiError(transaction)) {
    return <p>{transaction.message}</p>;
  }

  return (
    <>
      <div className="no-print sm:flex grid justify-between">
        <h2 className="sm:text-6xl text-4xl">comprovante pagamento</h2>

        <div className="flex flex-col px-1 pt-1 items-center">
          <div className="relative mt-2 ml-auto mr-auto p-4 flex flex-col items-center justify-start w-full sm:w-140 h-120 border">
            <p className="absolute top-5 text-sm font-normal">
              {formatDateTime(transaction.timestamp)}
            </p>

            <p
              className={`mt-10 sm:mt-15 text-5xl ${
                parseFloat(transaction.amount) < 0 ? "text-red-500" : ""
              }`}
            >
              {formatBRL(transaction.amount)}
            </p>

            <p className="mt-2">{transaction.contact.name}</p>

            <div className="mt-5 w-fit h-fit border-b border-secondary/50">
              <p className="py-0.5 text-[12px]">
                {transaction.type !== "transfer" && transaction.category.name}

                {transaction.type === "transfer" && "transferência"}
              </p>
            </div>

            <div className="relative w-full sm:w-100 h-5 mt-8 py-4 flex items-center justify-between">
              <p className="text-sm font-light">operador</p>
              <p className="text-sm font-light">{transaction.operator.name}</p>
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">conta</p>
              <p className="text-sm font-light">
                {transaction.account.name.toLowerCase()}
              </p>
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">origem</p>

              <p className="text-sm font-light">
                {transaction.payment ? (
                  <Link href={`/fiados/${transaction.payment}`}>
                    {transaction.payment}
                  </Link>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">ref</p>

              {transaction.linked ? (
                <Link
                  href={`/caixa/historico/${transaction.linked}`}
                  className="text-sm font-light"
                >
                  {transaction.linked}
                </Link>
              ) : (
                <p className="text-sm font-light">-</p>
              )}
            </div>

            <div className="relative mt-4 w-full sm:w-100 px-2 py-3 flex flex-col gap-1">
              <p className="text-sm text-center font-light">
                {`"${transaction.description.toLowerCase()}"`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DeleteTransactionButton id={transaction.id} />

      <PrintTransactionReceipt transaction={transaction} />
    </>
  );
}

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="mt-6">
      {/* Completely static — renders immediately */}
      <div className="no-print mt-6 mb-4 flex items-center justify-between">
        <BackButton />

        <div className="no-print flex items-center">
          <PrintOrderReceiptButton />
        </div>
      </div>

      {/* Only the transaction API request is suspended */}
      <Suspense fallback={<TransactionSkeleton />}>
        <TransactionPayload id={id} />
      </Suspense>
    </section>
  );
}

function TransactionSkeleton() {
  return (
    <>
      <div className="no-print sm:flex grid justify-between">
        {/* Static title */}
        <h2 className="sm:text-6xl text-4xl">comprovante pagamento</h2>

        <div className="flex flex-col px-1 pt-1 items-center">
          <div className="relative mt-2 ml-auto mr-auto p-4 flex flex-col items-center justify-start w-full sm:w-140 h-120 border">
            {/* Date */}
            <div className="absolute top-5 h-4 w-32 animate-pulse bg-secondary/70" />

            {/* Amount */}
            <div className="mt-10 sm:mt-15 h-14 w-48 animate-pulse bg-secondary/70" />

            {/* Contact */}
            <div className="mt-2 h-5 w-32 animate-pulse bg-secondary/70" />

            {/* Category */}
            <div className="mt-5 h-5 w-24 animate-pulse border-b border-secondary/50 bg-secondary/70" />

            {/* Operator */}
            <div className="relative w-full sm:w-100 h-5 mt-8 py-4 flex items-center justify-between">
              <p className="text-sm font-light">operador</p>
              <div className="h-4 w-32 animate-pulse bg-secondary/70" />
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            {/* Account */}
            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">conta</p>
              <div className="h-4 w-32 animate-pulse bg-secondary/70" />
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            {/* Origin */}
            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">origem</p>
              <div className="h-4 w-24 animate-pulse bg-secondary/70" />
            </div>

            <hr className="border-t border-tertiary/25 w-full sm:w-100" />

            {/* Reference */}
            <div className="relative w-full sm:w-100 h-5 py-4 flex items-center justify-between">
              <p className="text-sm font-light">ref</p>
              <div className="h-4 w-32 animate-pulse bg-secondary/70" />
            </div>

            {/* Description */}
            <div className="relative mt-4 w-full sm:w-100 px-2 py-3 flex flex-col gap-1 items-center">
              <div className="h-4 w-56 animate-pulse bg-secondary/70" />
            </div>
          </div>
        </div>
      </div>

      {/* This is also server-dependent because it needs transaction.id.
          Keep the space reserved while the transaction loads. */}
      <div className="mt-4 h-4 w-16 animate-pulse bg-secondary/70" />
    </>
  );
}
