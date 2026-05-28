import { createContext, useContext } from 'react'

import type { ConceptBundle } from './types'

export class ConceptBundleError extends Error {
  status?: number

  constructor(message: string, status?: number, cause?: unknown) {
    super(message)
    this.name = 'ConceptBundleError'
    this.status = status
    if (cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = cause
    }
  }
}

function conceptsUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return new URL(`${normalized}concepts.json`, window.location.origin).toString()
}

function assertConceptBundle(value: unknown): asserts value is ConceptBundle {
  if (!value || typeof value !== 'object') {
    throw new ConceptBundleError('concepts.json is not a valid object payload.')
  }

  const bundle = value as Partial<ConceptBundle>
  if (!Array.isArray(bundle.concepts)) {
    throw new ConceptBundleError('concepts.json is missing the concepts array.')
  }

  if (typeof bundle.version !== 'string' || typeof bundle.generated_at !== 'string') {
    throw new ConceptBundleError('concepts.json is missing bundle metadata.')
  }

  if (typeof bundle.concept_count !== 'number') {
    throw new ConceptBundleError('concepts.json has an invalid concept_count value.')
  }
}

let conceptBundlePromise: Promise<ConceptBundle> | null = null

export function loadConceptBundle(): Promise<ConceptBundle> {
  if (!conceptBundlePromise) {
    conceptBundlePromise = fetch(conceptsUrl())
      .then(async (response) => {
        if (!response.ok) {
          throw new ConceptBundleError(
            `Unable to load concepts.json (${response.status} ${response.statusText}).`,
            response.status,
          )
        }

        let payload: unknown
        try {
          payload = await response.json()
        } catch (error) {
          throw new ConceptBundleError('concepts.json is not valid JSON.', response.status, error)
        }

        assertConceptBundle(payload)
        return payload
      })
      .catch((error: unknown) => {
        if (error instanceof ConceptBundleError) {
          throw error
        }
        throw new ConceptBundleError('Failed to fetch concepts.json.', undefined, error)
      })
  }

  return conceptBundlePromise
}

export const ConceptBundleContext = createContext<ConceptBundle | null>(null)

export function useConceptBundle(): ConceptBundle {
  const bundle = useContext(ConceptBundleContext)
  if (!bundle) {
    throw new ConceptBundleError('Concept bundle context is unavailable.')
  }
  return bundle
}
