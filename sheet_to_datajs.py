#!/usr/bin/env python3
"""sheet_to_datajs.py

Zet Google Sheet exports om naar data.js voor de Molenzicht-stemwijzer.

Invoeropties
1) XLSX (aanrader) met tabs:
   - Stellingen: statement_id, thema, stelling, toelichting   (toelichting = kolom D)
   - Partij-antwoorden: partij, statement_id, positie, toelichting

2) CSV's:
   - stellingen.csv (zelfde kolommen)
   - partij_antwoorden.csv (zelfde kolommen)

Gebruik
  py sheet_to_datajs.py --xlsx "Stemwijzer 2026 Molenzicht.xlsx" --out data.js
  py sheet_to_datajs.py --stellingen stellingen.csv --antwoorden partij_antwoorden.csv --out data.js

Posities (herkend, hoofdletter-ongevoelig)
  - Eens
  - Oneens
  - Geen mening / Geen van beide

Opmerking
  In jouw sheet staan statement_id's als 1..12. We normaliseren dat naar s1..s12.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

import pandas as pd


# Vaste thema-set (zoals jij die wil tonen en wegen)
THEMES_FIXED = [
    ("bouwmassa", "Bouwmassa"),
    ("milieu", "Milieu-effecten"),
    ("ontsluiting", "Verkeersontsluiting"),
    ("parkeren", "Parkeren"),
    ("molenbiotoop", "Molenbiotoop"),
    ("leefkwaliteit", "Leefkwaliteit"),
    ("participatie", "Participatie"),
]

# Mapping van (mogelijke) sheet-waarden -> themeId
THEME_MAP = {
    "bouwmassa": "bouwmassa",
    "milieu-effecten": "milieu",
    "milieueffecten": "milieu",
    "milieu": "milieu",
    "verkeersontsluiting": "ontsluiting",
    "ontsluiting": "ontsluiting",
    "parkeren": "parkeren",
    "molenbiotoop": "molenbiotoop",
    "leefkwaliteit": "leefkwaliteit",
    "participatie": "participatie",
    "particpatie": "participatie",  # veelgemaakte typefout
}


def slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = s.replace("&", " en ")
    s = re.sub(r"[\s\-]+", "_", s)
    s = re.sub(r"[^a-z0-9_]+", "", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "item"


def norm_party_name(name: str) -> str:
    n = (name or "").strip()
    if n.lower() in {"groen-links", "groen links"}:
        return "GroenLinks"
    return n


def norm_statement_id(x) -> str:
    """Normalize statement IDs to s1..sN where possible."""
    if x is None:
        raise ValueError("statement_id is leeg")

    if isinstance(x, int):
        return f"s{int(x)}"

    if isinstance(x, float) and x.is_integer():
        return f"s{int(x)}"

    s = str(x).strip()
    if re.fullmatch(r"\d+", s):
        return f"s{int(s)}"
    if re.fullmatch(r"\d+\.0", s):
        return f"s{int(float(s))}"
    if re.fullmatch(r"s\d+", s, re.IGNORECASE):
        return "s" + re.sub(r"^s", "", s, flags=re.IGNORECASE)

    return s


def norm_theme(theme_raw: str) -> str:
    t = (theme_raw or "").strip().lower()
    t = t.replace("-", " ").strip()
    t = re.sub(r"\s+", " ", t)
    t_key = t.replace(" ", "")  # for some quick matches

    if t in THEME_MAP:
        return THEME_MAP[t]
    if t_key in THEME_MAP:
        return THEME_MAP[t_key]

    slug = slugify(t)
    return THEME_MAP.get(slug, slug)


def pos_to_code(pos_raw: str) -> int:
    p = (pos_raw or "").strip().lower()
    p = re.sub(r"\s+", " ", p)

    if p in {"eens", "helemaal eens", "ja"}:
        return 1
    if p in {"oneens", "helemaal oneens", "nee"}:
        return -1
    if p in {"geen mening", "geen van beide", "neutraal", "onbeslist", "weet niet", "n.v.t.", "nvt"}:
        return 0

    if p == "":
        return 0

    raise ValueError(
        f"Onbekende positie: {pos_raw!r} (verwacht Eens/Oneens/Geen mening/Geen van beide)"
    )


@dataclass
class Statement:
    id: str
    theme_id: str
    text: str
    uitleg: str  # toelichting bij de stelling (tab Stellingen kolom D)


def read_from_xlsx(path: Path) -> Tuple[pd.DataFrame, pd.DataFrame]:
    stellingen = pd.read_excel(path, sheet_name="Stellingen")
    antwoorden = pd.read_excel(path, sheet_name="Partij-antwoorden")
    return stellingen, antwoorden


def read_from_csv(stellingen_csv: Path, antwoorden_csv: Path) -> Tuple[pd.DataFrame, pd.DataFrame]:
    stellingen = pd.read_csv(stellingen_csv)
    antwoorden = pd.read_csv(antwoorden_csv)
    return stellingen, antwoorden


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def build_data(
    stellingen_df: pd.DataFrame,
    antwoorden_df: pd.DataFrame
) -> Tuple[List[Tuple[str, str]], List[Statement], List[dict]]:
    # Normalize column names
    stellingen_df = _normalize_columns(stellingen_df)
    antwoorden_df = _normalize_columns(antwoorden_df)

    # Statements
    statements: List[Statement] = []
    seen_ids = set()

    for _, row in stellingen_df.iterrows():
        sid = norm_statement_id(row.get("statement_id"))
        if sid in seen_ids:
            raise ValueError(f"Dubbele statement_id gevonden: {sid}")
        seen_ids.add(sid)

        theme_id = norm_theme(row.get("thema"))
        text = str(row.get("stelling") or "").strip()
        if not text:
            raise ValueError(f"Lege stellingtekst bij {sid}")

        # Primair: kolomnaam "toelichting"
        uitleg = str(row.get("toelichting") or "").strip()

        # Fallback: pak kolom D (4e kolom) als de naam anders is of leeg is
        if not uitleg:
            try:
                uitleg = str(row.iloc[3] or "").strip()
            except Exception:
                uitleg = ""

        statements.append(Statement(id=sid, theme_id=theme_id, text=text, uitleg=uitleg))

    statements.sort(key=lambda s: int(re.sub(r"\D", "", s.id) or 0))

    # Parties
    antwoorden_df = antwoorden_df.copy()
    antwoorden_df["partij"] = antwoorden_df["partij"].map(norm_party_name)
    antwoorden_df["statement_id"] = antwoorden_df["statement_id"].map(norm_statement_id)

    parties = []
    for party_name in sorted(antwoorden_df["partij"].dropna().unique()):
        party_id = slugify(party_name)

        answers = {}
        party_rows = antwoorden_df[antwoorden_df["partij"] == party_name]
        by_sid = {r["statement_id"]: r for _, r in party_rows.iterrows()}

        for st in statements:
            r = by_sid.get(st.id)
            if r is None:
                answers[st.id] = {"pos": 0, "note": ""}
                continue

            pos = pos_to_code(r.get("positie"))
            note = str(r.get("toelichting") or "").strip()
            answers[st.id] = {"pos": pos, "note": note}

        parties.append({"id": party_id, "name": party_name, "answers": answers})

    # Themes: vaste set, maar check op onbekende themeIds
    used_theme_ids = {st.theme_id for st in statements}
    fixed_ids = {tid for tid, _ in THEMES_FIXED}
    unknown = sorted(used_theme_ids - fixed_ids)

    if unknown:
        extra = [(tid, f"{tid} (controleer thema)") for tid in unknown]
        themes = THEMES_FIXED + extra
    else:
        themes = THEMES_FIXED

    return themes, statements, parties


def js_escape_template_literal(s: str) -> str:
    s = (s or "")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


def to_data_js(themes: List[Tuple[str, str]], statements: List[Statement], parties: List[dict]) -> str:
    lines: List[str] = []
    lines.append("// data.js – gegenereerd uit Google Sheet/Excel")
    lines.append("// Codering: 1 = eens, 0 = geen mening, -1 = oneens")
    lines.append("")

    lines.append("export const THEMES = [")
    for tid, label in themes:
        lines.append(f"  {{ id: {tid!r}, label: {label!r} }},")
    lines.append("];\n")

    lines.append("export const STATEMENTS = [")
    for st in statements:
        text = js_escape_template_literal(st.text)
        uitleg = js_escape_template_literal(st.uitleg or "")
        lines.append(
            f"  {{ id: {st.id!r}, themeId: {st.theme_id!r}, text: `{text}`, uitleg: `{uitleg}` }},"
        )
    lines.append("];\n")

    lines.append("export const PARTIES = [")
    for p in parties:
        lines.append("  {")
        lines.append(f"    id: {p['id']!r},")
        lines.append(f"    name: {p['name']!r},")
        lines.append("    answers: {")
        for st_id, a in p["answers"].items():
            note = js_escape_template_literal(a.get("note", ""))
            lines.append(f"      {st_id}: {{ pos: {int(a['pos'])}, note: `{note}` }},")
        lines.append("    },")
        lines.append("  },")
    lines.append("];\n")

    lines.append("// Standpunten per partij (tabblad: standpunten)")
    lines.append("// Velden: wonen_bouwen / verkeer_parkeren / molenzicht")
    lines.append("export const PARTY_STANDPOINTS = {")
    for p in parties:
        pid = p["id"]
        lines.append(f"  {pid!r}: {{ wonen_bouwen: '', verkeer_parkeren: '', molenzicht: '' }},")
    lines.append("};\n")

    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", type=str, default="", help="Pad naar .xlsx export")
    ap.add_argument("--stellingen", type=str, default="", help="Pad naar stellingen.csv")
    ap.add_argument("--antwoorden", type=str, default="", help="Pad naar partij_antwoorden.csv")
    ap.add_argument("--out", type=str, default="data.js", help="Uitvoerbestand (data.js)")
    args = ap.parse_args()

    if args.xlsx:
        stellingen_df, antwoorden_df = read_from_xlsx(Path(args.xlsx))
    else:
        if not args.stellingen or not args.antwoorden:
            raise SystemExit("Geef --xlsx of zowel --stellingen als --antwoorden")
        stellingen_df, antwoorden_df = read_from_csv(Path(args.stellingen), Path(args.antwoorden))

    themes, statements, parties = build_data(stellingen_df, antwoorden_df)
    js = to_data_js(themes, statements, parties)

    out_path = Path(args.out)
    out_path.write_text(js, encoding="utf-8")
    print(f"Geschreven: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
