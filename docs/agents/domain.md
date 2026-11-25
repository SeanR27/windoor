# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root: the domain language. Use its terms, and avoid the terms each entry lists under *Avoid*.
- **`docs/DECISIONS.md`**: a single append-only file of numbered `ADR-NNN` entries. Read the entries that touch the area you're about to work in. A superseded ADR names the one that replaced it.
- **`docs/REQUIREMENTS.md`**: rules with stable IDs (`LIN-07`, `PWR-08`, …) and open questions (`OQ-n`).

## File structure

This is a single-context repo:

```
/
├── GLOSSARY.md
├── AGENTS.md
└── docs/
    ├── DECISIONS.md      ← all ADRs, append-only
    ├── REQUIREMENTS.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    └── ROADMAP.md
```

New ADRs are appended to `docs/DECISIONS.md` as the next `ADR-NNN`. Never rewrite an accepted ADR; supersede it with a new entry and mark the old one `Superseded by ADR-n`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-006 (PPG snapshot at lock), but worth reopening because…_
