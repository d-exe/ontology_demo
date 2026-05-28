# ontology-is-code

A small, clickable demonstration of how data agents should be grounded
in an ontology — treated as code, not as rows in a table.

**Live site:** https://d-exe.github.io/ontology_demo/

## What's here
- `concepts/` — twelve example concepts as plain YAML
- `viewer/` — a static React site that browses them
- `scripts/build_concepts_json.py` — validates the YAML and emits the bundle the viewer reads

## Run locally
```bash
pip install pyyaml jsonschema
python scripts/build_concepts_json.py
cd viewer && npm install && npm run dev
```

## Why
See the landing page on the live site, or read SPEC.md.

MIT.
