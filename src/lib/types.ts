export const contentStatuses = [
  "official-source",
  "official-extracted",
  "official-verified",
  "interpretation",
  "inference",
  "external-reference",
  "experimental",
  "homebrew",
  "unknown",
] as const;

export const verificationStatuses = [
  "UNVERIFIED",
  "EXTRACTED",
  "REVIEW_PENDING",
  "VERIFIED",
  "REJECTED",
  "CONFLICT",
  "UNKNOWN",
] as const;

export const relationshipTypes = [
  "USES",
  "REQUIRES",
  "MODIFIES",
  "AFFECTS",
  "GRANTS",
  "REMOVES",
  "COUNTERS",
  "REFERENCES",
  "APPEARS_IN",
  "RELATED_TO",
  "REPLACES",
  "RENAMED_FROM",
  "VARIANT_OF",
  "DEPENDS_ON",
  "PART_OF",
] as const;

export type ContentStatus = (typeof contentStatuses)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];
export type RelationshipType = (typeof relationshipTypes)[number];
