import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface RelationCardItem {
  key: string
  name: string
  targetId: string
  targetLabel: string
  cardinality: string
  description?: string
  context?: string
}

interface RelationListProps {
  title: string
  emptyLabel: string
  items: RelationCardItem[]
}

export default function RelationList({ title, emptyLabel, items }: RelationListProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.key} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
                    {item.cardinality}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </div>
              {item.context ? <p className="mt-3 text-sm text-slate-400">{item.context}</p> : null}
              <Link
                to={`/concepts/${item.targetId}`}
                className="mt-3 inline-flex items-center gap-2 font-medium text-indigo-300 hover:text-indigo-200"
              >
                {item.targetLabel}
              </Link>
              {item.description ? <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
