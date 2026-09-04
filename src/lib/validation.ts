import { z } from "zod";
import { contentStatuses, relationshipTypes, verificationStatuses } from "./types";

export const stableIdRegex = /^(character\.agent|creature|npc|item|weapon|ritual|ability|skill|condition|rule|mechanic|location|organization|mission|evidence|concept)\.[a-z0-9-]+(\.[a-z0-9-]+)*$/;

export const sourceManifestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  type: z.string().min(1),
  filename: z.string().min(1),
  sha256: z.string(),
  imported_at: z.string(),
  language: z.string().min(2),
  status: z.string().min(1),
  notes: z.string(),
  source_origin: z.string().min(1),
  publication_date: z.string(),
  supersedes: z.string(),
  superseded_by: z.string(),
});

export const provenanceSchema = z.object({
  documentId: z.string().min(1),
  page: z.number().int().nonnegative().optional(),
  section: z.string().optional(),
  excerptId: z.string().optional(),
  method: z.enum(["manual", "pdf-text-extraction", "ocr", "import", "ai-suggestion"]),
  confidence: z.enum(["high", "medium", "low", "unknown"]),
  verified: z.boolean(),
  notes: z.string().optional(),
});

export const relationshipSchema = z.object({
  id: z.string().min(1),
  sourceEntityId: z.string().regex(stableIdRegex),
  targetEntityId: z.string().regex(stableIdRegex),
  type: z.enum(relationshipTypes),
  sourceDocumentId: z.string().optional(),
  sourcePage: z.number().int().nonnegative().optional(),
  sourceSection: z.string().optional(),
  version: z.string().optional(),
  confidence: z.enum(["verified", "probable", "suggested", "unknown"]),
  notes: z.string().optional(),
});

export const entitySchema = z.object({
  id: z.string().regex(stableIdRegex),
  type: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  version: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)),
  relationships: z.array(relationshipSchema),
  mechanics: z.record(z.string(), z.unknown()).optional(),
  stats: z.record(z.string(), z.unknown()).optional(),
  contentStatus: z.enum(contentStatuses),
  verificationStatus: z.enum(verificationStatuses),
  provenance: z.array(provenanceSchema).min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Entity = z.infer<typeof entitySchema>;

export function validateStableId(id: string) {
  return stableIdRegex.test(id);
}

export function findDuplicateEntityIds(entities: Entity[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const entity of entities) {
    if (seen.has(entity.id)) duplicates.add(entity.id);
    seen.add(entity.id);
  }

  return [...duplicates];
}

export function findBrokenRelationshipTargets(entities: Entity[]) {
  const ids = new Set(entities.map((entity) => entity.id));

  return entities.flatMap((entity) =>
    entity.relationships
      .filter((relationship) => !ids.has(relationship.targetEntityId))
      .map((relationship) => ({
        relationshipId: relationship.id,
        sourceEntityId: entity.id,
        targetEntityId: relationship.targetEntityId,
      })),
  );
}
