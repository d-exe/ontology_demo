import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const repoUrl = 'https://github.com/d-exe/ontology_demo'
const linkedInPostUrl = 'https://www.linkedin.com/search/results/content/?keywords=Ontology%20IS%20Code'
const customerExample = `id: customer
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
    risk_rating: RISK_LVL`

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-800/80 py-16 first:border-t-0 first:pt-0">
      <h2 className="text-3xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-6 space-y-6 text-lg leading-8 text-slate-300">{children}</div>
    </section>
  )
}

export default function Landing() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <section className="pb-16">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">Demo</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white md:text-7xl">
          Ontology is code.
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-300">
          A small, clickable demonstration of how data agents should be grounded.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/concepts"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            See the example ontology
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/graph"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-indigo-400 hover:text-white"
          >
            See the graph
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Section title="The problem">
        <p>
          When an LLM agent tries to answer a question against your data warehouse, it sees what every
          new engineer sees on day one: a forest of tables with names like <code>DIM_CUST_V3</code>,
          columns called <code>STATUS_CD</code>, and foreign keys with no documentation. Unlike that
          engineer, the agent has no colleague to ask, no Slack history to search, no project memory.
        </p>
        <p>
          So it guesses. Sometimes it guesses well. Often it joins the wrong tables, picks the wrong
          column, hallucinates a relationship that doesn’t exist, and confidently returns the wrong
          answer. And every guess costs tokens — schema dumps in, retries out, working memory burning
          the whole way.
        </p>
        <p>
          The usual response is to stuff more schema into the prompt. That doesn’t fix the problem. The
          problem isn’t that the agent has too little raw data — it’s that the agent has no idea what
          the data <strong>means</strong>.
        </p>
      </Section>

      <Section title="The shift">
        <p>
          Ontology is the missing piece. Not the academic kind with reasoners and RDF triples — the
          practical kind. A small, plain-text declaration of:
        </p>
        <ul className="list-disc space-y-3 pl-6 text-slate-200 marker:text-indigo-300">
          <li>What things exist in your business (<code>Customer</code>, <code>Order</code>, <code>Shipment</code>)</li>
          <li>How they relate (<code>Customer places Order</code>, <code>Order ships via Shipment</code>)</li>
          <li>What constraints hold (a <code>Customer</code> has exactly one <code>RiskRating</code>)</li>
          <li>Which tables and columns realise each concept</li>
        </ul>
        <p>
          Treated as <strong>source code</strong>. Versioned in git. Validated in CI. Reviewed in pull
          requests. Released with semver. Broken builds when it contradicts itself.
        </p>
        <p>
          This is not new. Engineering organisations have done this for code for forty years. The shift
          is to do it for business meaning, because there is finally a consumer — the agent — that reads
          that meaning every single query, instead of once at onboarding.
        </p>
      </Section>

      <Section title="What that looks like">
        <p>Here is one concept from the example ontology in this repo:</p>
        <pre className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-sm leading-7 text-slate-200">
          <code>{customerExample}</code>
        </pre>
        <p>That’s it. No XML, no triple store, no namespace policy. A YAML file you can read in ten seconds.</p>
      </Section>

      <Section title="What the agent does with it">
        <p>
          Given the question <em>“which high-risk customers placed orders last quarter?”</em>, an agent
          grounded against this ontology does roughly this:
        </p>
        <ol className="list-decimal space-y-3 pl-6 marker:text-indigo-300">
          <li>
            <strong>Resolve concepts.</strong> “Customers” → <code>customer</code>. “Orders” → <code>order</code>.
            “High-risk” → <code>customer.risk_rating = HIGH</code>.
          </li>
          <li>
            <strong>Look up mappings.</strong> <code>customer</code> lives in <code>ANALYTICS.DIM_CUSTOMER</code>.
            <code>order</code> lives in <code>ANALYTICS.FACT_ORDER</code>. The relation <code>customer places order</code>
            tells the agent the join shape and direction.
          </li>
          <li>
            <strong>Generate SQL</strong> directly from the mapping. No exploration. No retries.
          </li>
          <li>
            <strong>Execute</strong> against the warehouse.
          </li>
        </ol>
        <p>
          The agent never sees the raw schema. It never has to guess that <code>RISK_LVL</code> is what humans
          call “risk rating.” It never wonders whether <code>STATUS_CD = 'A'</code> means “active customer.”
        </p>
        <p>
          Tokens consumed per question to ground the agent: ~2,000. Tokens consumed if you dump the relevant
          DDL into the prompt instead: ~80,000. That ratio is the headline.
        </p>
      </Section>

      <Section title="Why this is worth doing now">
        <p>
          Every previous attempt at enterprise ontology effort produced shelfware. Beautiful class hierarchies,
          formal definitions, cardinality axioms — read once, then forgotten.
        </p>
        <p>
          The reason was simple: there was no consumer. Humans had shortcuts. They asked colleagues. They guessed
          from sample rows. They read the dbt model. The ontology sat there documenting things that nobody needed documented.
        </p>
        <p>
          Agents have none of those shortcuts. An agent grounded against a stale ontology fails visibly — wrong SQL,
          missing concepts, bad answers. The ontology decays <strong>loudly</strong> instead of silently, which is what makes it maintainable.
        </p>
        <p>
          That’s the shift. Not “ontologies are finally useful.” It’s that <strong>the meaning of your business is now executable</strong>,
          and the agent is the consumer that executes it. The cost is lower than it has ever been (plain YAML, no triplestore).
          The benefit is measurable (token-per-query, accuracy, retry rate). And the decay is self-arresting.
        </p>
      </Section>

      <Section title="Try it">
        <ul className="space-y-3 text-indigo-300">
          <li>
            <Link to="/concepts" className="hover:text-indigo-200">Browse the concepts</Link> — twelve concepts, fully clickable
          </li>
          <li>
            <Link to="/graph" className="hover:text-indigo-200">See the graph</Link> — same ontology as a force-directed graph
          </li>
          <li>
            <a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-200">
              Read the source
            </a>{' '}
            — the repo, fork it, make your own
          </li>
        </ul>
      </Section>

      <footer className="border-t border-slate-800 py-10 text-sm leading-7 text-slate-400">
        <p>
          Built by Dexter Maclean — see the{' '}
          <a href={repoUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
            repo
          </a>{' '}
          for source. Inspired by a LinkedIn post titled{' '}
          <a href={linkedInPostUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
            “Ontology IS Code.”
          </a>
          {' '}MIT-licensed.
        </p>
        <p>Free to fork and use as a starter for your own ontology demos.</p>
      </footer>
    </div>
  )
}
