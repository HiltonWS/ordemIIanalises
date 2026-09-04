import { entities } from "@/src/lib/mock-data";

export default function EntitiesPage() {
  return (
    <main className="grid gap-4">
      <h2 className="text-xl font-semibold">Entities</h2>
      <ul className="grid gap-2">
        {entities.map((entity) => (
          <li key={entity.id} className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <a href={`/entities/${entity.id}`} className="font-medium">
              {entity.name}
            </a>
            <p className="text-sm text-zinc-400">
              ID: {entity.id} • Type: {entity.type} • Version: {entity.version}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
