# SPEC — ontology-is-code

A public, self-contained demonstration of the **“ontology is code”** approach to grounding LLM data agents. The repo is both a worked example and an explainer: a small e-commerce ontology in plain YAML, validated as code, and rendered as a static React site deployed via GitHub Pages.

The audience is anyone Dexter wants to show “this is what I mean when I say ontology-as-code for data agents” — engineers, data leaders, AI platform builders.

This SPEC is the complete brief. An AI coding agent (GitHub Copilot, Claude Code, etc.) should be able to build the entire project from this file alone.

-----

## 1. What we are building

A single public GitHub repo containing:

1. A small **ontology** (~12 concepts) defined as plain YAML files
1. A **build script** that validates the YAML and emits a single JSON bundle
1. A **static React app** that renders the ontology as a browsable, searchable, graph-visualised site
1. A **GitHub Pages deployment** that updates automatically on every push to `main`
1. A **landing page** that explains the approach — written for a smart skeptic, not an academic

The site has three jobs, in priority order:

1. Explain *why* ontology-as-code matters for data agents
1. Show what that actually looks like, with a real (small) example you can click through
1. Be cheap enough to keep maintained — a one-person side repo, not a platform

## 2. What we are NOT building

- A real production semantic layer (this is a demo)
- A backend, an API, a database, an auth system
- An ontology editor in the browser
- A query interface against real data
- Anything OWL/RDF/SHACL/triplestore-shaped — plain YAML only
- A mobile-optimised site (desktop browsers, v1)
- Anything that requires API keys at runtime (the demo is fully static)

If a feature would push this off “static site derived from a folder of YAML,” it does not belong in v1.

## 3. Repo layout

```
.
├── README.md                       ← short pitch + link to live site
├── SPEC.md                         ← this file
├── LICENSE                         ← MIT
├── .gitignore                      ← node_modules, dist, viewer/public/concepts.json
│
├── concepts/                       ← the ontology, one file per concept
│   ├── customer.yml
│   ├── order.yml
│   ├── order-line.yml
│   ├── product.yml
│   ├── category.yml
│   ├── shipment.yml
│   ├── address.yml
│   ├── payment.yml
│   ├── refund.yml
│   ├── review.yml
│   ├── risk-rating.yml
│   └── promotion.yml
│
├── schema/
│   └── concept.schema.json         ← JSON Schema for the concept format
│
├── scripts/
│   └── build_concepts_json.py      ← validates YAML, emits concepts.json
│
├── viewer/                         ← Vite + React + TS app
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── concepts.json           ← generated at build time, gitignored
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts
│       ├── data.ts                 ← loads concepts.json
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── ConceptList.tsx
│       │   ├── ConceptDetail.tsx
│       │   ├── Graph.tsx
│       │   └── About.tsx
│       └── components/
│           ├── Layout.tsx
│           ├── SearchBox.tsx
│           ├── ConceptCard.tsx
│           ├── PropertyTable.tsx
│           └── RelationList.tsx
│
└── .github/
    └── workflows/
        └── deploy.yml              ← build + deploy to GitHub Pages
```

## 4. Concept schema

Every file in `concepts/` follows this shape (formal JSON Schema in `schema/concept.schema.json`):

```yaml
id: customer                       # required, kebab-case, must match filename without .yml
label: Customer                    # required
description: >                     # required, one to three sentences of business meaning
  A person or organisation that buys products from the store.
synonyms: [client, buyer, account] # optional, drives search
owners: [demo-team]                # required, free-text for v1

properties:                        # required, ≥1
  - name: customer_id
    type: id
  - name: name
    type: string
  - name: email
    type: string
  - name: risk_rating
    type: enum
    values: [LOW, MEDIUM, HIGH]
  - name: created_at
    type: timestamp

relations:                         # optional
  - name: places
    target: order                  # must be a valid concept id
    cardinality: 1..n              # one of: 1, 0..1, 1..n, 0..n
    description: A customer places zero or more orders.

mapping:                           # required — what real data does this represent?
  source: snowflake                # free-text in v1: snowflake, postgres, csv, etc.
  table: ANALYTICS.DIM_CUSTOMER
  columns:
    customer_id: CUST_ID
    name: CUST_NAME
    email: EMAIL_ADDR
    risk_rating: RISK_LVL
    created_at: CREATED_TS

notes: >                           # optional, free prose
  In our world, "customer" is the post-signup entity. Pre-signup leads
  live in a separate concept and are explicitly out of scope here.
```

Supported property types: `id`, `string`, `number`, `date`, `timestamp`, `boolean`, `enum`. Anything more complex is a smell.

## 5. Sample ontology content

Use this exact set of 12 concepts. The relations form a connected graph so the graph view is interesting. The AI agent building this should generate full YAML files for each; below is the relational shape they must implement.

|Concept    |Key relations                                                                                                                         |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------|
|customer   |places → order (1..n); has → address (0..n); has → risk-rating (1)                                                                    |
|order      |placed-by → customer (1); contains → order-line (1..n); ships-via → shipment (0..1); paid-by → payment (0..n); uses → promotion (0..n)|
|order-line |belongs-to → order (1); references → product (1)                                                                                      |
|product    |belongs-to → category (1..n); has → review (0..n)                                                                                     |
|category   |parent → category (0..1) — self-referential for hierarchy                                                                             |
|shipment   |for → order (1); to → address (1)                                                                                                     |
|address    |belongs-to → customer (0..1)                                                                                                          |
|payment    |for → order (1); refunded-by → refund (0..n)                                                                                          |
|refund     |reverses → payment (1)                                                                                                                |
|review     |of → product (1); by → customer (1)                                                                                                   |
|risk-rating|assesses → customer (1)                                                                                                               |
|promotion  |applies-to → category (0..n); applies-to → product (0..n)                                                                             |

Each concept needs realistic properties (3–6 each), at least one synonym where it’s natural, an `owners` field of `[demo-team]`, and a plausible `mapping` block (treat Snowflake table names as illustrative — they don’t need to be real). Add a one-paragraph `notes` field on roughly half of them showing the kinds of business judgment that earn their keep in this format.

## 6. Build script

`scripts/build_concepts_json.py` — Python 3.11+. Single file. Dependencies: `pyyaml`, `jsonschema`.

Responsibilities:

1. Read `schema/concept.schema.json`
1. Walk `concepts/*.yml`, parse each, validate against schema
1. Verify every `relations[].target` resolves to another concept id
1. Verify `id` matches filename (without `.yml`)
1. Verify no duplicate ids
1. Compute and embed for each concept:
- `_source`: filename
- `_github_url`: built from a `GITHUB_REPOSITORY` env var if present (set by Actions), or omitted locally
1. Write to `viewer/public/concepts.json`:
   
   ```json
   {
     "version": "0.1.0",
     "generated_at": "2026-05-27T...",
     "concept_count": 12,
     "concepts": [ ... ]
   }
   ```
1. Exit non-zero on any validation failure, with a clear error message naming the file

Print a summary on success: `✓ 12 concepts validated → viewer/public/concepts.json`.

## 7. Viewer app

Stack: **Vite + React 18 + TypeScript + Tailwind CSS**. Routing via `react-router-dom`. Graph via `react-flow` (`reactflow` npm package). Search via `fuse.js`. Icons via `lucide-react`. Nothing else.

Hard rules:

- No design system imports (no MUI, no Chakra, no Ant)
- No state management library beyond React’s built-ins
- No CSS-in-JS
- No SSR, no Next.js
- All data flows from one fetch of `/concepts.json` at app load
- App must work fully offline once loaded

### Routes

|Path           |Component    |Purpose                                     |
|---------------|-------------|--------------------------------------------|
|`/`            |Landing      |Pitch + explainer (content in §8)           |
|`/concepts`    |ConceptList  |Searchable list, grouped by owner           |
|`/concepts/:id`|ConceptDetail|Single concept detail                       |
|`/graph`       |Graph        |Force-directed concept graph                |
|`/about`       |About        |Why this exists, who made it, link to source|

Use `BrowserRouter` with a basename matching the GitHub Pages path (configurable via Vite env var so it works both locally and deployed).

### Landing page (`/`)

The most important page. It is a long-form, opinionated explainer styled like a high-quality engineering blog post. Sections (use the exact copy in §8):

1. **Hero** — title, one-line pitch, two CTA buttons (“See the example ontology” → `/concepts`, “See the graph” → `/graph`)
1. **The problem** — why agents struggle with raw schemas
1. **The shift** — what changes when ontology is treated as code
1. **What that looks like** — embedded code block showing one of the YAML concept files
1. **What the agent does with it** — a small step-by-step (text only, no live execution)
1. **Why this is worth doing now** — agents are the first consumer that actually uses the ontology
1. **Try it** — links to the list, detail, graph pages
1. **Footer** — link to repo, link to original LinkedIn post that inspired this

Visual style: generous whitespace, one accent colour, monospace for code, no stock images. Think “Stripe docs” or “Vercel blog,” not “enterprise dashboard.”

### Concept list (`/concepts`)

- Search box at the top (fuse.js, fuzzy over label + synonyms + description)
- Below: concept cards in a grid, grouped by owner team
- Each card: label, one-line description, property count, relation count
- Click → detail page
- URL reflects search: `/concepts?q=order`

### Concept detail (`/concepts/:id`)

- Header: label, id (mono), owners, “View source” link to the YAML file on GitHub
- Description (rendered as prose)
- Notes section if present (rendered as prose, slightly muted)
- Properties table: name, type, enum values (collapsed by default if many)
- Relations: outgoing relations as cards (name, → target with link, cardinality), and a “Referenced by” section showing incoming relations computed from the bundle
- Mapping section: source, table (mono, copy button), columns rendered as a key→value table
- “Next / previous concept” navigation at the bottom (alphabetical)

### Graph (`/graph`)

- Full-viewport react-flow graph
- Nodes: concepts, sized by total degree
- Edges: relations, labelled with the relation name and an arrowhead in the relation direction
- Self-referential relations (e.g. category → category) rendered as a loop
- Click a node: side panel slides in with the concept summary + link to `/concepts/:id`
- Top controls: “fit view,” “reset layout,” and a toggle “highlight: [all / by owner]”
- Layout: force-directed initial layout, then user can drag nodes. Persist positions in `localStorage` keyed by concept id so re-visits feel stable.

### About (`/about`)

Short page. What this is. Who built it (Dexter, with a link to his GitHub). Link to the LinkedIn post that inspired it. License. How to fork and adapt.

## 8. Landing-page copy

Use this exact prose. It’s the soul of the project. Format with appropriate headings and code blocks.

-----

**Hero**

# Ontology is code.

### A small, clickable demonstration of how data agents should be grounded.

[See the example ontology] [See the graph]

-----

**The problem**

When an LLM agent tries to answer a question against your data warehouse, it sees what every new engineer sees on day one: a forest of tables with names like `DIM_CUST_V3`, columns called `STATUS_CD`, and foreign keys with no documentation. Unlike that engineer, the agent has no colleague to ask, no Slack history to search, no project memory.

So it guesses. Sometimes it guesses well. Often it joins the wrong tables, picks the wrong column, hallucinates a relationship that doesn’t exist, and confidently returns the wrong answer. And every guess costs tokens — schema dumps in, retries out, working memory burning the whole way.

The usual response is to stuff more schema into the prompt. That doesn’t fix the problem. The problem isn’t that the agent has too little raw data — it’s that the agent has no idea what the data **means**.

-----

**The shift**

Ontology is the missing piece. Not the academic kind with reasoners and RDF triples — the practical kind. A small, plain-text declaration of:

- What things exist in your business (`Customer`, `Order`, `Shipment`)
- How they relate (`Customer places Order`, `Order ships via Shipment`)
- What constraints hold (a `Customer` has exactly one `RiskRating`)
- Which tables and columns realise each concept

Treated as **source code**. Versioned in git. Validated in CI. Reviewed in pull requests. Released with semver. Broken builds when it contradicts itself.

This is not new. Engineering organisations have done this for code for forty years. The shift is to do it for business meaning, because there is finally a consumer — the agent — that reads that meaning every single query, instead of once at onboarding.

-----

**What that looks like**

Here is one concept from the example ontology in this repo:

```yaml
id: customer
label: Customer
description: A person or organisation that buys products from the store.
synonyms: [client, buyer, account]
owners: [demo-team]

properties:
  - { name: customer_id, type: id }
  - { name: name,        type: string }
  - { name: email,       type: string }
  - { name: risk_rating, type: enum, values: [LOW, MEDIUM, HIGH] }

relations:
  - name: places
    target: order
    cardinality: 1..n

mapping:
  source: snowflake
  table: ANALYTICS.DIM_CUSTOMER
  columns:
    customer_id: CUST_ID
    name:        CUST_NAME
    email:       EMAIL_ADDR
    risk_rating: RISK_LVL
```

That’s it. No XML, no triple store, no namespace policy. A YAML file you can read in ten seconds.

-----

**What the agent does with it**

Given the question *“which high-risk customers placed orders last quarter?”*, an agent grounded against this ontology does roughly this:

1. **Resolve concepts.** “Customers” → `customer`. “Orders” → `order`. “High-risk” → `customer.risk_rating = HIGH`.
1. **Look up mappings.** `customer` lives in `ANALYTICS.DIM_CUSTOMER`. `order` lives in `ANALYTICS.FACT_ORDER`. The relation `customer places order` tells the agent the join shape and direction.
1. **Generate SQL** directly from the mapping. No exploration. No retries.
1. **Execute** against the warehouse.

The agent never sees the raw schema. It never has to guess that `RISK_LVL` is what humans call “risk rating.” It never wonders whether `STATUS_CD = 'A'` means “active customer.”

Tokens consumed per question to ground the agent: ~2,000. Tokens consumed if you dump the relevant DDL into the prompt instead: ~80,000. That ratio is the headline.

-----

**Why this is worth doing now**

Every previous attempt at enterprise ontology effort produced shelfware. Beautiful class hierarchies, formal definitions, cardinality axioms — read once, then forgotten.

The reason was simple: there was no consumer. Humans had shortcuts. They asked colleagues. They guessed from sample rows. They read the dbt model. The ontology sat there documenting things that nobody needed documented.

Agents have none of those shortcuts. An agent grounded against a stale ontology fails visibly — wrong SQL, missing concepts, bad answers. The ontology decays *loudly* instead of silently, which is what makes it maintainable.

That’s the shift. Not “ontologies are finally useful.” It’s that **the meaning of your business is now executable**, and the agent is the consumer that executes it. The cost is lower than it has ever been (plain YAML, no triplestore). The benefit is measurable (token-per-query, accuracy, retry rate). And the decay is self-arresting.

-----

**Try it**

- [Browse the concepts] — twelve concepts, fully clickable
- [See the graph] — same ontology as a force-directed graph
- [Read the source] — the repo, fork it, make your own

-----

**Footer**

Built by Dexter Maclean — see the repo for source. Inspired by a LinkedIn post titled “Ontology IS Code.”

MIT-licensed. Free to fork and use as a starter for your own ontology demos.

-----

## 9. Deployment

`.github/workflows/deploy.yml` — runs on push to `main`. Steps:

1. Checkout
1. Set up Python 3.12, install `pyyaml jsonschema`
1. Run `python scripts/build_concepts_json.py` (with `GITHUB_REPOSITORY` env var available)
1. Set up Node 20, install viewer deps (`npm ci` in `viewer/`)
1. Build (`npm run build` in `viewer/`)
1. Upload `viewer/dist` as a Pages artifact
1. Deploy to GitHub Pages

The repo’s Pages settings must use “GitHub Actions” as the source.

Vite must be configured with `base: '/<repo-name>/'` for production builds so asset paths resolve under the Pages subpath. Use a `VITE_BASE_PATH` env var so local dev still works at `/`.

## 10. README

Short. Aimed at someone who finds the repo on GitHub:

```markdown
# ontology-is-code

A small, clickable demonstration of how data agents should be grounded
in an ontology — treated as code, not as rows in a table.

**Live site:** https://<username>.github.io/<repo-name>/

## What's here
- `concepts/` — twelve example concepts as plain YAML
- `viewer/` — a static React site that browses them
- `scripts/build_concepts_json.py` — validates the YAML and emits the bundle the viewer reads

## Run locally
```bash
python scripts/build_concepts_json.py
cd viewer && npm install && npm run dev
```

## Why
See the landing page on the live site, or read SPEC.md.

MIT.
```

## 11. Acceptance criteria

The project is done when every one of these passes:

1. `python scripts/build_concepts_json.py` runs clean from a fresh checkout and produces `viewer/public/concepts.json` with 12 concepts
1. Breaking any YAML (invalid syntax, bad relation target, duplicate id) makes the script exit non-zero with a clear error
1. `cd viewer && npm install && npm run dev` starts a working dev server
1. The landing page renders the prose in §8 — full content, not placeholder lorem ipsum
1. The concept list shows all 12 concepts and search filters them in real time
1. Every concept detail page renders properties, relations (both directions), and mapping
1. The graph view renders all 12 concepts with labelled directed edges and is interactive
1. Pushing to `main` deploys a working site to GitHub Pages within five minutes
1. Lighthouse Performance ≥90 on the deployed site
1. Total deployed bundle (excluding `concepts.json`) ≤500 KB gzipped
1. No console errors on any page with a valid bundle
1. With `concepts.json` deleted or corrupted, the app shows a clear error UI rather than a white screen

## 12. Things to refuse if they come up

- Adding any backend, API, or server-side code
- Adding browser-based editing of concepts
- Adding LLM API calls from the viewer (no API keys at runtime)
- Importing a UI component library
- Adding authentication
- Adding more than the 12 concepts listed in §5 (the demo’s whole point is to be small)
- Adding mobile-specific layouts
- Replacing YAML with TOML, JSON, or any other format
- “Improving” the landing copy in §8 — it’s the spec, ship it as written

If you (the AI agent building this) find yourself tempted by any of the above, stop and re-read §1 and §2.

## 13. Suggested commit sequence

For a clean repo history:

1. `chore: scaffold repo with SPEC, README, license, gitignore`
1. `feat: add concept schema and 12 example concept YAML files`
1. `feat: add build script and validation`
1. `feat: scaffold Vite + React + TS + Tailwind viewer`
1. `feat: implement landing page with explainer copy`
1. `feat: implement concept list and search`
1. `feat: implement concept detail view`
1. `feat: implement graph view`
1. `feat: implement about page`
1. `ci: add GitHub Pages deployment workflow`
1. `docs: polish README with live site link`