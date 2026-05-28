import { useMemo, useState } from 'react'

import type { Property } from '../types'

export default function PropertyTable({ properties }: { properties: Property[] }) {
  const [expanded, setExpanded] = useState(false)
  const visibleRows = useMemo(
    () => (expanded || properties.length <= 5 ? properties : properties.slice(0, 5)),
    [expanded, properties],
  )

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Properties</h2>
        {properties.length > 5 ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            {expanded ? 'Show fewer' : 'Show all'}
          </button>
        ) : null}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Enum values</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
            {visibleRows.map((property) => (
              <tr key={property.name}>
                <td className="px-4 py-3 font-mono text-xs text-indigo-200">{property.name}</td>
                <td className="px-4 py-3">{property.type}</td>
                <td className="px-4 py-3 text-slate-300">{property.values?.join(', ') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
