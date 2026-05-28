import { ArrowRight, Boxes, GitBranch } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Concept } from '../types'

export default function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <Link
      to={`/concepts/${concept.id}`}
      className="group flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
            {concept.owners.join(', ')}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white">{concept.label}</h3>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 text-slate-500 transition group-hover:text-indigo-300" />
      </div>
      <p
        className="mt-4 text-sm leading-6 text-slate-300"
        style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {concept.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2">
          <Boxes className="h-4 w-4" />
          {concept.properties.length} properties
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2">
          <GitBranch className="h-4 w-4" />
          {concept.relations?.length ?? 0} relations
        </span>
      </div>
    </Link>
  )
}
