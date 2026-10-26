'use client';
import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  Send,
  HeartHandshake,
  Landmark,
  UserRoundCheck,
  Ban,
  Radio,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { CameraFeed } from '../../_components/camera-feed';
import {
  SeverityBadge,
  StatusBadge,
  Pill,
  Note,
} from '../../_components/ui-bits';
import { cameraById, officers, analytics, precincts } from '../../_data/um';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

export function IncidentSheet({
  id,
  persona,
  onClose,
}: {
  id: string | null;
  persona: Persona;
  onClose: () => void;
}) {
  const { state, dispatch } = useDemo();
  const incident = state.incidents.find((i) => i.id === id);
  const [officer, setOfficer] = useState('PB-01');
  const actor = persona.name;
  const canAct = persona.id === 'chief' || persona.id === 'soc';
  const hidden =
    incident?.restricted && !['chief', 'hepa'].includes(persona.id);

  return (
    <Sheet open={!!incident} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
        {incident && (
          <>
            <SheetHeader className="gap-2 border-b p-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {incident.id}
                </span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
                {incident.restricted && (
                  <Pill t="brand">
                    <Lock className="size-3" />
                    Restricted
                  </Pill>
                )}
              </div>
              <SheetTitle className="text-lg">{incident.title}</SheetTitle>
              <SheetDescription>
                {hidden ? 'Location withheld' : incident.location} ·{' '}
                {incident.time}
                {incident.date !== '2026-10-26' && ' yesterday'} ·{' '}
                {precincts[incident.precinct].name}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 p-4">
              {hidden ? (
                <Note>
                  This is a confidential report. Its details are visible only to
                  the assigned case officer, the Chief Security Officer and HEP.
                  You can see that it exists so the queue stays complete.
                </Note>
              ) : (
                <>
                  {incident.camera && persona.video && (
                    <CameraFeed camera={cameraById(incident.camera)!} />
                  )}
                  {incident.camera && !persona.video && (
                    <Note>
                      Video is not available to your role. Case summaries only.
                    </Note>
                  )}
                  <p className="text-sm">{incident.summary}</p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd>{incident.source}</dd>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{incident.category}</dd>
                    {incident.analytic && (
                      <>
                        <dt className="text-muted-foreground">Analytic</dt>
                        <dd>{analytics[incident.analytic].name}</dd>
                      </>
                    )}
                    {incident.confidence !== undefined && (
                      <>
                        <dt className="text-muted-foreground">
                          Model confidence
                        </dt>
                        <dd className="tabular">
                          {Math.round(incident.confidence * 100)}% · needs human
                          verification
                        </dd>
                      </>
                    )}
                    <dt className="text-muted-foreground">Assigned</dt>
                    <dd>
                      {incident.assigned
                        ? `${incident.assigned} · ${officers.find((o) => o.callsign === incident.assigned)?.name ?? ''}`
                        : 'Unassigned'}
                    </dd>
                  </dl>
                </>
              )}

              {canAct &&
                !['Resolved', 'False alarm'].includes(incident.status) && (
                  <div className="grid gap-2 rounded-lg border p-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Response
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {incident.status === 'New' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            dispatch({
                              type: 'status',
                              id: incident.id,
                              status: 'Acknowledged',
                              actor,
                            });
                            notify.info('Acknowledged', incident.id);
                          }}
                        >
                          <UserRoundCheck />
                          Acknowledge
                        </Button>
                      )}
                      <div className="flex gap-1">
                        <NativeSelect
                          size="sm"
                          value={officer}
                          onChange={(e) => setOfficer(e.target.value)}
                          aria-label="Officer"
                        >
                          {officers.map((o) => (
                            <NativeSelectOption key={o.id} value={o.callsign}>
                              {o.callsign} · {o.status}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            dispatch({
                              type: 'assign',
                              id: incident.id,
                              officer,
                              actor,
                            });
                            notify.success(
                              `${officer} dispatched`,
                              'Sent to the EzPatrol app',
                            );
                          }}
                        >
                          <Send />
                          Dispatch
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          dispatch({
                            type: 'status',
                            id: incident.id,
                            status: 'Resolved',
                            actor,
                            note: 'Resolved by SOC',
                          });
                          notify.success('Resolved', incident.id);
                        }}
                      >
                        <CheckCircle2 />
                        Resolve
                      </Button>
                      {incident.source === 'AI video' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            dispatch({
                              type: 'status',
                              id: incident.id,
                              status: 'False alarm',
                              actor,
                              note: 'Verified as false alarm; fed back to tuning',
                            });
                            notify.info(
                              'Marked false alarm',
                              'Recorded against the analytic for tuning',
                            );
                          }}
                        >
                          <Ban />
                          False alarm
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() =>
                          notify.success(
                            'Welfare referral sent to HEP',
                            'Summary only; no video is shared with welfare cases',
                          )
                        }
                      >
                        <HeartHandshake />
                        Refer to HEP welfare
                      </Button>
                      {(incident.severity === 'Critical' ||
                        incident.severity === 'High') && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() =>
                            notify.success(
                              'Escalation filed with KPT',
                              'Category, scale and actions only. No names or footage.',
                            )
                          }
                        >
                          <Landmark />
                          Escalate to KPT
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() =>
                          notify.info(
                            'PA / talk-down channel opened',
                            'Demo only',
                          )
                        }
                      >
                        <Radio />
                        Talk-down
                      </Button>
                    </div>
                  </div>
                )}

              {!hidden && incident.sop.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Standard operating procedure
                  </div>
                  <ul className="grid gap-1">
                    {incident.sop.map((s, n) => (
                      <li key={s.step}>
                        <button
                          type="button"
                          disabled={!canAct}
                          onClick={() =>
                            dispatch({ type: 'sop', id: incident.id, index: n })
                          }
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:hover:bg-transparent"
                        >
                          {s.done ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              s.done ? 'text-muted-foreground line-through' : ''
                            }
                          >
                            {s.step}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Timeline
                </div>
                <ol className="relative grid gap-3 border-l pl-4">
                  {[...incident.timeline].reverse().map((t, n) => (
                    <li key={n} className="relative text-sm">
                      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary ring-4 ring-background" />
                      <div>{hidden ? 'Update recorded' : t.text}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.time} · {t.actor}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
