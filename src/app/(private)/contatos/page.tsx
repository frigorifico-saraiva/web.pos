import { Suspense } from "react";
import Skeleton from "@/components/skeleton";
import { isApiError } from "@/lib/api/types";
import buildFilterHref from "@/lib/utils/search-params";
import Link from "next/link";
import { filterClass } from "@/lib/styleFilterButtons";
import SearchInput from "@/components/searchInput";
import { Plus } from "lucide-react";
import { getContactsPage } from "@/lib/api/contacts";
import ContactCard from "@/components/contactCard";
import Pagination from "@/components/pagination";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function ContatosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  const { search, type, sort } = resolvedParams;

  const isAll = !search && !type;
  const isCustomers = type === "customers";
  const isSuppliers = type === "suppliers";

  const currentSort = typeof sort === "string" ? sort : "name";
  const isSortByName = currentSort === "name";
  const isSortByRecent = currentSort === "recent";

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="sm:text-8xl text-5xl font-light">contatos</h1>

        <Link
          href="contatos/novo"
          className="flex w-10 h-10 items-center justify-center border border-primary hover:border-tertiary"
        >
          <Plus className="text-primary" size={16} />
        </Link>
      </div>

      {/* Search */}
      <div className="flex justify-end mt-8">
        <SearchInput endpoint="contatos" />
      </div>

      {/* Filter Buttons */}
      <div className="mt-2 ml-1 overflow-hidden">
        <div className="overflow-auto flex">
          <div className="overflow-x-auto scrollbar-hidden flex pt-1 pb-0 gap-2 font-bold items-center">
            <Link
              href="/contatos"
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isAll)}>todos</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                type: "customers",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isCustomers)}>clientes</p>
            </Link>

            <Link
              href={buildFilterHref(resolvedParams, {
                type: "suppliers",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSuppliers)}>fornecedores</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Sort Buttons */}
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
                sort: "recent",
              })}
              className="grid items-center justify-center shrink-0 rounded-md"
            >
              <p className={filterClass(isSortByRecent)}>recentes</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact List */}
      <Suspense fallback={<ContactsSkeleton />}>
        <ContactsPayload searchParams={resolvedParams} />
      </Suspense>
    </section>
  );
}

async function ContactsPayload({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, type, sort, page } = searchParams;

  const isCustomers = type === "customers";
  const isSuppliers = type === "suppliers";

  const currentSort = typeof sort === "string" ? sort : "name";

  const currentPage =
    typeof page === "string" && Number(page) > 0 ? Number(page) : 1;

  const searchTerm =
    typeof search === "string" && search.length >= 3 ? search : undefined;

  const contactsResponse = await getContactsPage({
    page: currentPage,
    search: searchTerm,
  });

  if (isApiError(contactsResponse)) {
    return <p>{contactsResponse.message}</p>;
  }

  const activeContacts = contactsResponse.results.filter(
    (contact) => contact.is_active,
  );

  const contacts = activeContacts
    .filter((contact) => {
      if (isCustomers) return contact.kind === "customer";
      if (isSuppliers) return contact.kind === "supplier";

      return true;
    })
    .sort((a, b) => {
      if (currentSort === "code") {
        return (a.code || "").localeCompare(b.code || "", "pt-BR", {
          sensitivity: "base",
          numeric: true,
        });
      }

      if (currentSort === "recent") {
        return b.created_at.localeCompare(a.created_at);
      }

      const nameA = a.kind === "customer" ? a.name : a.legal_name;

      const nameB = b.kind === "customer" ? b.name : b.legal_name;

      return nameA.localeCompare(nameB, "pt-BR", {
        sensitivity: "base",
      });
    });

  return (
    <>
      <div className="grid mt-0 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      <Pagination count={contactsResponse.count} />
    </>
  );
}

function ContactsSkeleton() {
  return (
    <>
      <div className="grid mt-0 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <ContactCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Skeleton className="h-8 w-32" />
      </div>
    </>
  );
}

function ContactCardSkeleton() {
  return (
    <div className="border p-4 min-h-32">
      <Skeleton className="h-5 w-32" />

      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
