import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(await readFile(new URL("../app/data/archive-index.json", import.meta.url), "utf8"));
const isPublicSample = archive.versions.some((version) => version.id === "public-demo");

test("dataset inventory matches its declared mode", () => {
  if (isPublicSample) {
    assert.equal(archive.stats.pages, 0);
    assert.equal(archive.stats.assets, 0);
    assert.equal(archive.stats.records, 0);
    assert.equal(archive.records.length, 0);
    return;
  }
  assert.deepEqual(
    [archive.stats.pages, archive.stats.assets, archive.stats.records, archive.records.length],
    [103, 72, 175, 175],
  );
});

test("record identity and provenance are traceable", () => {
  const ids = new Set();
  for (const record of archive.records) {
    assert.ok(record.id);
    assert.ok(record.canonicalId);
    assert.ok(record.contentHash?.match(/^[a-f0-9]{64}$/));
    assert.ok(record.provenance);
    assert.ok(record.tags.length > 0);
    assert.equal(ids.has(record.id), false, `duplicate id: ${record.id}`);
    ids.add(record.id);
  }
});

test("curated layers remain explicitly separated", () => {
  if (isPublicSample) {
    assert.ok(archive.mechanics.length >= 1);
    assert.ok(archive.pointsOfInterest.length >= 1);
    assert.ok(archive.originalPoints.length >= 1);
    assert.ok(archive.sheetConcepts.length >= 1);
  } else {
    assert.deepEqual(
      [archive.mechanics.length, archive.pointsOfInterest.length, archive.originalPoints.length, archive.sheetConcepts.length],
      [19, 16, 10, 3],
    );
  }
  assert.ok(archive.originalPoints.every((item) => item.tags.includes("homebrew original")));
  assert.ok(archive.sheetConcepts.every((item) => item.tags.includes("homebrew original")));
});

test("source register never marks a commercial book as downloaded", () => {
  const paid = archive.sources.filter((source) => source.tags.includes("pago"));
  assert.ok(archive.sources.length >= 1);
  assert.ok(paid.every((source) => source.downloaded === false));
});
