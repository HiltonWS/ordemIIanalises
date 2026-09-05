#!/usr/bin/env python3
"""Compare two generated OP2 archive indexes without mutating either one."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any


def fold(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def signature(record: dict[str, Any]) -> tuple[str, str, str]:
    return (record.get("kind", ""), fold(record.get("title", "")), fold(record.get("act", "")))


def changed_fields(before: dict[str, Any], after: dict[str, Any]) -> list[str]:
    fields = ["title", "contentHash", "tags", "page", "metadata", "source", "section"]
    return [field for field in fields if before.get(field) != after.get(field)]


def compare(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    left = list(before.get("records", []))
    right = list(after.get("records", []))
    right_unused = {record["id"]: record for record in right}
    changes: list[dict[str, Any]] = []

    by_canonical = {record.get("canonicalId"): record for record in right if record.get("canonicalId")}
    by_signature = {signature(record): record for record in right}
    by_hash: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for record in right:
        by_hash.setdefault((record.get("kind", ""), record.get("contentHash", "")), []).append(record)

    for old in left:
        match = None
        reason = ""
        if old.get("canonicalId") in by_canonical:
            match, reason = by_canonical[old["canonicalId"]], "canonicalId"
        elif signature(old) in by_signature:
            match, reason = by_signature[signature(old)], "assinatura"
        else:
            hash_matches = by_hash.get((old.get("kind", ""), old.get("contentHash", "")), [])
            match = next((candidate for candidate in hash_matches if candidate["id"] in right_unused), None)
            if match:
                reason = "hash"
        if not match:
            candidates = [candidate for candidate in right_unused.values() if candidate.get("kind") == old.get("kind") and candidate.get("act") == old.get("act")]
            scored = [(SequenceMatcher(None, fold(old.get("title", "")), fold(candidate.get("title", ""))).ratio(), candidate) for candidate in candidates]
            if scored:
                score, candidate = max(scored, key=lambda pair: pair[0])
                if score >= 0.88:
                    match, reason = candidate, f"similaridade:{score:.2f}"

        if not match:
            changes.append({"state": "removido", "before": old, "after": None, "fields": [], "match": None})
            continue
        right_unused.pop(match["id"], None)
        fields = changed_fields(old, match)
        if not fields:
            state = "inalterado"
        elif old.get("contentHash") == match.get("contentHash") and old.get("title") != match.get("title"):
            state = "renomeado"
        elif old.get("contentHash") == match.get("contentHash") and old.get("page") != match.get("page"):
            state = "movido"
        else:
            state = "alterado"
        changes.append({"state": state, "before": old, "after": match, "fields": fields, "match": reason})

    for record in right_unused.values():
        changes.append({"state": "adicionado", "before": None, "after": record, "fields": [], "match": None})

    counts = Counter(change["state"] for change in changes)
    return {
        "schemaVersion": 1,
        "from": before.get("versions", [{}])[0],
        "to": after.get("versions", [{}])[0],
        "summary": dict(sorted(counts.items())),
        "changes": changes,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    before = json.loads(args.before.read_text(encoding="utf-8"))
    after = json.loads(args.after.read_text(encoding="utf-8"))
    result = compare(before, after)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
