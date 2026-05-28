import { Copy, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PropertyTable from '../components/PropertyTable'
import RelationList, { type RelationCardItem } from '../components/RelationList'
import { useConceptBundle } from '../data'

const repoRoot = 'https://github.com/d-exe/ontology_demo'

export default function ConceptDetail() {
  const { id } = useParams()
  const { concepts } = useConceptBundle()
  const [copied, setCopied] = useState(false)

  const sortedConcepts = useMemo(
    () => [...concepts].sort((left, right) => left.label.localeCompare(right.label)),
    [concepts],
  )

  const concept = concepts.find((entry) => entry.id === id)

  const sourceUrl = concept?._github_url ?? `${repoRoot}/blob/main/concepts/${concept?._source ?? ''}`

  const outgoingRelations = useMemo<RelationCardItem[]>(() => {
    if (!concept?.relations) {
      return []
    }

    return concept.relations.map((relation, index) => {
      const target = concepts.find((entry) => entry.id === relation.target)
      return {
        key: `${relation.name}-${relation.target}-${index}`,
        name: relation.name,
        targetId: relation.target,
        targetLabel: target?.label ?? relation.target,
        cardinality: relation.cardinality,
        description: relation.description,
      }
    })
  }, [concept?.relations, concepts])

  const incomingRelations = useMemo<RelationCardItem[]>(() => {
    if (!concept) {
      return []
    }

    return concepts.flatMap((candidate) =>
      (candidate.relations ?? [])
        .filter((relation) => relation.target === concept.id)
        .map((relation, index) => ({
          key: `${candidate.id}-${relation.name}-${index}`,
          name: relation.name,
          targetId: candidate.id,
          targetLabel: candidate.label,
          cardinality: relation.cardinality,
          description: relation.description,
          context: `From ${candidate.label}`,
        })),
    )
  }, [concept, concepts])

  const currentIndex = sortedConcepts.findIndex((entry) => entry.id === concept?.id)
  const previousConcept = currentIndex > 0 ? sortedConcepts[currentIndex - 1] : null
  const nextConcept = currentIndex >= 0 ? sortedConcepts[currentIndex + 1] ?? null : null

  async function handleCopyTable() {
    if (!concept) {
      return
    }

    await navigator.clipboard.writeText(concept.mapping.table)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  if (!concept) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold text-white">Concept not found</h1>
        <p className="mt-4 text-slate-300">The requested concept does not exist in the generated ontology bundle.</p>
        <Link to="/concepts" className="mt-6 inline-flex text-indigo-300 hover:text-indigo-200">
          Back to concepts
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Concept detail</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{concept.label}</h1>
          <p className="mt-3 font-mono text-sm text-slate-400">{concept.id}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {concept.owners.map((owner) => (
              <span key={owner} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                {owner}
              </span>
            ))}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm text-indigo-300 hover:border-indigo-400 hover:text-indigo-200"
            >
              View source
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-6 text-lg leading-8 text-slate-300">{concept.description}</p>
          {concept.notes ? (
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-400">
              <h2 className="text-lg font-semibold text-slate-200">Notes</h2>
              <p className="mt-3 leading-7">{concept.notes}</p>
            </div>
          ) : null}
        </div>
        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Mapping</p>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-slate-500">Source</p>
              <p className="mt-1">{concept.mapping.source}</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-slate-500">Table</p>
                <button
                  type="button"
                  onClick={() => void handleCopyTable()}
                  className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 rounded-xl bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-200">
                {concept.mapping.table}
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Column</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
                {Object.entries(concept.mapping.columns).map(([property, column]) => (
                  <tr key={property}>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-200">{property}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{column}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <PropertyTable properties={concept.properties} />
        <RelationList title="Outgoing relations" emptyLabel="No outgoing relations declared." items={outgoingRelations} />
      </div>

      <div className="mt-8">
        <RelationList title="Referenced by" emptyLabel="No other concepts reference this concept." items={incomingRelations} />
      </div>

      <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {previousConcept ? (
            <Link to={`/concepts/${previousConcept.id}`} className="text-indigo-300 hover:text-indigo-200">
              ← {previousConcept.label}
            </Link>
          ) : (
            <span className="text-slate-600">Start of list</span>
          )}
        </div>
        <div>
          {nextConcept ? (
            <Link to={`/concepts/${nextConcept.id}`} className="text-indigo-300 hover:text-indigo-200">
              {nextConcept.label} →
            </Link>
          ) : (
            <span className="text-slate-600">End of list</span>
          )}
        </div>
      </div>
    </div>
  )
}
