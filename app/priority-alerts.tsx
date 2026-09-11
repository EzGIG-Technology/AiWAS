'use client';
import { useEffect, useState } from 'react';
import {
  Siren,
  Play,
  Check,
  ChevronRight,
  Clock3,
  Radio,
  ShieldCheck,
  ScanLine,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DemoVideo } from './camera-media';
import type { Incident } from './data';
export const scenarioOptions = [
  'Possible confrontation',
  'Crowd threshold exceeded',
  'Restricted-area entry',
  'Possible visible blade',
];
const scenarioCategories = [
  'Fighting',
  'Crowd counting',
  'Restricted area intrusion',
  'Visible blade concern',
];
export function PriorityAlerts({
  incidents,
  onOpen,
  onCreate,
  onAcknowledge,
}: {
  incidents: Incident[];
  onOpen: (id: string) => void;
  onCreate: (scenario: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const [scenario, setScenario] = useState(scenarioOptions[0]),
    [analysis, setAnalysis] = useState<{
      started: number;
      scenario: string;
    } | null>(null),
    [elapsed, setElapsed] = useState(0),
    [last, setLast] = useState('');
  useEffect(() => {
    if (!analysis) return;
    const interval = setInterval(() => {
      const e = Math.min(10, (Date.now() - analysis.started) / 1000);
      setElapsed(e);
      if (e >= 10) {
        clearInterval(interval);
        onCreate(analysis.scenario);
        setLast(analysis.scenario);
        setAnalysis(null);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [analysis]);
  const active = incidents
    .filter((i) => i.status !== 'Closed')
    .sort(
      (a, b) =>
        Number(!!a.acknowledged) - Number(!!b.acknowledged) ||
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
    );
  return (
    <section className="panel priority-panel">
      <div className="panel-title">
        <div>
          <h2>
            Live incident queue <span className="live-tag">DEMO</span>
          </h2>
          <p>New and active incidents, grouped by response priority.</p>
        </div>
        <div className="analysis-target">
          <Clock3 size={14} /> ~10 sec analysis target
        </div>
      </div>
      <div className="priority-columns">
        {[
          ['Critical', 'Immediate staff review', 'P0'],
          ['High', 'Urgent response', 'P1'],
          ['Medium', 'Prompt review', 'P2'],
          ['Low', 'Log & review', 'P3'],
        ].map(([level, label, p]) => {
          const list = active.filter((i) => i.severity === level);
          return (
            <div
              className={'priority-column priority-' + level.toLowerCase()}
              key={level}
            >
              <div className="priority-column-head">
                <span>
                  <i />
                  {level}
                  <b>{list.length}</b>
                </span>
                <small>
                  {p} · {label}
                </small>
              </div>
              {list.length ? (
                list.slice(0, level === 'High' ? 2 : 1).map((i) => (
                  <div className="priority-incident" key={i.id}>
                    <button onClick={() => onOpen(i.id)}>
                      <strong>
                        {i.category === 'Fighting'
                          ? 'Possible fighting'
                          : i.category}
                      </strong>
                      <span>
                        {i.zone} · {i.camera}
                      </span>
                      <small>
                        {i.time} MYT · {i.id}
                        <ChevronRight size={13} />
                      </small>
                    </button>
                    <div className="ack-line">
                      {i.acknowledged ? (
                        <span>
                          <Check size={12} />
                          Acknowledged
                        </span>
                      ) : (
                        <button onClick={() => onAcknowledge(i.id)}>
                          <Check size={12} />
                          Acknowledge
                        </button>
                      )}
                      <span>
                        {i.validation === 'Pending'
                          ? 'Unverified'
                          : i.validation}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="priority-empty">
                  <ShieldCheck size={21} />
                  <span>No {level.toLowerCase()} alerts</span>
                </div>
              )}
              {list.length > (level === 'High' ? 2 : 1) && (
                <button
                  className="more-alerts"
                  onClick={() => onOpen(list[level === 'High' ? 2 : 1].id)}
                >
                  +{list.length - (level === 'High' ? 2 : 1)} more · Review next
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="analysis-demo">
        <div>
          <ScanLine size={19} />
          <span>
            See a detection become an alert
            <small>Run a staged scene through the 10-second demo.</small>
          </span>
        </div>
        <Select
          value={scenario}
          onValueChange={(v) => v && setScenario(v)}
          disabled={!!analysis}
        >
          <SelectTrigger className="picker" aria-label="Demo scenario">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scenarioOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          className="btn primary"
          disabled={!!analysis}
          onClick={() => {
            setElapsed(0);
            setLast('');
            setAnalysis({ started: Date.now(), scenario });
          }}
        >
          <Play size={14} />
          {analysis ? 'Analysing…' : 'Run demo'}
        </button>
      </div>
      {analysis && (
        <div className="analysis-progress" aria-live="polite">
          <div className="analysis-status">
            <strong>
              {elapsed < 2
                ? 'Receiving camera frames'
                : elapsed < 7
                  ? 'Analysing activity over time'
                  : 'Classifying severity & preparing alert'}
            </strong>
            <span>{Math.floor(elapsed)} / 10 sec</span>
          </div>
          <Progress value={elapsed * 10} />
          <div className="analysis-video">
            <DemoVideo
              scene={
                ['corridor', 'canteen', 'perimeter', 'training'][
                  scenarioOptions.indexOf(analysis.scenario)
                ]
              }
              autoPlay
            />
          </div>
          <p>
            {analysis.scenario === 'Possible visible blade'
              ? 'Potential critical threat · Provisional warning now. Completed review follows; no external notification is sent.'
              : 'Demo sequence running. A new unverified alert will appear in the matching priority group.'}
          </p>
        </div>
      )}
      {!analysis && last && (
        <div className="analysis-complete" role="status">
          <Check size={15} />
          {last}: analysis complete · New unverified alert added. Human review
          required.
        </div>
      )}
    </section>
  );
}
