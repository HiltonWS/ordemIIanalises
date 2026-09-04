import { entities } from "./mock-data";

export function searchEntities(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return entities;

  return entities.filter((entity) => {
    const haystack = [
      entity.id,
      entity.name,
      entity.type,
      entity.version,
      ...entity.tags,
      ...entity.sourceIds,
      ...(entity.aliases ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
