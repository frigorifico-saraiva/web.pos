import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex flex-col mt-12 text-6xl sm:text-8xl font-light">
          <Link href={"/pdv"}>
            <span className="text-2xl">1</span>
            pdv
          </Link>

          <Link href={"/caixa"}>
            <span className="text-2xl">2</span>
            caixa
          </Link>

          <Link href={"/fiados"}>
            <span className="text-2xl">3</span>
            fiados
          </Link>

          <Link href={"/contatos"}>
            <span className="text-2xl">4</span>
            contatos
          </Link>

          <Link href={"/vendas"}>
            <span className="text-2xl">5</span>
            vendas
          </Link>

          <Link href={"/produtos"}>
            <span className="text-2xl">6</span>
            produtos
          </Link>
    </main>
  );
}
