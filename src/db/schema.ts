import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  version: text("version").notNull(),
  type: text("type").notNull(),
  filename: text("filename").notNull(),
  sha256: text("sha256"),
  importedAt: text("imported_at"),
  language: text("language").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  sourceOrigin: text("source_origin"),
  publicationDate: text("publication_date"),
  supersedes: text("supersedes"),
  supersededBy: text("superseded_by"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sourcePages = sqliteTable("source_pages", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sourceBlocks = sqliteTable("source_blocks", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  pageId: text("page_id").notNull(),
  section: text("section"),
  text: text("text").notNull(),
  extractionMethod: text("extraction_method").notNull(),
  createdAt: text("created_at").notNull(),
});

export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  summary: text("summary"),
  description: text("description"),
  contentStatus: text("content_status").notNull(),
  verificationStatus: text("verification_status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const entityVersions = sqliteTable("entity_versions", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(),
  version: text("version").notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  createdAt: text("created_at").notNull(),
});

export const provenance = sqliteTable("provenance", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(),
  documentId: text("document_id").notNull(),
  page: integer("page"),
  section: text("section"),
  excerptId: text("excerpt_id"),
  method: text("method").notNull(),
  confidence: text("confidence").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const relationships = sqliteTable("relationships", {
  id: text("id").primaryKey(),
  sourceEntityId: text("source_entity_id").notNull(),
  targetEntityId: text("target_entity_id").notNull(),
  type: text("type").notNull(),
  sourceDocumentId: text("source_document_id"),
  sourcePage: integer("source_page"),
  sourceSection: text("source_section"),
  version: text("version"),
  confidence: text("confidence").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull(),
});

export const entityTags = sqliteTable("entity_tags", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(),
  tagId: text("tag_id").notNull(),
});

export const annotations = sqliteTable("annotations", {
  id: text("id").primaryKey(),
  targetId: text("target_id").notNull(),
  text: text("text").notNull(),
  tagsJson: text("tags_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const comparisons = sqliteTable("comparisons", {
  id: text("id").primaryKey(),
  fromVersion: text("from_version").notNull(),
  toVersion: text("to_version").notNull(),
  createdAt: text("created_at").notNull(),
});

export const comparisonChanges = sqliteTable("comparison_changes", {
  id: text("id").primaryKey(),
  comparisonId: text("comparison_id").notNull(),
  entityId: text("entity_id").notNull(),
  changeType: text("change_type").notNull(),
  detailsJson: text("details_json").notNull(),
});

export const reviewItems = sqliteTable("review_items", {
  id: text("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  status: text("status").notNull(),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const researchSources = sqliteTable("research_sources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  url: text("url"),
  evidenceLevel: text("evidence_level").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const researchQuestions = sqliteTable("research_questions", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  status: text("status").notNull(),
  answer: text("answer"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  path: text("path").notNull(),
  metadataJson: text("metadata_json"),
  createdAt: text("created_at").notNull(),
});

export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(),
  purpose: text("purpose").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull(),
  sourceBasisJson: text("source_basis_json").notNull(),
  negativeConstraintsJson: text("negative_constraints_json").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: text("created_at").notNull(),
});
