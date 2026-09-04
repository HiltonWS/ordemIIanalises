import { entities, sourceManifests } from "@/src/lib/mock-data";

export default function Home() {
  const verifiedCount = entities.filter((e) => e.verificationStatus === "VERIFIED").length;
  const pendingCount = entities.filter((e) => e.verificationStatus === "REVIEW_PENDING").length;
  const relationshipCount = entities.reduce((acc, entity) => acc + entity.relationships.length, 0);

  const cards = [
    ["Documentos", sourceManifests.length],
    ["Entidades", entities.length],
    ["Verificadas", verifiedCount],
    ["Pendentes", pendingCount],
    ["Relações", relationshipCount],
    ["Versões", new Set(entities.map((e) => e.version)).size],
  ];

  return (
    <main className="grid gap-4">
      <p className="text-zinc-300">
        Fundação do projeto com dados mock explicitamente experimentais e rastreáveis.
      </p>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
