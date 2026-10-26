'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import { Eye, History, PenLine, Radar, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Switch } from '@/components/ui/switch';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  DetectorStatusBadge,
  Note,
  PageHeader,
  Pill,
  SeverityBadge,
} from '../../_components/ui-bits';
import {
  blockById,
  blockLabel,
  cameraById,
  detectors,
  modules,
  moduleIds,
  type ModuleId,
} from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';
import {
  previewRule,
  ruleDsl,
  scheduleText,
  type Rule,
  type Schedule,
  type Severity,
} from '../../_data/alerts';
import { exclusions } from '../../_data/govern';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { canEditRules } from '../../_lib/scope';
import { notify } from '../../_lib/notify';
import { navigate } from '../../_lib/router';

/** The camera view with the rule's line; click twice to redraw it. */
function LineEditor({
  rule,
  editable,
  video,
  onLine,
}: {
  rule: Rule;
  editable: boolean;
  /** Roles without video see the line on a blank frame, never the camera image. */
  video: boolean;
  onLine: (l: [number, number, number, number]) => void;
}) {
  const [drawing, setDrawing] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState(false);
  const cam = rule.camera ? cameraById(rule.camera) : undefined;
  if (!cam)
    return (
      <div className="grid aspect-video place-items-center gap-2 rounded-lg bg-muted/60 p-6 text-center">
        <Radar className="size-6 text-muted-foreground" />
        <p className="max-w-xs text-xs text-muted-foreground">
          Radar sensor {rule.sensor}. There is no image, so there is nothing to
          draw: the rule uses the sensor’s own zone.
        </p>
      </div>
    );
  const l = rule.line;
  const pick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // A keyboard press has no pointer position: place a level line instead.
    const keyboard = e.detail === 0;
    const p: [number, number] = keyboard
      ? [drawing ? 80 : 20, 70]
      : [
          Math.round(((e.clientX - r.left) / r.width) * 100),
          Math.round(((e.clientY - r.top) / r.height) * 100),
        ];
    if (!drawing) setDrawing(p);
    else {
      onLine([drawing[0], drawing[1], p[0], p[1]]);
      setDrawing(null);
      setMode(false);
    }
  };
  return (
    <div className="grid gap-2">
      <div
        className={cn(
          'relative aspect-video overflow-hidden rounded-lg bg-neutral-900',
          mode && 'cursor-crosshair ring-2 ring-primary',
        )}
      >
        {video ? (
          <img
            src={mediaUrl(scenes[cam.scene].still)}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center p-6 text-center text-xs text-white/70">
            Camera view hidden for your role. The line is shown on a blank
            frame.
          </span>
        )}
        {mode && (
          <button
            type="button"
            onClick={pick}
            className="absolute inset-0 z-10 cursor-crosshair focus-visible:outline-none"
            aria-label={
              drawing
                ? 'Place the second point of the line'
                : 'Place the first point of the line'
            }
          />
        )}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          {l && (
            <>
              <line
                x1={l[0]}
                y1={l[1]}
                x2={l[2]}
                y2={l[3]}
                stroke="var(--primary)"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 3 }}
              />
              <line
                x1={(l[0] + l[2]) / 2}
                y1={(l[1] + l[3]) / 2}
                x2={(l[0] + l[2]) / 2 - (l[3] - l[1]) * 0.15}
                y2={(l[1] + l[3]) / 2 + (l[2] - l[0]) * -0.15}
                stroke="white"
                strokeDasharray="2 1"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 2 }}
              />
            </>
          )}
          {drawing && (
            <circle
              cx={drawing[0]}
              cy={drawing[1]}
              r="1.2"
              fill="var(--primary)"
            />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/70 to-transparent p-2 text-[11px] text-white">
          <span>
            {cam.id} · {cam.name}
          </span>
          <span>Yesterday 21:00 still</span>
        </div>
        {l && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            Line: {rule.where.match(/"([^"]+)"/)?.[1] ?? 'zone'} · dashed arrow
            points INTO the zone
          </span>
        )}
      </div>
      {editable && rule.line && (
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            setMode(!mode);
            setDrawing(null);
          }}
        >
          <PenLine />
          {mode
            ? drawing
              ? 'Click the second point'
              : 'Click the first point'
            : 'Redraw the line'}
        </Button>
      )}
    </div>
  );
}

/** Screen 7: rules studio. Zone + object + condition + schedule + action, without code. */
export function RulesStudio({
  persona,
  focus,
}: {
  persona: Persona;
  focus?: string;
}) {
  const { state, dispatch, now } = useDemo();
  const editable = canEditRules(persona);
  const college = persona.alerts.college;
  const visible = state.rules.filter(
    (r) => !college || (!!r.block && blockById(r.block).college === college),
  );
  const [mod, setMod] = useState<'all' | ModuleId>(
    persona.id === 'pengetua' ? 'hostel' : 'all',
  );
  const [selId, setSelId] = useState<string>(
    focus && visible.some((r) => r.id === focus) ? focus : visible[0].id,
  );
  const saved = state.rules.find((r) => r.id === selId)!;
  const [draft, setDraft] = useState<Rule>(saved);
  const [preview, setPreview] = useState(false);
  if (draft.id !== saved.id) {
    setDraft(saved);
    setPreview(false);
  }
  const hours = draft.block ? state.hours[draft.block] : undefined;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (patch: Partial<Rule>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setPreview(false);
  };
  const before = previewRule(saved, hours);
  const after = previewRule(draft, hours);
  const list = visible.filter((r) => mod === 'all' || r.module === mod);

  const save = () => {
    const change = [
      draft.threshold !== saved.threshold &&
        `threshold ${saved.threshold.toFixed(2)} → ${draft.threshold.toFixed(2)}`,
      JSON.stringify(draft.schedule) !== JSON.stringify(saved.schedule) &&
        `schedule → ${scheduleText(draft.schedule, hours)}`,
      draft.severity !== saved.severity && `severity → ${draft.severity}`,
      JSON.stringify(draft.line) !== JSON.stringify(saved.line) &&
        'line redrawn',
      draft.escalateMin !== saved.escalateMin &&
        `escalation → ${draft.escalateMin ?? 'none'} min`,
      draft.enabled !== saved.enabled &&
        (draft.enabled ? 'enabled' : 'disabled'),
    ]
      .filter(Boolean)
      .join(', ');
    dispatch({
      type: 'rule',
      rule: {
        ...draft,
        version: saved.version + 1,
        updated: `26 Oct ${now}`,
        updatedBy: persona.name,
        history: [
          {
            version: saved.version,
            updated: saved.updated,
            by: saved.updatedBy,
            change: 'Previous version',
          },
          ...(saved.history ?? []),
        ],
      },
    });
    dispatch({
      type: 'audit',
      entry: {
        who: persona.name,
        action: `Changed rule ${saved.id} v${saved.version} → v${saved.version + 1}: ${change || 'no field changes'}`,
        target: saved.id,
        reason: 'Rules studio',
      },
    });
    notify.success(
      `Saved ${saved.id} v${saved.version + 1}`,
      'The old version is kept forever and the change is in the audit log.',
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Rules studio"
        description="Each rule is zone + object + condition + schedule + action. Draw the line on the camera view, set the hours and the threshold, preview against yesterday’s footage, then save a new version. Detections that break no rule are dropped on the edge box."
      />
      {!editable && (
        <Note>
          {persona.id === 'pengetua'
            ? 'You see your college’s hostel rules. You set visiting hours and curfew per block on the Hostel dashboard; rules 03 and 04 follow them. Thresholds and lines are changed by the security director.'
            : 'Read only. Rules are changed by the security director; every change is versioned and logged.'}
          {persona.id === 'pengetua' && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 pl-1"
              onClick={() => navigate('/um/hostel')}
            >
              Set hours
            </Button>
          )}
        </Note>
      )}
      <div className="grid gap-4 xl:grid-cols-[20rem_1fr]">
        <Card className="content-start">
          <CardHeader>
            <CardTitle>Rules</CardTitle>
            <CardDescription>{visible.length} rules</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {persona.id !== 'pengetua' && (
              <NativeSelect
                value={mod}
                onChange={(e) => setMod(e.target.value as typeof mod)}
                aria-label="Module"
              >
                <NativeSelectOption value="all">All modules</NativeSelectOption>
                {moduleIds.map((m) => (
                  <NativeSelectOption key={m} value={m}>
                    {modules[m].name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
            <div className="grid max-h-[36rem] gap-0.5 overflow-y-auto">
              {list.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelId(r.id)}
                  className={cn(
                    'rounded-lg px-2 py-1.5 text-left hover:bg-muted',
                    r.id === selId && 'bg-muted',
                  )}
                  aria-current={r.id === selId ? 'true' : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {r.id}
                    </span>
                    {!r.enabled && <Pill>Off</Pill>}
                  </div>
                  <div className="truncate text-sm">{r.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.block ? blockLabel(r.block) : modules[r.module].name} · v
                    {r.version}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {draft.id} · {draft.name}
              </CardTitle>
              <CardDescription>
                {modules[draft.module].name}
                {draft.block && ` · ${blockLabel(draft.block)}`} · v
                {saved.version}, {saved.updated} by {saved.updatedBy}
              </CardDescription>
              <CardAction className="flex gap-2">
                <SeverityBadge severity={draft.severity} />
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <LineEditor
                rule={draft}
                editable={editable}
                video={persona.video}
                onLine={(line) => set({ line })}
              />
              <div className="grid content-start gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">
                    {detectors[draft.detector].name}
                  </span>
                  <DetectorStatusBadge
                    status={detectors[draft.detector].status}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="threshold">
                    Confidence threshold: {draft.threshold.toFixed(2)}
                  </Label>
                  <input
                    id="threshold"
                    type="range"
                    min={0.5}
                    max={0.99}
                    step={0.01}
                    value={draft.threshold}
                    disabled={!editable}
                    onChange={(e) => set({ threshold: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="schedule">Schedule</Label>
                    <NativeSelect
                      id="schedule"
                      value={draft.schedule.kind}
                      disabled={!editable}
                      onChange={(e) => {
                        const k = e.target.value as Schedule['kind'];
                        set({
                          schedule:
                            k === 'window'
                              ? { kind: 'window', from: '18:00', to: '06:00' }
                              : ({ kind: k } as Schedule),
                        });
                      }}
                    >
                      <NativeSelectOption value="always">
                        Always
                      </NativeSelectOption>
                      {draft.block && (
                        <NativeSelectOption value="after-visiting">
                          After visiting hours
                        </NativeSelectOption>
                      )}
                      {draft.block && (
                        <NativeSelectOption value="curfew">
                          Curfew
                        </NativeSelectOption>
                      )}
                      <NativeSelectOption value="window">
                        Time window
                      </NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="severity">Severity</Label>
                    <NativeSelect
                      id="severity"
                      value={draft.severity}
                      disabled={!editable}
                      onChange={(e) =>
                        set({ severity: e.target.value as Severity })
                      }
                    >
                      {(['High', 'Medium', 'Low'] as Severity[]).map((s) => (
                        <NativeSelectOption key={s} value={s}>
                          {s}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
                {draft.schedule.kind === 'window' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="wfrom">From</Label>
                      <Input
                        id="wfrom"
                        type="time"
                        disabled={!editable}
                        value={draft.schedule.from}
                        onChange={(e) =>
                          draft.schedule.kind === 'window' &&
                          set({
                            schedule: {
                              ...draft.schedule,
                              from: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="wto">To</Label>
                      <Input
                        id="wto"
                        type="time"
                        disabled={!editable}
                        value={draft.schedule.to}
                        onChange={(e) =>
                          draft.schedule.kind === 'window' &&
                          set({
                            schedule: { ...draft.schedule, to: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="route">Route to</Label>
                    <Input id="route" value={draft.route} disabled readOnly />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="escalate">Escalate after (min)</Label>
                    <Input
                      id="escalate"
                      type="number"
                      min={1}
                      max={30}
                      disabled={!editable}
                      value={draft.escalateMin ?? ''}
                      placeholder="No escalation"
                      onChange={(e) =>
                        set({
                          escalateMin: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 p-2.5">
                  <Label htmlFor="enabled">Rule enabled</Label>
                  <Switch
                    id="enabled"
                    checked={draft.enabled}
                    disabled={!editable}
                    onCheckedChange={(v) => set({ enabled: v })}
                  />
                </div>
                {draft.detector === 'gender_boundary' && (
                  <Note>
                    Gender estimation runs only on this block’s lounge-line
                    camera, names no one and stores no face template. Accuracy
                    at night and with hijab is untested until the pilot bias
                    test.
                  </Note>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rule</CardTitle>
                <CardDescription>As the engine reads it</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] leading-relaxed whitespace-pre">
                  {ruleDsl(draft, hours)}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Preview against yesterday’s footage</CardTitle>
                <CardDescription>
                  25 Oct, 00:00–24:00 · {draft.camera ?? draft.sensor}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreview(true)}
                  >
                    <Eye />
                    Preview
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                {preview ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <div className="text-xs text-muted-foreground">
                          Saved v{saved.version}
                        </div>
                        <div className="tabular text-lg font-semibold">
                          {before.hits.length} alerts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {before.trueCount} likely true · {before.falseCount}{' '}
                          likely false
                        </div>
                      </div>
                      <div className="rounded-lg bg-brand-soft p-2.5">
                        <div className="text-xs text-brand">Draft</div>
                        <div className="tabular text-lg font-semibold">
                          {after.hits.length} alerts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {after.trueCount} likely true · {after.falseCount}{' '}
                          likely false
                        </div>
                      </div>
                    </div>
                    <ol className="flex flex-wrap gap-1.5">
                      {after.hits.map((h) => (
                        <li key={h.time}>
                          <Pill t={h.truth ? 'critical' : 'muted'}>
                            {h.time} · {Math.round(h.confidence * 100)}%
                          </Pill>
                        </li>
                      ))}
                    </ol>
                    <p className="text-[11px] text-muted-foreground">
                      “Likely” uses how wardens and operators marked similar
                      alerts on this camera. Tuning is per camera.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    See how many alerts this rule would have raised yesterday,
                    and how many were likely false alarms, before you save.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-4" /> Versions
              </CardTitle>
              <CardDescription>
                Fired {saved.fired7d} times in 7 days; {saved.false7d} false
                alarms fed back to tuning. Every version is kept forever.
              </CardDescription>
              {editable && (
                <CardAction>
                  <Button disabled={!dirty} onClick={save}>
                    <Save />
                    Save v{saved.version + 1}
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <div>
                <span className="font-medium">v{saved.version}</span> ·{' '}
                {saved.updated} · {saved.updatedBy}{' '}
                <Pill t="success">Current</Pill>
              </div>
              {(saved.history ?? []).map((h) => (
                <div key={h.version} className="text-muted-foreground">
                  v{h.version} · {h.updated} · {h.by}
                </div>
              ))}
              {saved.version > 1 && !(saved.history ?? []).length && (
                <div className="text-muted-foreground">
                  v1–v{saved.version - 1} archived
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rules the studio will not make</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              {exclusions.map((x) => (
                <div key={x.item}>
                  <div className="font-medium">{x.item}</div>
                  <p className="text-xs text-muted-foreground">{x.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
