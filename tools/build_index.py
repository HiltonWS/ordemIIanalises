#!/usr/bin/env python3
"""Build the private OP2 playtest index from an owned PDF and extracted extras.

The output is deterministic: file hashes and stable record ids allow a later
playtest import to be compared without relying on filenames alone.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image
from pypdf import PdfReader


SECTIONS = [
    (1, 1, "Capa", "abertura"),
    (2, 3, "Apresentação", "abertura"),
    (4, 5, "Introdução", "regras"),
    (6, 13, "Cartas dos autores", "design"),
    (14, 17, "Fichas de personagem", "fichas"),
    (18, 26, "Regras", "regras"),
    (27, 27, "Ato I — abertura", "ato-i"),
    (28, 64, "A Maldição do Ídolo de Pedra — Ato I", "ato-i"),
    (65, 70, "Ferramentas da Ordo Realitas", "ferramentas"),
    (71, 71, "Ato II — abertura", "ato-ii"),
    (72, 103, "A Maldição do Ídolo de Pedra — Ato II", "ato-ii"),
]

TAG_RULES = {
    "investigação": ["investiga", "ponto de interesse", "evidência"],
    "teste": ["teste", "dificuldade", " dt "],
    "dados": ["dado", "d4", "d6", "d8", "d10", "d12", "d20"],
    "crítico": ["crítico", "crítica"],
    "determinação": ["determinação", " pd"],
    "vida": ["pontos de vida", " pv", "ferimento"],
    "trauma": ["trauma"],
    "perfis": ["executor", "analista", "vigilante"],
    "perícias": ["perícia"],
    "desafio de acesso": ["desafio de acesso", "bloqueio de acesso"],
    "arrombar": ["arrombar"],
    "hack técnico": ["hackear sistema", "hack técnico", "tecnologia"],
    "hack social": ["hackear pessoa", "hack social"],
    "alcançar": ["alcançar"],
    "sustentar": ["sustentar"],
    "ferramentas": ["ferramenta", "laboratório portátil", "medidor emf"],
    "compendium": ["compendium", "manifestação"],
    "ritual": ["ritual"],
    "paranormal": ["paranormal", "outro lado"],
    "ídolo": ["ídolo de pedra"],
    "personagens": ["alan", "edgar", "eloísa", "kênia", "victor", "amanda", "antônio", "heitor", "raven", " val "],
}


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def normalize_spaces(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).replace(" \n", "\n").strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def section_for(page: int) -> tuple[str, str]:
    for start, end, label, code in SECTIONS:
        if start <= page <= end:
            return label, code
    return "Sem seção", "outro"


def infer_tags(text: str, initial: list[str]) -> list[str]:
    folded = f" {text.casefold()} "
    tags = set(initial)
    for tag, needles in TAG_RULES.items():
        if any(needle in folded for needle in needles):
            tags.add(tag)
    return sorted(tags)


def title_for_page(page: int, text: str, section: str) -> str:
    fixed = {
        1: "Capa",
        2: "Carta de abertura",
        3: "Sumário e créditos",
        6: "Cartas dos autores",
        14: "Ficha de personagem",
        18: "Testes",
        27: "Ato I",
        65: "Ferramentas da Ordo Realitas",
        71: "Ato II",
        103: "Encerramento",
    }
    if page in fixed:
        return fixed[page]
    lines = [normalize_spaces(line) for line in text.splitlines() if normalize_spaces(line)]
    for line in lines[:8]:
        letters = [c for c in line if c.isalpha()]
        if 3 <= len(line) <= 90 and letters and sum(c.isupper() for c in letters) / len(letters) > 0.78:
            return line.title()
    return f"{section} — página {page}"


def pdf_pages(pdf_path: Path, text_path: Path, version_label: str, version_id: str) -> list[dict[str, Any]]:
    raw = text_path.read_text(encoding="utf-8", errors="replace")
    chunks = raw.split("\f")
    reader = PdfReader(str(pdf_path))
    page_count = len(reader.pages)
    records: list[dict[str, Any]] = []
    for page in range(1, page_count + 1):
        # pdftotext emits a form-feed for the image-only cover, so page N is chunk N-1.
        text = normalize_spaces(chunks[page - 1] if page - 1 < len(chunks) else "")
        section, section_code = section_for(page)
        act = "Ato I" if section_code == "ato-i" else "Ato II" if section_code == "ato-ii" else "Sistema"
        base_tags = ["oficial", "playtest alpha", "v1.0", section_code, act.casefold()]
        tags = infer_tags(text, base_tags)
        records.append(
            {
                "id": f"{version_id}-p{page:03d}",
                "canonicalId": f"page-{page:03d}",
                "version": version_label,
                "kind": "Página",
                "title": title_for_page(page, text, section),
                "page": page,
                "act": act,
                "section": section,
                "provenance": "oficial",
                "tags": tags,
                "excerpt": (text[:430] + "…") if len(text) > 430 else text,
                "text": text,
                "source": pdf_path.name,
                "contentHash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            }
        )
    return records


def category_for(path: Path) -> str:
    value = str(path).casefold()
    if "ficha" in path.name.casefold():
        return "Ficha"
    if "histórico" in value or "historico" in value:
        return "Histórico"
    if "handout" in value:
        return "Handout"
    if "mapa" in value:
        return "Mapa"
    if "música" in value or "musica" in value:
        return "Áudio"
    if "token" in value:
        return "Token"
    return "Arquivo extra"


def person_for(path: Path) -> str | None:
    known = ["Alan", "Edgar", "Eloísa", "Kênia", "Victor", "Amanda", "Antônio", "Heitor", "Raven", "Val", "Gustavo"]
    folded = path.name.casefold()
    return next((name for name in known if name.casefold() in folded), None)


def asset_metadata(path: Path) -> dict[str, Any]:
    suffix = path.suffix.casefold()
    meta: dict[str, Any] = {"bytes": path.stat().st_size, "extension": suffix.lstrip(".")}
    try:
        if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
            with Image.open(path) as image:
                meta.update({"width": image.width, "height": image.height, "colorMode": image.mode})
        elif suffix == ".pdf":
            reader = PdfReader(str(path))
            fields = reader.get_fields() or {}
            meta.update({"pages": len(reader.pages), "formFields": len(fields)})
        elif suffix in {".mp3", ".wav", ".ogg"}:
            proc = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", str(path)],
                check=False,
                capture_output=True,
                text=True,
            )
            if proc.returncode == 0 and proc.stdout.strip():
                meta["durationSeconds"] = round(float(proc.stdout.strip()), 2)
    except Exception as exc:  # Preserve the record even if a single metadata parser fails.
        meta["metadataWarning"] = type(exc).__name__
    return meta


def clean_asset_title(path: Path) -> str:
    return normalize_spaces(re.sub(r"[_-]+", " ", path.stem))


def asset_records(extras_root: Path, version_label: str, version_id: str) -> list[dict[str, Any]]:
    files = sorted(path for path in extras_root.rglob("*") if path.is_file())
    records: list[dict[str, Any]] = []
    for path in files:
        rel = path.relative_to(extras_root)
        rel_folded = str(rel).casefold()
        act = "Ato II" if "ato-ii" in rel_folded or "ato ii" in rel_folded else "Ato I"
        category = category_for(rel)
        person = person_for(rel)
        title = clean_asset_title(path)
        base_tags = ["extra oficial", "playtest alpha", "v1.0", act.casefold(), category.casefold()]
        if person:
            base_tags.extend(["personagem", person.casefold()])
        tags = infer_tags(f"{rel} {title}", base_tags)
        if category == "Handout":
            tags.extend(["pista visual", "evidência"])
        if "preenchível" in rel_folded:
            tags.extend(["preenchível", "formulário"])
        tags = sorted(set(tags))
        records.append(
            {
                "id": f"{version_id}-asset-{slug(str(rel))}",
                "canonicalId": f"asset-{slug(str(rel))}",
                "version": version_label,
                "kind": category,
                "title": title,
                "act": act,
                "section": category,
                "person": person,
                "provenance": "extra oficial",
                "tags": tags,
                "excerpt": f"{category} oficial do {act}. Indexado por nome, formato, dimensões/duração e hash; conteúdo visual não foi republicado.",
                "source": str(rel),
                "contentHash": sha256(path),
                "metadata": asset_metadata(path),
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--text", required=True, type=Path)
    parser.add_argument("--extras", required=True, type=Path)
    parser.add_argument("--curated", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--version", default="Alpha v1.0")
    parser.add_argument("--version-id", default="alpha-v1.0")
    parser.add_argument("--date", default="2026-08")
    args = parser.parse_args()

    pages = pdf_pages(args.pdf, args.text, args.version, args.version_id)
    assets = asset_records(args.extras, args.version, args.version_id)
    curated = json.loads(args.curated.read_text(encoding="utf-8"))
    all_records = pages + assets
    type_counts = Counter(record["kind"] for record in all_records)
    tag_counts = Counter(tag for record in all_records for tag in record["tags"])
    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "project": {
            "name": "Arquivo do Playtest — Ordem Paranormal RPG 2",
            "scope": "Projeto privado e independente para estudo do playtest Alpha v1.0",
            "activeVersion": args.version,
            "futureReady": True,
        },
        "stats": {
            "records": len(all_records),
            "pages": len(pages),
            "assets": len(assets),
            "types": dict(sorted(type_counts.items())),
            "uniqueTags": len(tag_counts),
            "topTags": tag_counts.most_common(18),
        },
        "versions": [
            {
                "id": args.version_id,
                "label": args.version,
                "date": args.date,
                "status": "indexada",
                "pages": len(pages),
                "assets": len(assets),
                "fingerprint": hashlib.sha256("".join(record["contentHash"] for record in all_records).encode()).hexdigest(),
            }
        ],
        "records": all_records,
        **curated,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["stats"], ensure_ascii=False))


if __name__ == "__main__":
    main()
