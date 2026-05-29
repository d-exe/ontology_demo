const repoUrl = 'https://github.com/d-exe/ontology_demo'
const dexterUrl = 'https://github.com/d-exe'
const linkedInPostUrl = 'https://www.linkedin.com/posts/tonyseale_did-you-start-building-your-ontology-as-a-activity-7463499066451103745-MEfM?utm_source=share&utm_medium=member_ios&rcm=ACoAACBJ7ZwBbY4Ubozb4WQccjAeEFSKQZBzcyk'

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">About</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">What this is</h1>
      <div className="mt-8 space-y-6 text-lg leading-8 text-slate-300">
        <p>
          This is a small, static demonstration of treating ontology as code: twelve concepts in YAML,
          a Python build step that validates them, and a React viewer that makes the ontology clickable.
        </p>
        <p>
          Built by{' '}
          <a href={dexterUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
            Dexter Michaels
          </a>
          . It exists to show a concrete, lightweight pattern for grounding data agents without adding a backend,
          triplestore, or runtime API dependency.
        </p>
        <p>
          The framing was inspired by a LinkedIn post titled{' '}
          <a href={linkedInPostUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
            “Ontology IS Code”
          </a>
          . The code and content in this repository are released under the MIT license.
        </p>
        <p>
          Fork it, swap in your own concepts, update the mappings, and keep the same build-and-browse loop.
          The point is to make business meaning easy to version, review, validate, and ship.
        </p>
        <p>
          Source: <a href={repoUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">{repoUrl}</a>
        </p>
      </div>
    </div>
  )
}
