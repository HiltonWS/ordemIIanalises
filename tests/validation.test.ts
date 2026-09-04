import { describe, expect, it } from "vitest";
import { entities, sourceManifests } from "../src/lib/mock-data";
import {
  entitySchema,
  findBrokenRelationshipTargets,
  findDuplicateEntityIds,
  sourceManifestSchema,
  validateStableId,
} from "../src/lib/validation";

describe("stable IDs", () => {
  it("accepts valid stable IDs", () => {
    expect(validateStableId("creature.mock.example")).toBe(true);
    expect(validateStableId("rule.mock.example")).toBe(true);
  });

  it("rejects invalid IDs", () => {
    expect(validateStableId("mock.invalid")).toBe(false);
  });
});

describe("schemas", () => {
  it("validates source manifests", () => {
    for (const source of sourceManifests) {
      expect(() => sourceManifestSchema.parse(source)).not.toThrow();
    }
  });

  it("validates entities", () => {
    for (const entity of entities) {
      expect(() => entitySchema.parse(entity)).not.toThrow();
    }
  });
});

describe("integrity", () => {
  it("has no duplicate entity IDs", () => {
    expect(findDuplicateEntityIds(entities)).toEqual([]);
  });

  it("has no broken relationship targets", () => {
    expect(findBrokenRelationshipTargets(entities)).toEqual([]);
  });
});
