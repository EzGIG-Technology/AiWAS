'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import {
  Download,
  FileLock2,
  Gavel,
  Route,
  Search,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Alert as Callout,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { CampusMap } from '../../_components/campus-map';
import {
  AlertStatusBadge,
  Note,
  PageHeader,
  Pill,
  VerdictBadge,
} from '../../_components/ui-bits';
import {
  cameras,
  cameraById,
  modules,
  precincts,
  precinctIds,
  blockLabel,
  type PrecinctId,
} from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';
import {
  bottomColours,
  carryOptions,
  crossCameraTimeline,
  describe,
  emptyQuery,
  objectClasses,
  search,
  topColours,
  vehicleColours,
  type ObjectClass,
  type SearchQuery,
  type Sighting,
} from '../../_data/search';
import { alertByKey, type CaseFile, type CaseStatus } from '../../_data/alerts';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';
import { canExport } from '../../_lib/scope';
import { navigate } from '../../_lib/router';
import { Pdf, download, evidenceFrame } from '../../_lib/pdf';
import { AlertSheet } from './alert-sheet';

const Thumb = ({ camera }: { camera: string }) => {
  const c = cameraById(camera)!;
  return (
    <img
      src={mediaUrl(scenes[c.scene].still)}
      alt=""
      loading="lazy"
      className="aspect-video w-full rounded-md object-cover"
    />
  );
};

// ----------------------------------------------------------------- search --

/** Screen 4: search by time, camera, clothing colour, object or plate, then a cross-camera timeline. */
export function SearchView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const [q, setQ] = useState<SearchQuery>(emptyQuery);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState(false);
  const [results, setResults] = useState<Sighting[] | null>(null);
  const [timeline, setTimeline] = useState<Sighting[] | null>(null);
  const [caseId, setCaseId] = useState('');
  const set = <K extends keyof SearchQuery>(k: K, v: SearchQuery[K]) =>
    setQ((x) => ({ ...x, [k]: v }));
  const camList = cameras.filter(
    (c) => q.precinct === 'all' || c.precinct === q.precinct,
  );
  const trackAlert = alertByKey('track');

  const run = (query = q, why = purpose) => {
    if (!why.trim()) {
      setError(true);
      return;
    }
    setError(false);
    const r = search(query);
    setResults(r);
    setTimeline(null);
    const what = query.plate
      ? `plate ${query.plate}`
      : query.cls === 'Person'
        ? `Person, top ${query.top}, bottom ${query.bottom}, ${query.carrying}`
        : `${query.cls}${query.colour !== 'Any' ? `, ${query.colour}` : ''}`;
    dispatch({
      type: 'audit',
      entry: {
        who: persona.name,
        action: `Searched: ${what}, ${query.from}–${query.to}`,
        target:
          query.camera === 'all'
            ? query.precinct === 'all'
              ? 'All cameras'
              : precincts[query.precinct].name
            : query.camera,
        reason: why.trim(),
      },
    });
  };

  const openCases = state.cases.filter((c) => c.status !== 'Closed');

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Search & investigation"
        description="Find a person by clothing colour and what they carried, a vehicle by colour or plate, or a bag, by time and camera. Then follow one sighting across cameras. There is no face search. Every search needs a purpose and is written to the audit log."
      />
      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Card className="content-start">
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Today, recorded sightings</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const nq = {
                    ...emptyQuery,
                    from: '17:30',
                    to: '18:40',
                    top: 'Red',
                    bottom: 'Black',
                    carrying: 'Backpack',
                  };
                  const why = `Alert ${trackAlert.id}, KK12 Blok A lounge line`;
                  setQ(nq);
                  setPurpose(why);
                  run(nq, why);
                }}
              >
                Example
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Alert, case or report reference"
                aria-invalid={error}
              />
              {error && (
                <p className="text-xs text-critical">
                  Enter a purpose. Searches without one are not allowed.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="time"
                  value={q.from}
                  onChange={(e) => set('from', e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="time"
                  value={q.to}
                  onChange={(e) => set('to', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="precinct">Area</Label>
                <NativeSelect
                  id="precinct"
                  value={q.precinct}
                  onChange={(e) =>
                    setQ((x) => ({
                      ...x,
                      precinct: e.target.value as PrecinctId | 'all',
                      camera: 'all',
                    }))
                  }
                >
                  <NativeSelectOption value="all">
                    Whole campus
                  </NativeSelectOption>
                  {precinctIds.map((p) => (
                    <NativeSelectOption key={p} value={p}>
                      {precincts[p].name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="camera">Camera</Label>
                <NativeSelect
                  id="camera"
                  value={q.camera}
                  onChange={(e) => set('camera', e.target.value)}
                >
                  <NativeSelectOption value="all">
                    Any camera
                  </NativeSelectOption>
                  {camList.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>
                      {c.id} · {c.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cls">Object</Label>
              <NativeSelect
                id="cls"
                value={q.cls}
                onChange={(e) => set('cls', e.target.value as ObjectClass)}
              >
                {objectClasses.map((c) => (
                  <NativeSelectOption key={c} value={c}>
                    {c}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            {q.cls === 'Person' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="top">Top</Label>
                  <NativeSelect
                    id="top"
                    value={q.top}
                    onChange={(e) => set('top', e.target.value)}
                  >
                    {['Any', ...topColours].map((c) => (
                      <NativeSelectOption key={c} value={c}>
                        {c}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="bottom">Bottom</Label>
                  <NativeSelect
                    id="bottom"
                    value={q.bottom}
                    onChange={(e) => set('bottom', e.target.value)}
                  >
                    {['Any', ...bottomColours].map((c) => (
                      <NativeSelectOption key={c} value={c}>
                        {c}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="carry">Carrying</Label>
                  <NativeSelect
                    id="carry"
                    value={q.carrying}
                    onChange={(e) => set('carrying', e.target.value)}
                  >
                    {['Any', ...carryOptions].map((c) => (
                      <NativeSelectOption key={c} value={c}>
                        {c}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            )}
            {(q.cls === 'Vehicle' || q.cls === 'Motorcycle') && (
              <div className="grid gap-1.5">
                <Label htmlFor="colour">Colour</Label>
                <NativeSelect
                  id="colour"
                  value={q.colour}
                  onChange={(e) => set('colour', e.target.value)}
                >
                  {['Any', ...vehicleColours].map((c) => (
                    <NativeSelectOption key={c} value={c}>
                      {c}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="plate">Plate (overrides object)</Label>
              <Input
                id="plate"
                value={q.plate}
                onChange={(e) => set('plate', e.target.value)}
                placeholder="e.g. JQR 551"
                className="font-mono"
              />
            </div>
            <Button onClick={() => run()}>
              <Search />
              Search
            </Button>
            <Note>
              Searches match clothing, colour, objects and plates. Face search
              is not available.
            </Note>
          </CardContent>
        </Card>

        <div className="grid min-w-0 content-start gap-4">
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {results.length}{' '}
                  {results.length === 1 ? 'sighting' : 'sightings'} found
                </CardTitle>
                <CardDescription>
                  Select one to follow it across cameras.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                {results.slice(0, 24).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="grid gap-1 rounded-lg p-1 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => setTimeline(crossCameraTimeline(s))}
                    aria-label={`Follow ${describe(s)} at ${s.time}`}
                  >
                    <Thumb camera={s.camera} />
                    <div className="tabular text-xs font-medium">
                      {s.time} · {s.camera}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {describe(s)}
                    </div>
                  </button>
                ))}
                {results.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                    Nothing matches. Widen the time window or set a colour to
                    Any.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {timeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="size-4" /> Cross-camera timeline
                </CardTitle>
                <CardDescription>
                  {describe(timeline[0])} · {timeline.length} cameras ·{' '}
                  {timeline[0].time}–{timeline.at(-1)!.time}. Matching is by
                  clothing and objects, not by face; check each step by eye.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <ol className="grid content-start gap-2">
                  {timeline.map((s, i) => (
                    <li
                      key={s.id}
                      className="grid grid-cols-[6rem_1fr] items-center gap-3"
                    >
                      <Thumb camera={s.camera} />
                      <div className="min-w-0">
                        <div className="tabular text-sm font-medium">
                          {i + 1}. {s.time}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {cameraById(s.camera)?.name}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="grid content-start gap-3">
                  <CampusMap
                    layers={{
                      cameras: true,
                      detections: false,
                      occupancy: false,
                    }}
                    path={timeline.map((s) => s.camera)}
                  />
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="grid flex-1 gap-1.5">
                      <Label htmlFor="case">Add to case</Label>
                      <NativeSelect
                        id="case"
                        value={caseId}
                        onChange={(e) => setCaseId(e.target.value)}
                      >
                        <NativeSelectOption value="">
                          Choose a case
                        </NativeSelectOption>
                        {openCases.map((c) => (
                          <NativeSelectOption key={c.id} value={c.id}>
                            {c.id} · {c.title}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!caseId}
                      onClick={() => {
                        dispatch({
                          type: 'case',
                          id: caseId,
                          patch: {},
                          note: {
                            who: persona.name,
                            text: `Cross-camera timeline added: ${describe(timeline[0])}; ${timeline.map((s) => `${s.time} ${s.camera}`).join(' → ')}.`,
                          },
                        });
                        notify.success('Timeline added to case', caseId);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {!results && (
            <Card>
              <CardContent className="grid place-items-center gap-2 py-16 text-center">
                <Search className="size-6 text-muted-foreground" />
                <p className="max-w-md text-sm text-muted-foreground">
                  Enter a purpose and a description, or try the example: the
                  person who crossed the KK12 Blok A lounge line at 18:31,
                  followed back across campus.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ cases --

const caseTone: Record<
  CaseStatus,
  'critical' | 'warning' | 'brand' | 'success' | 'info'
> = {
  Open: 'warning',
  'With HEP': 'brand',
  'With counselling': 'info',
  'Handed to PDRM': 'critical',
  Closed: 'success',
};

const recipients = [
  'PDRM IPD Brickfields',
  'PDRM IPD Petaling Jaya',
  'HEP discipline system',
  'University legal office',
  'Data subject (DSAR)',
];

async function exportCase(
  c: CaseFile,
  alerts: ReturnType<typeof useDemo>['state']['alerts'],
  opts: {
    to: string;
    blur: boolean;
    who: string;
    images: boolean;
    now: string;
  },
) {
  const mark = `UM · ${c.id} · ${opts.to} · 26 Oct 2026 ${opts.now} · ${opts.who}`;
  const pdf = new Pdf();
  pdf.watermark(`${c.id} · ${opts.to}`);
  pdf.rect(0, 0, 595, 42, [0.63, 0.11, 0.38]);
  pdf.text('EzVision Campus · Evidence export', {
    y: 14,
    size: 14,
    bold: true,
    gray: 1,
  });
  pdf.y = 60;
  pdf.text(`${c.id} · ${c.title}`, { size: 13, bold: true });
  pdf.text(`Status: ${c.status} · Owner: ${c.owner} · Opened ${c.opened}`, {
    gray: 0.3,
  });
  pdf.text(
    `Exported to: ${opts.to} · by ${opts.who} · 26 Oct 2026 ${opts.now}`,
    { gray: 0.3 },
  );
  pdf.text(
    opts.images
      ? `Faces: ${opts.blur ? 'blurred (default)' : 'UNBLURRED by the security director for this case'}`
      : 'Case summary only: no images (role has no video access).',
    { gray: 0.3 },
  );
  pdf.text(`Watermark: ${mark}`, { size: 8, gray: 0.45 });
  pdf.gap();
  pdf.text('Linked alerts', { bold: true, size: 11 });
  const linked = alerts.filter((a) => c.alerts.includes(a.id));
  for (const a of linked) {
    pdf.need(40);
    pdf.text(`${a.id} · ${a.date} ${a.time} · ${a.title}`, { bold: true });
    pdf.para(
      `${a.camera ? `${a.camera} ${cameraById(a.camera)?.name}` : `${a.sensor} (radar)`} · ${a.verdict ?? a.status}${a.action ? ` · ${a.action}` : ''}. ${a.attributes.join('; ')}.`,
      { gray: 0.25 },
    );
    if (opts.images && a.camera) {
      const cam = cameraById(a.camera)!;
      const scene = scenes[cam.scene];
      try {
        const frame = await evidenceFrame(mediaUrl(scene.still), scene.boxes, {
          blur: opts.blur,
          watermark: mark,
        });
        pdf.image(frame.data, frame.w, frame.h, 300);
      } catch {
        pdf.text('(Snapshot could not be rendered in this browser.)', {
          gray: 0.5,
        });
      }
    }
    pdf.gap(4);
  }
  if (!linked.length) pdf.text('None.', { gray: 0.4 });
  pdf.gap();
  pdf.need(30);
  pdf.text('Notes', { bold: true, size: 11 });
  for (const n of c.notes) pdf.para(`${n.time} · ${n.who}: ${n.text}`);
  if (c.outcome) {
    pdf.gap();
    pdf.text('Outcome', { bold: true, size: 11 });
    pdf.para(c.outcome);
  }
  pdf.gap();
  pdf.para(
    'This export was written to the audit log (kept 7 years) as part of the chain of custody. Demonstration data: every person, alert and image is fictional.',
    { size: 8, gray: 0.45 },
  );
  download(`${c.id}-evidence.pdf`, pdf.build());
  return mark;
}

function CaseSheet({
  id,
  persona,
  onClose,
  onAlert,
}: {
  id: string | null;
  persona: Persona;
  onClose: () => void;
  onAlert: (id: string) => void;
}) {
  const { state, dispatch, now } = useDemo();
  const c = state.cases.find((x) => x.id === id);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('');
  const [to, setTo] = useState(recipients[0]);
  const [blur, setBlur] = useState(true);
  const [busy, setBusy] = useState(false);
  const director = canExport(persona);
  const isHep = persona.id === 'hep';
  const linked = c ? state.alerts.filter((a) => c.alerts.includes(a.id)) : [];

  const setStatus = (status: CaseStatus, text: string) => {
    if (!c) return;
    dispatch({
      type: 'case',
      id: c.id,
      patch: { status },
      note: { who: persona.name, text },
    });
    notify.success(text, c.id);
  };

  return (
    <Sheet open={!!c} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
        {c && (
          <>
            <SheetHeader className="gap-2 border-b p-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {c.id}
                </span>
                <Pill t={caseTone[c.status]}>{c.status}</Pill>
                <Pill t="brand">{modules[c.module].name}</Pill>
              </div>
              <SheetTitle className="text-lg">{c.title}</SheetTitle>
              <SheetDescription>
                Owner {c.owner} · opened {c.opened}
                {c.block && ` · ${blockLabel(c.block)}`}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Linked alerts</div>
                {linked.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    disabled={isHep}
                    onClick={() => onAlert(a.id)}
                    className="grid grid-cols-[5rem_1fr] items-center gap-3 rounded-lg p-1 text-left enabled:hover:bg-muted"
                  >
                    {persona.video && a.camera ? (
                      <Thumb camera={a.camera} />
                    ) : (
                      <span className="grid aspect-video place-items-center rounded-md bg-muted text-[10px] text-muted-foreground">
                        No video
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {a.title}
                      </span>
                      <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        {a.id} · {a.date.slice(8)} Oct {a.time}{' '}
                        <AlertStatusBadge status={a.status} />
                        {a.verdict && <VerdictBadge verdict={a.verdict} />}
                      </span>
                    </span>
                  </button>
                ))}
                {!linked.length && (
                  <p className="text-sm text-muted-foreground">
                    No alerts linked.
                  </p>
                )}
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="text-sm font-medium">Notes</div>
                <ol className="grid gap-2">
                  {c.notes.map((n, i) => (
                    <li
                      key={i}
                      className="rounded-lg bg-muted/60 p-2.5 text-sm"
                    >
                      <div className="text-xs text-muted-foreground">
                        {n.time} · {n.who}
                      </div>
                      {n.text}
                    </li>
                  ))}
                </ol>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note"
                  aria-label="Note"
                />
                <Button
                  variant="outline"
                  className="justify-self-start"
                  disabled={!note.trim()}
                  onClick={() => {
                    dispatch({
                      type: 'case',
                      id: c.id,
                      patch: {},
                      note: { who: persona.name, text: note.trim() },
                    });
                    setNote('');
                  }}
                >
                  Add note
                </Button>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="text-sm font-medium">Outcome</div>
                {c.outcome ? (
                  <p className="text-sm">{c.outcome}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not recorded yet.
                  </p>
                )}
                {c.status !== 'Closed' && (
                  <>
                    <Textarea
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      placeholder={
                        isHep
                          ? 'e.g. Disciplinary hearing set for 2 Nov'
                          : 'Outcome'
                      }
                      aria-label="Case outcome"
                    />
                    <div className="flex flex-wrap gap-2">
                      {isHep ? (
                        <Button
                          disabled={!outcome.trim()}
                          onClick={() => {
                            dispatch({
                              type: 'case',
                              id: c.id,
                              patch: { outcome: outcome.trim() },
                              note: {
                                who: persona.name,
                                text: `Disciplinary action opened: ${outcome.trim()}`,
                              },
                            });
                            setOutcome('');
                            notify.success('Disciplinary action opened', c.id);
                          }}
                        >
                          <Gavel />
                          Open disciplinary action
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            disabled={!outcome.trim()}
                            onClick={() => {
                              dispatch({
                                type: 'case',
                                id: c.id,
                                patch: {
                                  outcome: outcome.trim(),
                                  status: 'Closed',
                                },
                                note: {
                                  who: persona.name,
                                  text: `Closed: ${outcome.trim()}`,
                                },
                              });
                              setOutcome('');
                            }}
                          >
                            Close with outcome
                          </Button>
                          {c.status !== 'With HEP' && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                setStatus('With HEP', 'Referred to HEP')
                              }
                            >
                              Refer to HEP
                            </Button>
                          )}
                          {c.status !== 'Handed to PDRM' && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                setStatus('Handed to PDRM', 'Handed to PDRM')
                              }
                            >
                              <Siren />
                              Hand to PDRM
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <Separator />
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileLock2 className="size-4" /> Evidence export
                </div>
                {c.exports.map((e, i) => (
                  <div key={i} className="rounded-lg border p-2.5 text-xs">
                    <div className="font-medium">
                      {e.time} · to {e.to} ·{' '}
                      {e.blurred ? 'faces blurred' : 'unblurred'}
                    </div>
                    <div className="text-muted-foreground">
                      Watermark: {e.watermark}
                    </div>
                  </div>
                ))}
                {director || isHep ? (
                  <>
                    <div className="grid gap-1.5">
                      <Label htmlFor="to">Recipient</Label>
                      <NativeSelect
                        id="to"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      >
                        {(isHep ? ['HEP discipline system'] : recipients).map(
                          (r) => (
                            <NativeSelectOption key={r} value={r}>
                              {r}
                            </NativeSelectOption>
                          ),
                        )}
                      </NativeSelect>
                    </div>
                    {director && (
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-2.5">
                        <Label htmlFor="blur" className="text-sm">
                          Blur faces
                          <span className="block text-xs font-normal text-muted-foreground">
                            Only the security director can unblur, for a case.
                          </span>
                        </Label>
                        <Switch
                          id="blur"
                          checked={blur}
                          onCheckedChange={setBlur}
                        />
                      </div>
                    )}
                    <Button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        const target = isHep ? 'HEP discipline system' : to;
                        const watermark = await exportCase(c, state.alerts, {
                          to: target,
                          blur: isHep || blur,
                          who: persona.name,
                          images: persona.video,
                          now,
                        });
                        dispatch({
                          type: 'case',
                          id: c.id,
                          patch: {
                            exports: [
                              ...c.exports,
                              {
                                time: `26 Oct ${now}`,
                                who: persona.name,
                                to: target,
                                blurred: isHep || blur,
                                watermark,
                              },
                            ],
                          },
                        });
                        dispatch({
                          type: 'audit',
                          entry: {
                            who: persona.name,
                            action: `Exported evidence (${isHep || blur ? 'faces blurred' : 'unblurred'}, watermarked)`,
                            target: c.id,
                            reason: target,
                          },
                        });
                        setBusy(false);
                        notify.success(
                          'Evidence exported',
                          'Watermarked PDF downloaded; audit entry written.',
                        );
                      }}
                    >
                      <Download />
                      {persona.video
                        ? 'Export watermarked evidence (PDF)'
                        : 'Export case summary (PDF)'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch({
                        type: 'case',
                        id: c.id,
                        patch: {},
                        note: {
                          who: persona.name,
                          text: 'Evidence export requested; awaiting security director approval.',
                        },
                      });
                      notify.info(
                        'Export requested',
                        'The security director approves evidence exports.',
                      );
                    }}
                  >
                    <ShieldCheck />
                    Request export (director approves)
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Screen 5: case files. HEP sees confirmed cases referred to it, with no live video. */
export function CasesView({
  persona,
  focus,
}: {
  persona: Persona;
  focus?: string;
}) {
  const { state } = useDemo();
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [alertId, setAlertId] = useState<string | null>(null);
  const isHep = persona.id === 'hep';
  const list = isHep
    ? state.cases.filter((c) => c.status === 'With HEP')
    : state.cases;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title={isHep ? 'Confirmed cases for HEP' : 'Cases'}
        description={
          isHep
            ? 'Cases a warden or the command centre has verified and referred to student affairs. You see the record, not live video. AI never issues a penalty: the decision is yours.'
            : 'Linked alerts, notes, outcome and evidence exports. Every export is watermarked and written to the audit log; faces are blurred unless the security director unblurs for a case.'
        }
      />
      {isHep && (
        <Callout>
          <ShieldCheck />
          <AlertTitle>Welfare is not discipline</AlertTitle>
          <AlertDescription>
            Wellbeing and at-height alerts go to counselling and never appear
            here.
          </AlertDescription>
        </Callout>
      )}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead className="hidden md:table-cell">Module</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Alerts
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Opened
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(c.id)}
                >
                  <TableCell className="whitespace-normal">
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(c.id);
                      }}
                    >
                      {c.title}
                    </button>
                    <div className="font-mono text-xs text-muted-foreground">
                      {c.id}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {modules[c.module].name}
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">
                    {c.alerts.length}
                  </TableCell>
                  <TableCell>
                    <Pill t={caseTone[c.status]}>{c.status}</Pill>
                  </TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                    {c.opened}
                  </TableCell>
                </TableRow>
              ))}
              {!list.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No cases.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CaseSheet
        id={openId}
        persona={persona}
        onClose={() => {
          setOpenId(null);
          if (focus) navigate('/um/cases');
        }}
        onAlert={(id) => setAlertId(id)}
      />
      <AlertSheet
        id={alertId}
        persona={persona}
        onClose={() => setAlertId(null)}
      />
    </div>
  );
}
