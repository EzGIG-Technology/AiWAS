'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CircleHelp,
  FolderPlus,
  Radar,
  ShieldAlert,
  Timer,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CameraFeed } from '../../_components/camera-feed';
import { CampusMap } from '../../_components/campus-map';
import {
  AlertStatusBadge,
  DetectorStatusBadge,
  Note,
  Pill,
  SeverityBadge,
  VerdictBadge,
} from '../../_components/ui-bits';
import {
  blockById,
  blockLabel,
  cameraById,
  detectors,
  modules,
  precincts,
  toMin,
  fromMin,
} from '../../_data/um';
import {
  ESCALATE_AFTER_MIN,
  actionsFor,
  isEscalated,
  lifecycle,
  minutesSince,
  routesToWarden,
  ruleDsl,
  type Alert,
} from '../../_data/alerts';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { useAlertActions } from '../../_lib/actions';
import { navigate } from '../../_lib/router';

/** Who may move an alert along: the command centre, and each office for its own module. */
function canAct(p: Persona, a: Alert) {
  if (p.id === 'director' || p.id === 'operator' || p.id === 'warden')
    return true;
  if (p.id === 'facilities') return a.module === 'hse' || a.module === 'space';
  if (p.id === 'traffic') return a.module === 'mobility';
  if (p.id === 'counsellor')
    return a.detector === 'wellbeing' || a.detector === 'at_height';
  return false;
}

export function Lifecycle({ alert }: { alert: Alert }) {
  const at = lifecycle.findIndex((s) => s.status === alert.status);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Alert lifecycle">
      {lifecycle.map((s, i) => (
        <li key={s.status} className="grid gap-1" title={s.text}>
          <span
            className={cn(
              'h-1.5 rounded-full',
              i <= at ? 'bg-primary' : 'bg-muted',
            )}
          />
          <span
            className={cn(
              'truncate text-[10px] sm:text-[11px]',
              i === at
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground',
            )}
            aria-current={i === at ? 'step' : undefined}
          >
            {i + 1}. {s.status}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Escalation state for an alert routed to a warden. */
export function EscalationNote({ alert, now }: { alert: Alert; now: string }) {
  if (!routesToWarden(alert)) return null;
  if (isEscalated(alert, now))
    return (
      <Pill t="critical">
        <ShieldAlert className="size-3" />
        Escalated to command centre at{' '}
        {fromMin(toMin(alert.time) + ESCALATE_AFTER_MIN)}
      </Pill>
    );
  if (alert.status !== 'New') return null;
  const left = ESCALATE_AFTER_MIN - minutesSince(alert, now);
  return (
    <Pill t="warning">
      <Timer className="size-3" />
      Escalates in {left} min unless accepted
    </Pill>
  );
}

/** Screen 2: alert detail. Clip, snapshot, the rule that fired, the camera on the map, actions. */
export function AlertSheet({
  id,
  persona,
  onClose,
}: {
  id: string | null;
  persona: Persona;
  onClose: () => void;
}) {
  const { state, now } = useDemo();
  const alert = state.alerts.find((a) => a.id === id);
  const camera = alert?.camera ? cameraById(alert.camera) : undefined;
  const rule = alert ? state.rules.find((r) => r.id === alert.rule) : undefined;
  const actions = useAlertActions(persona);
  const [media, setMedia] = useState<'clip' | 'snapshot'>('clip');
  const [outcome, setOutcome] = useState('');
  const logged = useRef<string | null>(null);

  useEffect(() => {
    if (alert && camera && persona.video && logged.current !== alert.id) {
      logged.current = alert.id;
      actions.logView(alert);
    }
  }, [alert, camera, persona.video, actions]);

  const may = alert ? canAct(persona, alert) : false;
  const hours = alert?.block ? state.hours[alert.block] : undefined;

  return (
    <Sheet open={!!alert} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
        {alert && (
          <>
            <SheetHeader className="gap-2 border-b p-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {alert.id}
                </span>
                <SeverityBadge severity={alert.severity} />
                <AlertStatusBadge status={alert.status} />
                {alert.verdict && <VerdictBadge verdict={alert.verdict} />}
                <Pill t="brand">{modules[alert.module].name}</Pill>
              </div>
              <SheetTitle className="text-lg">{alert.title}</SheetTitle>
              <SheetDescription>
                {camera
                  ? `${camera.id} · ${camera.name} · ${precincts[camera.precinct].name}`
                  : `${alert.sensor} · ${alert.block ? blockLabel(alert.block) : ''} · radar, no camera`}
                {' · '}
                {alert.date === '2026-10-26'
                  ? alert.time
                  : `${alert.date.slice(8)} Oct ${alert.time}`}
              </SheetDescription>
              <div className="flex flex-wrap gap-2">
                <EscalationNote alert={alert} now={now} />
              </div>
            </SheetHeader>

            <div className="grid gap-4 p-4">
              <Lifecycle alert={alert} />

              {!camera ? (
                <div className="grid place-items-center gap-2 rounded-lg bg-muted/60 p-6 text-center">
                  <Radar className="size-6 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    No camera in this space
                  </div>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Toilets and changing rooms use 60 GHz radar only. The sensor
                    reports a fall or prolonged presence; there is no image to
                    show or keep.
                  </p>
                </div>
              ) : persona.video ? (
                <div className="grid gap-2">
                  <Tabs
                    value={media}
                    onValueChange={(v) => setMedia(v as typeof media)}
                  >
                    <TabsList>
                      <TabsTrigger value="clip">10-second clip</TabsTrigger>
                      <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <CameraFeed camera={camera} live={media === 'clip'} />
                  <p className="text-[11px] text-muted-foreground">
                    Viewing is logged to the audit trail. Exports blur faces
                    unless the security director unblurs for a case.
                  </p>
                </div>
              ) : (
                <Note>Video is not available to your role.</Note>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid content-start gap-1.5">
                  <div className="text-xs font-medium text-muted-foreground">
                    What the engine saw
                  </div>
                  <ul className="grid gap-1 text-sm">
                    {alert.attributes.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                    {alert.plate && persona.video && (
                      <li className="font-mono font-semibold">{alert.plate}</li>
                    )}
                  </ul>
                  <div className="tabular text-xs text-muted-foreground">
                    Confidence {Math.round(alert.confidence * 100)}%
                  </div>
                </div>
                <div className="grid content-start gap-1.5">
                  <div className="text-xs font-medium text-muted-foreground">
                    Routed to
                  </div>
                  <div className="text-sm">
                    {alert.route[0].toUpperCase() + alert.route.slice(1)}
                    {alert.alsoNotify && ` + ${alert.alsoNotify}`}
                  </div>
                  {alert.assignee && (
                    <div className="text-xs text-muted-foreground">
                      Accepted by {alert.assignee}
                    </div>
                  )}
                  {alert.caseId && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto justify-self-start p-0"
                      onClick={() => navigate(`/um/cases/${alert.caseId}`)}
                    >
                      Case {alert.caseId}
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{alert.summary}</p>

              <div className="grid gap-1.5 rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {detectors[alert.detector].name}
                  </span>
                  <DetectorStatusBadge
                    status={detectors[alert.detector].status}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Cannot: </span>
                  {detectors[alert.detector].cannot}
                </p>
              </div>

              {rule && (
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Rule that fired · {rule.id} v{rule.version}
                    </div>
                    {(persona.id === 'director' ||
                      persona.id === 'pengetua') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/um/rules/${rule.id}`)}
                      >
                        Rules studio
                      </Button>
                    )}
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] leading-relaxed whitespace-pre">
                    {ruleDsl(rule, hours)}
                  </pre>
                </div>
              )}

              {camera && (
                <div className="grid gap-1.5">
                  <div className="text-xs font-medium text-muted-foreground">
                    Camera on the map
                  </div>
                  <CampusMap
                    layers={{
                      cameras: true,
                      detections: false,
                      occupancy: false,
                    }}
                    focus={camera.id}
                    className="aspect-[16/8]"
                  />
                </div>
              )}

              {may && alert.status !== 'Closed' && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Next step</div>
                    {alert.status === 'New' && (
                      <Button onClick={() => actions.acknowledge(alert)}>
                        <Check />
                        {routesToWarden(alert) ? 'Accept' : 'Acknowledge'}
                      </Button>
                    )}
                    {alert.status === 'Acknowledged' && (
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => actions.verify(alert, 'True')}>
                          <Check />
                          True
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => actions.verify(alert, 'False alarm')}
                        >
                          <X />
                          False alarm
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => actions.verify(alert, 'Unsure')}
                        >
                          <CircleHelp />
                          Unsure
                        </Button>
                      </div>
                    )}
                    {alert.status === 'Verified' && (
                      <div className="flex flex-wrap gap-2">
                        {actionsFor(alert).map((x) => (
                          <Button
                            key={x}
                            variant="outline"
                            size="sm"
                            onClick={() => actions.act(alert, x)}
                          >
                            {x}
                          </Button>
                        ))}
                      </div>
                    )}
                    {(alert.status === 'Actioned' ||
                      alert.status === 'Verified') && (
                      <div className="grid gap-2">
                        <Textarea
                          value={outcome}
                          onChange={(e) => setOutcome(e.target.value)}
                          placeholder="Outcome, e.g. visitor escorted out at 18:50"
                          aria-label="Outcome"
                        />
                        <Button
                          variant="secondary"
                          disabled={!outcome.trim()}
                          onClick={() => {
                            actions.close(alert, outcome.trim());
                            setOutcome('');
                          }}
                        >
                          Close with outcome
                        </Button>
                      </div>
                    )}
                    {!alert.caseId &&
                      (persona.id === 'operator' ||
                        persona.id === 'director') &&
                      alert.detector !== 'wellbeing' && (
                        <Button
                          variant="ghost"
                          className="justify-self-start"
                          onClick={() => actions.openCase(alert)}
                        >
                          <FolderPlus />
                          Open a case
                        </Button>
                      )}
                    {(alert.detector === 'wellbeing' ||
                      alert.detector === 'at_height') && (
                      <Note>
                        Welfare is not discipline: this alert can go to
                        counselling, never to HEP.
                      </Note>
                    )}
                  </div>
                </>
              )}
              {alert.outcome && (
                <div className="rounded-lg bg-success-soft p-3 text-sm text-success">
                  <span className="font-medium">Outcome: </span>
                  {alert.outcome}
                </div>
              )}

              <Separator />
              <div className="grid gap-2">
                <div className="text-sm font-medium">Timeline</div>
                <ol className="grid gap-2 border-l pl-4">
                  {alert.timeline.map((t, i) => (
                    <li key={i} className="relative text-sm">
                      <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-primary" />
                      <span className="tabular mr-2 text-xs text-muted-foreground">
                        {t.time}
                      </span>
                      {t.text}
                      <span className="text-xs text-muted-foreground">
                        {' '}
                        · {t.actor}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              {alert.block && (
                <p className="text-[11px] text-muted-foreground">
                  {blockLabel(alert.block)} is a{' '}
                  {blockById(alert.block).type.toLowerCase()} block. Visiting{' '}
                  {hours?.visitFrom}–{hours?.visitTo}; curfew {hours?.curfew}.
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
