import { entities, sourceManifests } from "../../src/lib/mock-data";
import { entitySchema, findBrokenRelationshipTargets, findDuplicateEntityIds, sourceManifestSchema } from "../../src/lib/validation";

for (const source of sourceManifests) {
  sourceManifestSchema.parse(source);
}

for (const entity of entities) {
  entitySchema.parse(entity);
}

const duplicates = findDuplicateEntityIds(entities);
const broken = findBrokenRelationshipTargets(entities);

if (duplicates.length || broken.length) {
  console.error(JSON.stringify({ duplicates, broken }, null, 2));
  process.exit(1);
}

console.log("Validation passed.");
