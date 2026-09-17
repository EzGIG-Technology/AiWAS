'use client';
import { useState } from 'react';
import research from './research.json';
import features from './features.json';
import { sites } from './data';
import {
  relatedFeatures,
  setupFor,
  validateCapabilityDraft,
  type CapabilityDraft,
} from './research-workflow';
const categories = [...new Set(research.map((f) => f.category))];
export default function CapabilityLibrary({
  navigate,
}: {
  navigate: (v: string) => void;
}) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All categories'),
    [selected, setSelected] = useState<string | null>(null),
    [site, setSite] = useState(sites[0]),
    [drafts, setDrafts] = useState<Record<string, CapabilityDraft>>({}),
    [values, setValues] = useState<Record<string, string>>({}),
    [notes, setNotes] = useState(''),
    [message, setMessage] = useState('');
  const feature = research.find((f) => f.id === selected),
    setup = feature ? setupFor(feature.category) : null;
  const matches = research.filter(
    (f) =>
      (category === 'All categories' || f.category === category) &&
      `${f.id} ${f.title} ${f.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function open(id: string, nextSite = site) {
    const d = drafts[`${nextSite}:${id}`];
    setSelected(id);
    setSite(nextSite);
    setValues(d?.values ?? {});
    setNotes(d?.notes ?? '');
    setMessage('');
  }
  function exportDrafts() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            source: 'CV for CCTV Security Research',
            mode: 'Configuration drafts only — no production integrations',
            drafts,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiwas-security-capability-drafts.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="capability-library">
      <div className="capability-heading">
        <small>RESEARCH TO IMPLEMENTATION</small>
        <h1>Capability library</h1>
        <p>
          All 91 capabilities from your CCTV research, organised into 14
          modules. Review the scope and prepare site-specific configuration
          drafts. Export drafts before switching dashboards or refreshing.
          Camera processing, identity matching and external actions require
          backend integration.
        </p>
      </div>
      {feature && setup ? (
        <article className="capability-detail">
          <button
            onClick={() => {
              setSelected(null);
              setMessage('');
            }}
          >
            ← All capabilities
          </button>
          <h2>{feature.title}</h2>
          <p>
            {feature.id} · {feature.category}
          </p>
          <p>{feature.description}</p>
          <h3>Implementation status</h3>
          <p>
            Setup draft available · Production integration required. Saving this
            form does not enable a detector or external action.
          </p>
          <h3>Required integration</h3>
          <p>{setup.dependency}</p>
          <h3>Operator journey</h3>
          <ol>
            <li>
              Select the site and define the purpose, camera scope and
              configuration below.
            </li>
            <li>
              A developer connects the required service and validates it against
              representative site data.
            </li>
            <li>
              An authorised administrator reviews the validation results and
              commissions the configuration.
            </li>
            <li>
              The operator reviews resulting events in {setup.destination},
              checks supporting evidence and records the decision.
            </li>
            <li>
              The supervisor reviews outcomes and quality metrics; changes
              follow a new validation and approval cycle.
            </li>
          </ol>
          {(relatedFeatures[feature.id] ?? []).map((id) => {
            const f = features.find((f) => f.id === id)!;
            return (
              <details key={id}>
                <summary>
                  {id} · Related specification: {f.title}
                </summary>
                <p>
                  <strong>Scope:</strong> {f.Scope}
                </p>
                <p>
                  <strong>Configuration:</strong> {f.Configure}
                </p>
                <p>
                  <strong>Journey:</strong> {f.Journey}
                </p>
                <p>
                  <strong>Exceptions:</strong> {f.Exceptions}
                </p>
                <p>
                  <strong>Acceptance:</strong> {f.Acceptance}
                </p>
              </details>
            );
          })}
          <h3>Site configuration draft</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const error = validateCapabilityDraft(values, setup.fields);
              if (error) {
                setMessage(error);
                return;
              }
              setDrafts({
                ...drafts,
                [`${site}:${feature.id}`]: {
                  site,
                  values: { ...values },
                  notes,
                  updatedAt: new Date().toISOString(),
                },
              });
              setMessage(
                'Draft saved for ' + site + '. No production settings changed.',
              );
            }}
          >
            <label>
              Site
              <select
                value={site}
                onChange={(e) => open(feature.id, e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {setup.fields.map((field) => (
              <label key={field}>
                {field}
                <input
                  required
                  value={values[field] ?? ''}
                  onChange={(e) => {
                    setValues({ ...values, [field]: e.target.value });
                    setMessage('');
                  }}
                  placeholder="Enter the proposed site setting"
                />
              </label>
            ))}
            <label>
              Implementation notes
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setMessage('');
                }}
                placeholder="Dependencies, owner and constraints. Do not enter credentials or personal data."
              />
            </label>
            <h3>Acceptance and failure checks</h3>
            <p>{setup.acceptance}</p>
            <div className="capability-actions">
              <button type="submit">Save site draft</button>
              <button type="button" onClick={() => navigate(setup.destination)}>
                Open {setup.destination.toLowerCase()}
              </button>
              <button type="button" onClick={() => open(feature.id)}>
                Revert unsaved edits
              </button>
            </div>
            <output className="capability-saved">{message}</output>
          </form>
        </article>
      ) : (
        <>
          <div className="capability-toolbar">
            <input
              aria-label="Search research capabilities"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ANPR, thermal, retention, model version…"
            />
            <select
              aria-label="Capability category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="secondary"
              onClick={exportDrafts}
              disabled={!Object.keys(drafts).length}
            >
              Export {Object.keys(drafts).length} drafts
            </button>
          </div>
          <p className="capability-count">
            {matches.length} of 91 capabilities · 14 categories · Source: CV for
            CCTV Security Research
          </p>
          <div className="capability-grid">
            {matches.map((f) => (
              <article className="capability-card" key={f.id}>
                <small>
                  {f.id} · {f.category}
                </small>
                <h2>{f.title}</h2>
                <p>{f.description}</p>
                <span className="capability-status">
                  {Object.keys(drafts).some((k) => k.endsWith(':' + f.id))
                    ? 'Site draft saved'
                    : 'Integration required'}
                </span>
                <button onClick={() => open(f.id)}>
                  Review scope & configure →
                </button>
              </article>
            ))}
          </div>
          {!matches.length && (
            <p>No capabilities match. Try another term or category.</p>
          )}
        </>
      )}
    </section>
  );
}
