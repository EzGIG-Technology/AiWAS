'use client';
import { useState } from 'react';
import { Ban, Building2, MapPin, ShieldCheck } from 'lucide-react';
import { severityClass } from './data';
import { capabilityMix, type Industry } from './industries';

const KINDS = ['All', 'Video candidate', 'Sensor integration', 'Staff report'];

/**
 * Per-industry scope screen. It exists so the detection register, the areas
 * the platform will and will not monitor, and the capabilities this industry
 * deliberately refuses are all readable in one place before anyone enables a
 * rule.
 */
export function IndustryProfile({ industry }: { industry: Industry }) {
  const [kind, setKind] = useState('All');
  const [query, setQuery] = useState('');
  const mix = capabilityMix(industry.id);
  const rows = industry.capabilities.filter(
    (c) =>
      (kind === 'All' || c.kind === kind) &&
      (c.name + c.signal + c.limits)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="detection-studio industry-profile">
      <section className="studio-banner">
        <div>
          <span className="badge blue">{industry.sector}</span>
          <h2>{industry.name}</h2>
          <p>{industry.tagline}</p>
        </div>
        <span className="industry-mark">
          <Building2 size={30} />
        </span>
      </section>

      <section className="panel studio-rule">
        <h2>
          <ShieldCheck size={18} />
          Scope for this industry
        </h2>
        <dl className="industry-meta">
          <div>
            <dt>Regulator and standards</dt>
            <dd>{industry.regulator}</dd>
          </div>
          <div>
            <dt>Demonstration {industry.lexicon.sitePlural}</dt>
            <dd>{industry.sites.join(' · ')}</dd>
          </div>
          <div>
            <dt>Principal risks</dt>
            <dd>
              <ul className="industry-risks">
                {industry.keyRisks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <div className="concept-stats">
          {(
            [
              ['Capabilities', mix.total],
              ['Video candidates', mix.video],
              ['Sensor integrations', mix.sensor],
              ['Staff reports', mix.report],
              ['Critical priority', mix.critical],
              ['Excluded by policy', mix.excluded],
            ] as [string, number][]
          ).map(([label, value]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel studio-rule">
        <h2>
          <MapPin size={18} />
          Monitored and excluded areas
        </h2>
        <p className="muted">
          A rule can only be saved against a monitored area. The excluded list
          is enforced when the rule is saved, not offered as advice.
        </p>
        <div className="industry-zones">
          <div>
            <h3>Monitored areas</h3>
            <ul>
              {industry.zones.map((z) => (
                <li key={z}>{z}</li>
              ))}
            </ul>
          </div>
          <div className="excluded">
            <h3>Never monitored</h3>
            <ul>
              {industry.privateZones.map((z) => (
                <li key={z}>{z}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel studio-rule">
        <h2>Capability register</h2>
        <p className="muted">
          Each capability states the observable signal, what it cannot
          establish, and the intended response. Nothing here is a validated
          model result.
        </p>
        <div className="studio-fields">
          <label htmlFor="industry-capability-search">
            Search capabilities
            <input
              id="industry-capability-search"
              placeholder="Search signal, limitation or name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label htmlFor="industry-capability-kind">
            Capability type
            <select
              id="industry-capability-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Observable signal</th>
                <th>What it cannot establish</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.kind}</td>
                  <td>
                    <i className={'badge ' + severityClass(c.priority)}>
                      {c.priority}
                    </i>
                  </td>
                  <td>{c.signal}</td>
                  <td>{c.limits}</td>
                  <td>{c.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="muted">
            No capability matches that filter in this register.
          </p>
        )}
      </section>

      <section className="panel studio-rule">
        <h2>
          <Ban size={18} />
          Excluded detections
        </h2>
        <p className="muted">
          These are not missing features. They are capabilities this industry
          profile refuses, with the reason recorded so the decision survives a
          change of team.
        </p>
        <ul className="industry-excluded">
          {industry.excluded.map((e) => (
            <li key={e.name}>
              <strong>{e.name}</strong>
              <span>{e.why}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
