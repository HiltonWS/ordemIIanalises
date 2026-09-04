import { sourceManifests } from "@/src/lib/mock-data";

export default function SourcesPage() {
  return (
    <main className="grid gap-4">
      <h2 className="text-xl font-semibold">Sources</h2>
      <ul className="grid gap-2">
        {sourceManifests.map((source) => (
          <li key={source.id} className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <p className="font-medium">{source.title}</p>
            <p className="text-sm text-zinc-400">{source.id}</p>
            <p className="text-sm text-zinc-400">
              version {source.version} • file {source.filename} • status {source.status}
            </p>
            <p className="text-sm text-zinc-400">sha256: {source.sha256 || "UNKNOWN"}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
