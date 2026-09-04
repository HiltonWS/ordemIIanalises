import { notFound } from "next/navigation";
import { entities } from "@/src/lib/mock-data";

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = entities.find((item) => item.id === id);

  if (!entity) {
    notFound();
  }

  return (
    <main className="grid gap-4">
      <h2 className="text-xl font-semibold">{entity.name}</h2>
      <p className="text-sm text-zinc-300">ID: {entity.id}</p>
      <div className="grid gap-2 rounded border border-zinc-800 bg-zinc-900 p-4 text-sm">
        <p>Type: {entity.type}</p>
        <p>Version: {entity.version}</p>
        <p>Status: {entity.contentStatus}</p>
        <p>Verification: {entity.verificationStatus}</p>
        <p>Aliases: {(entity.aliases ?? []).join(", ") || "-"}</p>
        <p>Tags: {entity.tags.join(", ")}</p>
        <p>Sources: {entity.sourceIds.join(", ")}</p>
      </div>

      <section className="rounded border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-2 font-medium">Relationships</h3>
        {entity.relationships.length === 0 ? (
          <p className="text-sm text-zinc-400">Sem relações registradas.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {entity.relationships.map((relation) => (
              <li key={relation.id}>
                {relation.type}: {relation.sourceEntityId} → {relation.targetEntityId} ({relation.confidence})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-2 font-medium">Source provenance</h3>
        <ul className="grid gap-2 text-sm">
          {entity.provenance.map((item, index) => (
            <li key={`${item.documentId}-${index}`}>
              {item.documentId} • page {item.page ?? "unknown"} • method {item.method} • confidence {item.confidence}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
