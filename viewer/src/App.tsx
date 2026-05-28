import { Component, type ReactNode, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ConceptBundleContext, ConceptBundleError, loadConceptBundle } from './data'
import type { ConceptBundle } from './types'
import Layout from './components/Layout'
import About from './pages/About'
import ConceptDetail from './pages/ConceptDetail'
import ConceptList from './pages/ConceptList'
import Graph from './pages/Graph'
import Landing from './pages/Landing'

function normalizeBasename(value?: string): string {
  if (!value || value === '/') {
    return '/'
  }

  return value.endsWith('/') ? value.slice(0, -1) : value
}

function StatusScreen({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string
  title: string
  message: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16">
      <div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">{message}</p>
      </div>
    </div>
  )
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  override render() {
    if (this.state.error) {
      return (
        <StatusScreen
          eyebrow="Runtime error"
          title="The viewer hit an unexpected error."
          message={this.state.error.message}
        />
      )
    }

    return this.props.children
  }
}

export default function App() {
  const [bundle, setBundle] = useState<ConceptBundle | null>(null)
  const [error, setError] = useState<ConceptBundleError | null>(null)

  useEffect(() => {
    let cancelled = false

    loadConceptBundle()
      .then((result) => {
        if (!cancelled) {
          setBundle(result)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof ConceptBundleError
              ? loadError
              : new ConceptBundleError('Failed to load the ontology bundle.'),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const basename = useMemo(() => normalizeBasename(import.meta.env.VITE_BASE_PATH ?? '/'), [])

  if (error) {
    return (
      <StatusScreen
        eyebrow="Bundle error"
        title="Could not load ontology data."
        message={`${error.message} Run the Python build script and confirm viewer/public/concepts.json exists and is valid.`}
      />
    )
  }

  if (!bundle) {
    return (
      <StatusScreen
        eyebrow="Loading"
        title="Loading ontology bundle..."
        message="Fetching the generated concepts.json bundle for the static viewer."
      />
    )
  }

  return (
    <AppErrorBoundary>
      <ConceptBundleContext.Provider value={bundle}>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="concepts" element={<ConceptList />} />
              <Route path="concepts/:id" element={<ConceptDetail />} />
              <Route path="graph" element={<Graph />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConceptBundleContext.Provider>
    </AppErrorBoundary>
  )
}
