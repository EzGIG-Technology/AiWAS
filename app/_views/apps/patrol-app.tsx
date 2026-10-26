'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import {
  Navigation,
  MapPinCheck,
  CheckCircle2,
  Circle,
  Camera as CameraIcon,
  ClipboardList,
  Route,
  Siren,
  Nfc,
  NotebookPen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { CameraFeed } from '../../_components/camera-feed';
import { SeverityBadge, StatusBadge } from '../../_components/ui-bits';
import { Phone } from './phone';
import { useDemo, nextIncidentId } from '../../_lib/store';
import { notify } from '../../_lib/notify';
import { cameraById, type Incident } from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';

const ME = 'PB-01';
type Tab = 'jobs' | 'tour' | 'report' | 'log';

const checkpoints = [
  'Perpustakaan Utama, main door',
  'Faculty of Law, basement ramp',
  'Faculty of Business & Economics, lobby',
  'Canselori, east entrance',
  'Dewan Tunku Canselor, stage door',
  'Student centre car park',
  'Tasik Varsiti, south path',
  'Faculty of Science, block C',
  'Data centre, server hall door',
  'FASS courtyard',
  'Dewan Budaya',
  'Main gate guardhouse',
  'UM Central shuttle hub',
  'Rimba Ilmu entrance',
];

export function PatrolApp() {
  const { state, dispatch, now } = useDemo();
  const [tab, setTab] = useState<Tab>('jobs');
  const [done, setDone] = useState(9);
  const [category, setCategory] = useState('Facilities');
  const [note, setNote] = useState(
    'Street light out on the path between the library and KK12. Area very dark.',
  );
  const jobs = state.incidents.filter(
    (i) => i.assigned === ME && !['Resolved', 'False alarm'].includes(i.status),
  );
  const current = jobs[0];

  const act = (i: Incident, status: Incident['status'], text: string) => {
    dispatch({ type: 'status', id: i.id, status, actor: ME, note: text });
    notify.success(text, i.id);
  };

  return (
    <Phone label="EzPatrol · officer app" time={now}>
      <header className="flex items-center gap-3 bg-sidebar px-4 pb-3 text-white">
        <span className="grid h-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary px-2 font-mono text-xs font-bold text-sidebar-primary-foreground">
          {ME}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Kpl. Hafiz Rahman</div>
          <div className="text-[11px] text-white/70">
            Polis Bantuan UM · on duty until 23:00
          </div>
        </div>
        <Button
          size="icon-sm"
          className="bg-critical text-white hover:bg-critical/90"
          aria-label="Officer SOS"
          onClick={() =>
            notify.error('Officer SOS sent', 'All units and the SOC alerted')
          }
        >
          <Siren />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'jobs' && (
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">Dispatch</h2>
            {!current && (
              <p className="text-sm text-muted-foreground">
                No active jobs. Continue your guard tour.
              </p>
            )}
            {jobs.map((i) => {
              const cam = i.camera ? cameraById(i.camera) : undefined;
              return (
                <Card
                  key={i.id}
                  size="sm"
                  className={cn(
                    i.severity === 'Critical' && 'ring-critical/40',
                  )}
                >
                  <CardContent className="grid gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SeverityBadge severity={i.severity} />
                      <StatusBadge status={i.status} />
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                        {i.id}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">{i.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.location}
                    </div>
                    {cam && <CameraFeed camera={cam} compact />}
                    <div className="text-xs">{i.summary}</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          notify.info('Navigation started', i.location)
                        }
                      >
                        <Navigation />
                        Go
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={i.status === 'On scene'}
                        onClick={() => act(i, 'On scene', 'Arrived on scene')}
                      >
                        <MapPinCheck />
                        Arrived
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          act(i, 'Resolved', 'Resolved by officer')
                        }
                      >
                        <CheckCircle2 />
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {tab === 'tour' && (
          <div className="grid gap-3">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold">
                Academic core night tour
              </h2>
              <span className="tabular text-sm text-muted-foreground">
                {done}/{checkpoints.length}
              </span>
            </div>
            <ul className="grid gap-1.5">
              {checkpoints.map((c, n) => (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-lg border p-2.5 text-sm"
                >
                  {n < done ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      'flex-1',
                      n < done && 'text-muted-foreground',
                    )}
                  >
                    {c}
                  </span>
                  {n === done && (
                    <Button
                      size="xs"
                      onClick={() => {
                        setDone(done + 1);
                        notify.success('Checkpoint scanned', c);
                      }}
                    >
                      <Nfc />
                      Scan
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'report' && (
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">New report</h2>
            <Label htmlFor="pcat">Category</Label>
            <NativeSelect
              id="pcat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full"
            >
              {[
                'Facilities',
                'Theft',
                'Suspicious item',
                'Traffic',
                'Wildlife',
                'Medical',
                'Flood & weather',
              ].map((c) => (
                <NativeSelectOption key={c}>{c}</NativeSelectOption>
              ))}
            </NativeSelect>
            <Label htmlFor="pnote">What did you find?</Label>
            <Textarea
              id="pnote"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border p-2">
              <img
                src={mediaUrl(scenes['office-perimeter'].still)}
                alt="Walkway between the library and KK12 at night"
                className="h-14 w-20 rounded object-cover"
              />
              <div className="text-xs text-muted-foreground">
                <CameraIcon className="mr-1 inline size-3.5" />1 photo attached
                · location stamped
              </div>
            </div>
            <Button
              onClick={() => {
                const id = nextIncidentId(state.incidents);
                dispatch({
                  type: 'raise',
                  incident: {
                    id,
                    title: `Patrol report: ${category.toLowerCase()}`,
                    category: category as Incident['category'],
                    severity: 'Low',
                    status: 'Acknowledged',
                    source: 'Patrol report',
                    location: 'Library to KK12 walkway',
                    precinct: 'academic',
                    time: '',
                    date: '2026-10-26',
                    assigned: ME,
                    summary: note,
                    timeline: [
                      {
                        time: now,
                        text: 'Report filed from EzPatrol with photo',
                        actor: ME,
                      },
                    ],
                    sop: [{ step: 'Raise Estates work order', done: false }],
                  },
                });
                notify.success(
                  'Report filed',
                  `${id} · Estates work order requested`,
                );
                setTab('jobs');
              }}
            >
              Submit report
            </Button>
          </div>
        )}

        {tab === 'log' && (
          <div className="grid gap-2">
            <h2 className="mb-1 text-lg font-semibold">Shift log</h2>
            {[
              ['15:00', 'Shift start, briefing at Pusat Kawalan'],
              ['16:40', 'Library theft report taken (UM-26-1031)'],
              ['16:52', 'Footage review requested via DPO (FR-311)'],
              ['18:00', 'Academic core tour started'],
              ...state.incidents
                .filter((i) => i.assigned === ME)
                .flatMap((i) =>
                  i.timeline
                    .filter((t) => t.actor === ME)
                    .map((t) => [t.time, `${t.text} (${i.id})`]),
                ),
            ].map(([t, x], n) => (
              <div
                key={n}
                className="flex gap-3 rounded-lg border p-2.5 text-sm"
              >
                <span className="tabular shrink-0 text-muted-foreground">
                  {t}
                </span>
                <span>{x}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="grid shrink-0 grid-cols-4 border-t bg-card pb-2">
        {(
          [
            ['jobs', 'Jobs', ClipboardList, jobs.length],
            ['tour', 'Tour', Route, 0],
            ['report', 'Report', NotebookPen, 0],
            ['log', 'Log', ClipboardList, 0],
          ] as const
        ).map(([id, label, I, badge]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center gap-0.5 py-2 text-[11px]',
              tab === id ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <I className="size-5" />
            {label}
            {badge > 0 && (
              <span className="absolute top-1 right-[30%] grid size-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </Phone>
  );
}
