'use client';
import { useState } from 'react';
import {
  Bell,
  Video,
  Activity,
  CheckCircle2,
  Ban,
  Share2,
  Bookmark,
  BookmarkCheck,
  VideoOff,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CameraFeed } from '../../_components/camera-feed';
import {
  SeverityBadge,
  EventStatusBadge,
  Pill,
} from '../../_components/ui-bits';
import { UniversityLogo } from '../../_components/brand';
import { Phone } from './phone';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';
import {
  cameras,
  cameraById,
  cameraByScene,
  analytics,
  edgeAppliances,
  isOpenEvent,
  type Camera,
} from '../../_data/um';

const ME = 'Kpl. Hafiz Rahman';
type Tab = 'alerts' | 'cameras' | 'health';
const favourites = [
  'gate',
  'perimeter',
  'transit-concourse',
  'hostel',
  'security-queue',
  'retail-carpark',
] as const;

/** EzVision Mobile: camera alerts on a responder's phone. */
export function MobileApp() {
  const { state, dispatch, now } = useDemo();
  const [tab, setTab] = useState<Tab>('alerts');
  const [viewing, setViewing] = useState<Camera | null>(null);
  const alerts = state.events.filter(isOpenEvent);
  const unhealthy = cameras.filter((c) => c.status !== 'online');

  return (
    <Phone label="EzVision Mobile · camera alerts" time={now}>
      <header className="flex items-center gap-3 bg-sidebar px-4 pb-3 text-white">
        <UniversityLogo id="um" acronym="UM" className="size-8" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">EzVision Mobile</div>
          <div className="text-[11px] text-white/70">
            {ME} · Polis Bantuan UM
          </div>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold">
          {alerts.filter((a) => a.status === 'New').length} new
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'alerts' && (
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">Alerts</h2>
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No open detections.
              </p>
            )}
            {alerts.map((e) => {
              const cam = cameraById(e.camera)!;
              return (
                <Card
                  key={e.id}
                  size="sm"
                  className={cn(
                    e.status === 'New' &&
                      e.severity !== 'Low' &&
                      'ring-warning/50',
                  )}
                >
                  <CardContent className="grid gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SeverityBadge severity={e.severity} />
                      <EventStatusBadge status={e.status} />
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                        {e.time}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">{e.title}</div>
                    <CameraFeed camera={cam} compact />
                    <div className="text-xs text-muted-foreground">
                      {cam.name} · {analytics[e.analytic].name} ·{' '}
                      {Math.round(e.confidence * 100)}%
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {e.status === 'New' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              dispatch({
                                type: 'status',
                                id: e.id,
                                status: 'Verified',
                                actor: ME,
                                note: 'Verified on EzVision Mobile',
                              });
                              notify.success('Verified', e.id);
                            }}
                          >
                            <CheckCircle2 />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              dispatch({
                                type: 'status',
                                id: e.id,
                                status: 'False alarm',
                                actor: ME,
                                note: 'False alarm (mobile)',
                              });
                              notify.info('False alarm', e.id);
                            }}
                          >
                            <Ban />
                            False
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="col-span-2"
                          variant="outline"
                          onClick={() => {
                            dispatch({
                              type: 'share',
                              id: e.id,
                              team: 'Security desk',
                              actor: ME,
                            });
                            notify.success('Shared with security desk', e.id);
                          }}
                        >
                          <Share2 />
                          Share with desk
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={e.bookmarked ? 'Clip kept' : 'Keep clip'}
                        onClick={() => dispatch({ type: 'bookmark', id: e.id })}
                      >
                        {e.bookmarked ? <BookmarkCheck /> : <Bookmark />}
                        Keep
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {tab === 'cameras' &&
          (viewing ? (
            <div className="grid gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => setViewing(null)}
              >
                <ChevronLeft />
                Cameras
              </Button>
              <CameraFeed camera={viewing} />
              <div className="text-sm font-semibold">{viewing.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {viewing.analytics.map((a) => (
                  <Pill key={a} t="brand">
                    {analytics[a].name}
                  </Pill>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <h2 className="mb-1 text-lg font-semibold">Favourite cameras</h2>
              {favourites.map((s) => {
                const c = cameraByScene(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setViewing(c)}
                    className="grid grid-cols-[6rem_1fr] items-center gap-3 rounded-lg border p-2 text-left hover:bg-muted"
                  >
                    <CameraFeed camera={c} compact live={false} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {c.id}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

        {tab === 'health' && (
          <div className="grid gap-2">
            <h2 className="mb-1 text-lg font-semibold">Camera health</h2>
            {unhealthy.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-lg border p-3 text-sm"
              >
                <VideoOff
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    c.status === 'offline' ? 'text-critical' : 'text-warning',
                  )}
                />
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.id} ·{' '}
                    {c.status === 'offline'
                      ? 'Offline: this area is not being watched'
                      : 'Degraded image'}
                  </div>
                </div>
              </div>
            ))}
            {edgeAppliances
              .filter((e) => e.status !== 'Healthy')
              .map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <Activity className="mt-0.5 size-4 shrink-0 text-warning" />
                  <div>
                    <div className="font-medium">{e.id} running warm</div>
                    <div className="text-xs text-muted-foreground">
                      {e.site} · {e.temp} °C
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <nav className="grid shrink-0 grid-cols-3 border-t bg-card pb-2">
        {(
          [
            [
              'alerts',
              'Alerts',
              Bell,
              alerts.filter((a) => a.status === 'New').length,
            ],
            ['cameras', 'Cameras', Video, 0],
            ['health', 'Health', Activity, unhealthy.length],
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
              <span className="absolute top-1 right-[34%] grid size-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </Phone>
  );
}
