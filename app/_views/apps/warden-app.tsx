'use client';
import { useState } from 'react';
import { Bell, Check, CircleHelp, History, Radar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CameraFeed } from '../../_components/camera-feed';
import { UniversityLogo } from '../../_components/brand';
import { AlertStatusBadge, SeverityBadge } from '../../_components/ui-bits';
import { blockLabel, blocks, cameraById } from '../../_data/um';
import {
  hostelByDoor,
  hostelWeekly,
  isOpen,
  wardenOutcomes,
  type Alert,
  type Verdict,
} from '../../_data/alerts';
import { roster } from '../../_data/govern';
import { personaById } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { alertsFor } from '../../_lib/scope';
import { useAlertActions } from '../../_lib/actions';
import { notify } from '../../_lib/notify';
import { EscalationNote } from '../um/alert-sheet';
import { Phone } from './phone';

type Tab = 'inbox' | 'history';

function InboxCard({ alert }: { alert: Alert }) {
  const { now } = useDemo();
  const me = personaById('warden');
  const actions = useAlertActions(me);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const cam = alert.camera ? cameraById(alert.camera) : undefined;

  return (
    <Card
      size="sm"
      className={cn(alert.status === 'New' && 'ring-2 ring-critical/40')}
    >
      <CardContent className="grid gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={alert.severity} />
          <AlertStatusBadge status={alert.status} />
          <span className="tabular ml-auto text-[11px] text-muted-foreground">
            {alert.time}
          </span>
        </div>
        <div className="text-sm font-semibold">{alert.title}</div>
        <EscalationNote alert={alert} now={now} />
        {cam ? (
          <CameraFeed camera={cam} compact />
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <Radar className="size-4 shrink-0" />
            Radar only: there is no camera in this space.
          </div>
        )}
        <ul className="grid gap-0.5 text-xs text-muted-foreground">
          {alert.attributes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {alert.status === 'New' && (
          <Button
            onClick={() => {
              actions.acknowledge(alert);
              notify.success(
                'Accepted',
                'Escalation timer stopped. Go and check.',
              );
            }}
          >
            <Check />
            Accept
          </Button>
        )}

        {alert.status === 'Acknowledged' && !verdict && (
          <div className="grid gap-1.5">
            <div className="text-xs font-medium">1. What did you find?</div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button size="sm" onClick={() => setVerdict('True')}>
                <Check />
                True
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  actions.verify(alert, 'False alarm');
                }}
              >
                <X />
                False
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVerdict('Unsure')}
              >
                <CircleHelp />
                Unsure
              </Button>
            </div>
          </div>
        )}

        {((alert.status === 'Acknowledged' && verdict) ||
          alert.status === 'Verified' ||
          alert.status === 'Actioned') && (
          <div className="grid gap-1.5">
            <div className="text-xs font-medium">
              {alert.status === 'Acknowledged'
                ? `2. Outcome (${verdict === 'True' ? 'true' : 'unsure'})`
                : 'Close with outcome'}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {wardenOutcomes.map((o) => (
                <Button
                  key={o}
                  size="sm"
                  variant="outline"
                  className="h-auto py-1.5 whitespace-normal"
                  onClick={() => {
                    if (alert.status === 'Acknowledged' && verdict)
                      actions.resolve(alert, verdict, o);
                    else actions.close(alert, o);
                    notify.success('Closed', `${alert.id} · ${o}`);
                  }}
                >
                  {o}
                </Button>
              ))}
            </div>
            {alert.status === 'Acknowledged' && (
              <button
                type="button"
                className="justify-self-start text-[11px] text-muted-foreground underline"
                onClick={() => setVerdict(null)}
              >
                Back
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Screen 3: the warden app. Inbox, on-duty toggle, accept and verify, outcome in two taps, breach history. */
export function WardenApp() {
  const { state, dispatch, now } = useDemo();
  const me = personaById('warden');
  const [tab, setTab] = useState<Tab>('inbox');
  const mine = alertsFor(me, state.alerts);
  const open = mine.filter(isOpen);
  const closed = mine.filter((a) => !isOpen(a)).slice(0, 8);
  const block = blocks.find((b) => b.college === me.alerts.college)!;
  const relief = roster.find((r) => r.college === 'KK12' && !r.onDuty)!;

  return (
    <Phone label="EzVision Warden · KK12" time={now}>
      <header className="grid gap-2 bg-sidebar px-4 pb-3 text-white">
        <div className="flex items-center gap-3">
          <UniversityLogo id="um" acronym="UM" className="size-8" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">EzVision Warden</div>
            <div className="truncate text-[11px] text-white/70">
              {me.name} · {blockLabel(block.id)}
            </div>
          </div>
          <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold">
            {open.filter((a) => a.status === 'New').length} new
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs">
          <span>
            <span className="font-semibold">
              {state.onDuty ? 'On duty' : 'Off duty'}
            </span>
            <span className="block text-white/70">
              {state.onDuty
                ? 'Alerts come to you first'
                : `Alerts go to ${relief.name} and the command centre`}
            </span>
          </span>
          <Switch
            checked={state.onDuty}
            onCheckedChange={(v) => {
              dispatch({ type: 'duty', onDuty: v });
              dispatch({
                type: 'audit',
                entry: {
                  who: me.name,
                  action: v ? 'Went on duty' : 'Went off duty',
                  target: 'KK12',
                  reason: 'Duty roster',
                },
              });
            }}
            aria-label="On duty"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'inbox' && (
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">Inbox</h2>
            {!state.onDuty && (
              <p className="rounded-lg bg-warning-soft p-3 text-xs text-warning">
                You are off duty. New alerts are routed to {relief.name}; the
                list below is for reference.
              </p>
            )}
            {open.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing to check. Quiet night so far.
              </p>
            )}
            {open.map((a) => (
              <InboxCard key={a.id} alert={a} />
            ))}
            <p className="text-[11px] text-muted-foreground">
              You see KK12 only. A person checks every alert before anything
              happens to a student; AI never issues a penalty.
            </p>
          </div>
        )}
        {tab === 'history' && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">
              {blockLabel(block.id)} breaches
            </h2>
            <div className="grid gap-1.5">
              <div className="text-xs font-medium text-muted-foreground">
                Confirmed per week
              </div>
              {hostelWeekly.map((w) => (
                <div
                  key={w.week}
                  className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-2 text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {w.week}
                  </span>
                  <span
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${(w.a / 14) * 100}%` }}
                  />
                  <span className="tabular text-right">{w.a}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-1.5">
              <div className="text-xs font-medium text-muted-foreground">
                By door, live weeks
              </div>
              {hostelByDoor
                .filter((d) => d.block === block.id)
                .map((d) => (
                  <div key={d.door} className="flex justify-between text-sm">
                    <span>{d.door}</span>
                    <span className="tabular font-medium">{d.count}</span>
                  </div>
                ))}
            </div>
            <div className="grid gap-1.5">
              <div className="text-xs font-medium text-muted-foreground">
                Recently closed
              </div>
              {closed.map((a) => (
                <div key={a.id} className="rounded-lg border p-2.5 text-xs">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-muted-foreground">
                    {a.date.slice(8)} Oct {a.time} · {a.verdict ?? a.status}
                    {a.outcome && ` · ${a.outcome}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav
        className="grid grid-cols-2 border-t bg-background"
        aria-label="Warden app"
      >
        {(
          [
            ['inbox', 'Inbox', Bell],
            ['history', 'Block history', History],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 text-[11px]',
              tab === id ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </Phone>
  );
}
