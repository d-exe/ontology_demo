import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBox({ value, onChange, placeholder = 'Search concepts...' }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onChange(draft)
    }, 200)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [draft, onChange])

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
      />
    </label>
  )
}
