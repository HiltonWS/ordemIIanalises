import { searchEntities } from "@/src/lib/search";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = searchEntities(q);

  return (
    <main className="grid gap-4">
      <h2 className="text-xl font-semibold">Search</h2>
      <form className="flex gap-2" action="/search">
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          name="q"
          defaultValue={q}
          placeholder="name, id, tag, source, version..."
        />
        <button className="rounded bg-emerald-700 px-4 py-2 text-white" type="submit">
          Buscar
        </button>
      </form>
      <p className="text-sm text-zinc-400">{results.length} resultado(s)</p>
      <ul className="grid gap-2">
        {results.map((entity) => (
          <li key={entity.id} className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <Link href={`/entities/${entity.id}`} className="font-medium">
              {entity.name}
            </Link>
            <p className="text-sm text-zinc-400">
              {entity.type} • {entity.version} • {entity.sourceIds.join(", ")} • {entity.contentStatus}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
