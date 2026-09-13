'use client';
import {
  Activity,
  Ban,
  BellRing,
  Boxes,
  Cctv,
  Cloud,
  Cpu,
  Lock,
  MonitorPlay,
  ShieldCheck,
} from 'lucide-react';
import { BrandLockup } from './brand';
import { getIndustry } from './industries';

type Stage = {
  n: number;
  title: string;
  blurb: string;
  icon: typeof Cctv;
  items: string[];
};

/**
 * The end-to-end pipeline the platform is designed around: capture on site,
 * analyse on site, send only events, review centrally, act.
 *
 * The disabled section below is deliberate and is the reason this screen
 * exists. Proposal artwork for this programme has previously shown face
 * recognition and sex-classified people counts inside the on-premise analysis
 * stage. Both are excluded, and a diagram that quietly dropped them would let
 * them reappear later. They are drawn here as struck-through, with the reason.
 */
const STAGES = (site: string): Stage[] => [
  {
    n: 1,
    title: 'Capture on site',
    blurb: `IP cameras across approved public areas of the ${site}.`,
    icon: Cctv,
    items: [
      'Entrances and gates',
      'Corridors and stairwells',
      'Courtyards and open ground',
      'Shared and dining spaces',
      'Approved boundary lines',
    ],
  },
  {
    n: 2,
    title: 'On-premise AI analysis',
    blurb: 'An on-site appliance analyses video where it is captured.',
    icon: Cpu,
    items: [
      'People detection and tracking (anonymous)',
      'Line crossing, entry/exit and occupancy counting',
      'Crowd density and queue pressure',
      'Restricted-area and boundary rules',
      'Possible fall / person down',
      'Possible physical altercation (review candidate)',
      'Fire and smoke via an approved device',
      'Camera obstruction and stale-feed health',
    ],
  },
  {
    n: 3,
    title: 'Events and data',
    blurb: 'Only events leave the site. Raw video does not.',
    icon: Lock,
    items: [
      'Event summary: type, time, camera, zone',
      'Confidence — video candidates only',
      'Snapshot image reserved for review',
      'Counts and statistics (aggregate)',
      'Device and coverage health',
      'Encrypted transfer',
    ],
  },
  {
    n: 4,
    title: 'Cloud dashboard',
    blurb: `Central visibility across every connected ${site}.`,
    icon: Cloud,
    items: [
      'Multi-site estate map and coverage',
      'Live event feed and priority board',
      'Event analytics by type and period',
      'Occupancy and flow trends',
      'Coverage-unavailable minutes',
    ],
  },
  {
    n: 5,
    title: 'Operations room',
    blurb: 'Human review before anything becomes a finding.',
    icon: MonitorPlay,
    items: [
      'Video wall with 2×2, 3×3 and 4×4 layouts',
      'Live event queue with severity filters',
      'Snapshot review and acknowledgement',
      'Named reviewer and decision note',
      'Escalation to the duty responder',
    ],
  },
  {
    n: 6,
    title: 'Action and outcome',
    blurb: 'From a reviewed event to a recorded response.',
    icon: BellRing,
    items: [
      'Push, email and in-app alerts',
      'Assignment, follow-up and closure',
      'Incident reports and trends',
      'Evidence retention and disposal',
      'Pilot evaluation: precision, recall, latency',
    ],
  },
];

const DISABLED = [
  {
    name: 'Face recognition',
    why: 'Biometric data is sensitive personal data under the Personal Data Protection (Amendment) Act 2024, and the Ministry of Education excludes biometrics from the school programme. No face signature is computed, matched or stored anywhere in this pipeline.',
  },
  {
    name: 'Sex or demographic classification in people counts',
    why: 'Counting children as male or female from video is appearance-based profiling of minors. It adds nothing to a safety decision and cannot be corrected when it is wrong. Counts are reported as totals only.',
  },
  {
    name: 'Cross-camera re-identification',
    why: 'Following the same person between cameras by appearance is identification by another name on a campus of children. Tracks do not persist across views.',
  },
  {
    name: 'Automated external escalation',
    why: 'No model output dispatches police or any outside party. A named human reviews first, and that review is recorded.',
  },
  {
    name: 'Disciplinary automation',
    why: 'The platform never assigns blame, applies a sanction or holds a per-pupil risk score. Every disciplinary decision stays with staff under school procedure.',
  },
];

export function PlatformArchitecture({ industryId }: { industryId: string }) {
  const industry = getIndustry(industryId);
  const stages = STAGES(industry.lexicon.site);
  return (
    <div className="architecture">
      <section className="arch-hero">
        <BrandLockup subtitle="Real-time AI video command centre — monitoring workflow" />
        <p>
          Video is captured and analysed on site. Only events, snapshots and
          aggregate counts are transmitted, over an encrypted channel. Every
          stage below is a design commitment, not a delivered service: no
          ingestion, inference, transfer or notification is implemented in this
          build.
        </p>
      </section>

      <ol className="arch-flow">
        {stages.map((s) => (
          <li key={s.n}>
            <div className="arch-stage-head">
              <span className="arch-n">{s.n}</span>
              <s.icon size={17} />
              <h3>{s.title}</h3>
            </div>
            <p className="arch-blurb">{s.blurb}</p>
            <ul>
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className="panel arch-privacy">
        <ShieldCheck size={18} />
        <div>
          <h3>Video stays on site. Only events and snapshots are sent.</h3>
          <p>
            This is the property the whole design depends on. It is what keeps
            the pipeline proportionate, keeps raw footage of children out of a
            cloud service, and keeps the platform inside the PDPA cross-border
            rules without a transfer impact assessment for every frame.
          </p>
        </div>
      </section>

      <section className="panel arch-disabled">
        <h3>
          <Ban size={17} />
          Deliberately not in this pipeline
        </h3>
        <p className="muted">
          These capabilities are technically available from the wider market and
          appear in comparable products. They are excluded here, with the reason
          recorded so the decision survives a change of team or a change of
          slide deck.
        </p>
        <ul>
          {DISABLED.map((d) => (
            <li key={d.name}>
              <strong>{d.name}</strong>
              <span>{d.why}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel arch-pillars">
        {[
          [Cpu, 'AI runs on premise', 'Low latency, and no dependency on a link to a cloud region.'],
          [Activity, 'Real-time intelligence', 'Detection and alerting designed around the response, not the model.'],
          [Boxes, 'Multi-site monitoring', 'One view across every connected site, with coverage gaps visible.'],
          [Lock, 'Privacy by design', 'Anonymous events, no biometrics, retention and disposal enforced.'],
          [ShieldCheck, 'Stated limits', 'Every capability publishes what it cannot establish.'],
        ].map(([Icon, title, blurb]) => {
          const I = Icon as typeof Cpu;
          return (
            <div key={title as string}>
              <I size={18} />
              <strong>{title as string}</strong>
              <span>{blurb as string}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
