import Fuse from 'fuse.js'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import ConceptCard from '../components/ConceptCard'
import SearchBox from '../components/SearchBox'
import { useConceptBundle } from '../data'
import type { Concept } from '../types'

function groupByOwner(concepts: Concept[]) {
  return concepts.reduce<Record<string, Concept[]>>((groups, concept) => {
    for (const owner of concept.owners) {
      groups[owner] ??= []
      groups[owner].push(concept)
    }
    return groups
  }, {})
}

export default function ConceptList() {
  const { concepts } = useConceptBundle()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const sortedConcepts = useMemo(
    () => [...concepts].sort((left, right) => left.label.localeCompare(right.label)),
    [concepts],
  )

  const fuse = useMemo(
    () =>
      new Fuse(sortedConcepts, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: ['label', 'synonyms', 'description'],
      }),
    [sortedConcepts],
  )

  const filteredConcepts = useMemo(() => {
    if (!query.trim()) {
      return sortedConcepts
    }

    return fuse.search(query.trim()).map((result) => result.item)
  }, [fuse, query, sortedConcepts])

  const grouped = useMemo(() => groupByOwner(filteredConcepts), [filteredConcepts])

  const handleSearchChange = useCallback(
    (value: string) => {
      const next = value.trim()
      if (next) {
        setSearchParams({ q: value })
        return
      }
      setSearchParams({})
    },
    [setSearchParams],
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Ontology browser</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Browse the example ontology</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          Search across labels, synonyms, and descriptions. The query is stored in the URL so results are easy to share.
        </p>
      </div>

      <div className="mt-10 max-w-2xl">
        <SearchBox value={query} onChange={handleSearchChange} placeholder="Search concepts, synonyms, or descriptions" />
      </div>

      <div className="mt-6 text-sm text-slate-400">
        Showing {filteredConcepts.length} of {concepts.length} concepts.
      </div>

      {Object.entries(grouped).map(([owner, ownerConcepts]) => (
        <section key={owner} className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">{owner}</h2>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-400">
              {ownerConcepts.length} concept{ownerConcepts.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ownerConcepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        </section>
      ))}

      {filteredConcepts.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-700 p-8 text-slate-400">
          No concepts matched “{query}”. Try a broader term like customer, shipment, or risk.
        </div>
      ) : null}
    </div>
  )
}
