export interface Property {
  name: string
  type: 'id' | 'string' | 'number' | 'date' | 'timestamp' | 'boolean' | 'enum'
  values?: string[]
}

export interface Relation {
  name: string
  target: string
  cardinality: string
  description?: string
}

export interface Mapping {
  source: string
  table: string
  columns: Record<string, string>
}

export interface Concept {
  id: string
  label: string
  description: string
  synonyms?: string[]
  owners: string[]
  properties: Property[]
  relations?: Relation[]
  mapping: Mapping
  notes?: string
  _source: string
  _github_url?: string
}

export interface ConceptBundle {
  version: string
  generated_at: string
  concept_count: number
  concepts: Concept[]
}
