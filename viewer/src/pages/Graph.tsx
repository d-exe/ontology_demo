import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeMouseHandler,
  type OnNodesChange,
  Position,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { Maximize, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useConceptBundle } from '../data'
import type { Concept } from '../types'

const STORAGE_KEY = 'ontology-demo-graph-positions'
const ownerPalette = ['#818cf8', '#38bdf8', '#f59e0b', '#34d399']

type HighlightMode = 'all' | 'by owner'

type StoredPositions = Record<string, { x: number; y: number }>

function loadPositions(): StoredPositions {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as StoredPositions
  } catch {
    return {}
  }
}

function savePositions(nodes: Node[]) {
  const payload = Object.fromEntries(nodes.map((node) => [node.id, node.position]))
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function SelfLoopEdge({ id, sourceX, sourceY, label, markerEnd, style }: EdgeProps) {
  const path = `M ${sourceX} ${sourceY} C ${sourceX + 70} ${sourceY - 80}, ${sourceX + 110} ${sourceY + 80}, ${sourceX} ${sourceY + 80} C ${sourceX - 35} ${sourceY + 80}, ${sourceX - 35} ${sourceY}, ${sourceX} ${sourceY}`

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan rounded-full border border-slate-700 bg-slate-950/90 px-2 py-1 text-xs text-slate-200"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + 44}px, ${sourceY - 28}px)`,
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}

function ownerColorMap(concepts: Concept[]) {
  const owners = Array.from(new Set(concepts.flatMap((concept) => concept.owners))).sort()
  return Object.fromEntries(owners.map((owner, index) => [owner, ownerPalette[index % ownerPalette.length]]))
}

function computeDegrees(concepts: Concept[]) {
  const incoming = Object.fromEntries(concepts.map((concept) => [concept.id, 0])) as Record<string, number>

  for (const concept of concepts) {
    for (const relation of concept.relations ?? []) {
      incoming[relation.target] = (incoming[relation.target] ?? 0) + 1
    }
  }

  return Object.fromEntries(
    concepts.map((concept) => [concept.id, (concept.relations?.length ?? 0) + (incoming[concept.id] ?? 0)]),
  )
}

function defaultPositions(concepts: Concept[]) {
  const positions: StoredPositions = {}
  const radius = 260
  const centerX = 460
  const centerY = 300

  concepts.forEach((concept, index) => {
    const angle = (index / concepts.length) * Math.PI * 2
    const ring = index % 2 === 0 ? radius : radius + 90
    positions[concept.id] = {
      x: centerX + Math.cos(angle) * ring,
      y: centerY + Math.sin(angle) * ring,
    }
  })

  return positions
}

function buildNodes(concepts: Concept[], mode: HighlightMode): Node[] {
  const colors = ownerColorMap(concepts)
  const degrees = computeDegrees(concepts)
  const stored = loadPositions()
  const fallback = defaultPositions(concepts)

  return concepts.map((concept) => {
    const owner = concept.owners[0] ?? 'unknown'
    const degree = degrees[concept.id] ?? 0
    const tint = mode === 'by owner' ? colors[owner] ?? '#818cf8' : '#818cf8'
    const size = 132 + degree * 8

    return {
      id: concept.id,
      position: stored[concept.id] ?? fallback[concept.id],
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: concept.label,
        owner,
      },
      style: {
        width: size,
        borderRadius: 28,
        border: `1px solid ${tint}`,
        background: 'rgba(15, 23, 42, 0.92)',
        color: '#f8fafc',
        padding: 18,
        fontSize: 15,
        fontWeight: 600,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.35)',
      },
    }
  })
}

function buildEdges(concepts: Concept[]): Edge[] {
  return concepts.flatMap((concept) =>
    (concept.relations ?? []).map((relation, index) => ({
      id: `${concept.id}-${relation.name}-${relation.target}-${index}`,
      source: concept.id,
      target: relation.target,
      type: concept.id === relation.target ? 'selfLoop' : 'smoothstep',
      label: relation.name,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
      labelStyle: {
        fill: '#e2e8f0',
        fontWeight: 600,
        fontSize: 12,
      },
      labelBgStyle: {
        fill: '#020617',
        fillOpacity: 0.9,
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 12,
      style: {
        stroke: '#64748b',
        strokeWidth: 1.6,
      },
    })),
  )
}

function GraphCanvas() {
  const { concepts } = useConceptBundle()
  const { fitView } = useReactFlow()
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(concepts, 'all'))

  const edges = useMemo(() => buildEdges(concepts), [concepts])
  const selectedConcept = concepts.find((concept) => concept.id === selectedId) ?? null

  useEffect(() => {
    const nextNodes = buildNodes(concepts, highlightMode)
    setNodes(nextNodes)
  }, [concepts, highlightMode, setNodes])

  useEffect(() => {
    savePositions(nodes)
  }, [nodes])

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      setSelectedId(node.id)
    },
    [],
  )

  const handleFitView = useCallback(() => {
    void fitView({ padding: 0.2, duration: 300 })
  }, [fitView])

  const handleResetLayout = useCallback(() => {
    const fallback = defaultPositions(concepts)
    const resetNodes = buildNodes(concepts, highlightMode).map((node) => ({
      ...node,
      position: fallback[node.id],
    }))
    setNodes(resetNodes)
    window.localStorage.removeItem(STORAGE_KEY)
    window.setTimeout(() => {
      void fitView({ padding: 0.2, duration: 300 })
    }, 0)
  }, [concepts, fitView, highlightMode, setNodes])

  return (
    <div className="relative h-[calc(100vh-5.5rem)] overflow-hidden rounded-t-3xl border-t border-slate-800 bg-slate-950">
      <div className="absolute left-6 top-6 z-20 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleFitView}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400 hover:text-white"
        >
          <Maximize className="h-4 w-4" />
          fit view
        </button>
        <button
          type="button"
          onClick={handleResetLayout}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          reset layout
        </button>
        <button
          type="button"
          onClick={() => setHighlightMode((mode) => (mode === 'all' ? 'by owner' : 'all'))}
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 hover:border-indigo-400 hover:text-white"
        >
          highlight: {highlightMode}
        </button>
      </div>

      <div
        className={`absolute right-0 top-0 z-20 h-full w-full max-w-sm border-l border-slate-800 bg-slate-950/95 p-6 transition-transform duration-300 ${
          selectedConcept ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedConcept ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Selected concept</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{selectedConcept.label}</h2>
            <p className="mt-2 font-mono text-sm text-slate-400">{selectedConcept.id}</p>
            <p className="mt-6 leading-7 text-slate-300">{selectedConcept.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="rounded-full bg-slate-900 px-3 py-2">{selectedConcept.properties.length} properties</span>
              <span className="rounded-full bg-slate-900 px-3 py-2">{selectedConcept.relations?.length ?? 0} outgoing</span>
            </div>
            <Link
              to={`/concepts/${selectedConcept.id}`}
              className="mt-8 inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Open detail page
            </Link>
          </div>
        ) : null}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedId(null)}
        fitView
        minZoom={0.2}
        maxZoom={1.6}
        edgeTypes={{ selfLoop: SelfLoopEdge }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={18} />
        <MiniMap pannable zoomable nodeColor="#818cf8" maskColor="rgba(2, 6, 23, 0.6)" />
      </ReactFlow>
    </div>
  )
}

export default function Graph() {
  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Ontology graph</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">See the ontology as a graph</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Node size reflects total degree. Drag nodes to refine the layout; positions persist in local storage for the next visit.
          </p>
        </div>
        <ReactFlowProvider>
          <GraphCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
