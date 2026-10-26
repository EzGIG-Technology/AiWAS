'use client';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Ban,
  Share2,
  Archive,
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
import { CameraFeed } from '../../_components/camera-feed';
import {
  SeverityBadge,
  EventStatusBadge,
  Note,
  Meter,
} from '../../_components/ui-bits';
import { cameraById, analytics, precincts } from '../../_data/um';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

const teams = [
  'Security desk',
  'UMMC security',
  'Estates',
  'Contractor safety officer',
];

/** One AI detection: the clip, what the analytic saw, and the operator's decision. */
export function EventSheet({
  id,
  persona,
  onClose,
}: {
  id: string | null;
  persona: Persona;
  onClose: () => void;
}) {
  const { state, dispatch } = useDemo();
  const event = state.events.find((e) => e.id === id);
  const camera = event ? cameraById(event.camera) : undefined;
  const actor = persona.name;
  const canAct =
    persona.id === 'director' ||
    persona.id === 'operator' ||
    persona.id === 'mobile';

  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
        {event && camera && (
          <>
            <SheetHeader className="gap-2 border-b p-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {event.id}
                </span>
                <SeverityBadge severity={event.severity} />
                <EventStatusBadge status={event.status} />
              </div>
              <SheetTitle className="text-lg">{event.title}</SheetTitle>
              <SheetDescription>
                {camera.id} · {camera.name} · {event.time} ·{' '}
                {precincts[camera.precinct].name}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              {persona.video ? (
                <CameraFeed camera={camera} />
              ) : (
                <Note>Video is not available to your role.</Note>
              )}
              <p className="text-sm">{event.summary}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Analytic</dt>
                <dd>{analytics[event.analytic].name}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{analytics[event.analytic].status}</dd>
                <dt className="text-muted-foreground">Model confidence</dt>
                <dd className="grid gap-1">
                  <span className="tabular">
                    {Math.round(event.confidence * 100)}% · threshold{' '}
                    {Math.round(analytics[event.analytic].threshold * 100)}%
                  </span>
                  <Meter
                    value={event.confidence * 100}
                    t={event.confidence >= 0.85 ? 'success' : 'warning'}
                  />
                </dd>
                <dt className="text-muted-foreground">Cannot establish</dt>
                <dd className="text-muted-foreground">
                  {analytics[event.analytic].cannot}
                </dd>
                {event.sharedWith && (
                  <>
                    <dt className="text-muted-foreground">Shared with</dt>
                    <dd>{event.sharedWith}</dd>
                  </>
                )}
              </dl>

              {canAct && (
                <div className="grid gap-2 rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Operator decision
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.status === 'New' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            dispatch({
                              type: 'status',
                              id: event.id,
                              status: 'Verified',
                              actor,
                              note: 'Verified on video',
                            });
                            notify.success('Verified', event.id);
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
                              id: event.id,
                              status: 'False alarm',
                              actor,
                              note: 'False alarm; fed back to tuning',
                            });
                            notify.info(
                              'Marked false alarm',
                              'Counted against the analytic’s precision',
                            );
                          }}
                        >
                          <Ban />
                          False alarm
                        </Button>
                      </>
                    )}
                    {event.status === 'Verified' &&
                      teams.map((team) => (
                        <Button
                          key={team}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            dispatch({
                              type: 'share',
                              id: event.id,
                              team,
                              actor,
                            });
                            notify.success(
                              `Clip shared with ${team}`,
                              'Watermarked; access is logged',
                            );
                          }}
                        >
                          <Share2 />
                          {team}
                        </Button>
                      ))}
                    {(event.status === 'Verified' ||
                      event.status === 'Shared') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          dispatch({
                            type: 'status',
                            id: event.id,
                            status: 'Closed',
                            actor,
                          });
                          notify.success('Closed', event.id);
                        }}
                      >
                        <Archive />
                        Close
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        dispatch({ type: 'bookmark', id: event.id })
                      }
                    >
                      {event.bookmarked ? <BookmarkCheck /> : <Bookmark />}
                      {event.bookmarked ? 'Clip kept' : 'Keep clip'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kept clips are retained for a year instead of 30 days. What
                    happens next is decided by the team the clip is shared with.
                  </p>
                </div>
              )}

              <Separator />
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Timeline
                </div>
                <ol className="relative grid gap-3 border-l pl-4">
                  {[...event.timeline].reverse().map((t, n) => (
                    <li key={n} className="relative text-sm">
                      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary ring-4 ring-background" />
                      <div>{t.text}</div>
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
