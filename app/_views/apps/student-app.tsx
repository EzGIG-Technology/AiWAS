'use client';
import { useState } from 'react';
import {
  Siren,
  Footprints,
  Timer,
  Shield,
  Bus,
  MessageSquareLock,
  Bell,
  Home,
  MapPin,
  CheckCircle2,
  X,
  Phone as PhoneIcon,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { UniversityLogo } from '../../_components/brand';
import { Phone } from './phone';
import { useDemo, nextIncidentId } from '../../_lib/store';
import { notify } from '../../_lib/notify';
import { university, cameraByScene } from '../../_data/um';

type Tab = 'home' | 'walk' | 'report' | 'alerts';

export function StudentApp() {
  const { state, dispatch, now } = useDemo();
  const [tab, setTab] = useState<Tab>('home');
  const [confirm, setConfirm] = useState(false);
  const [sosSent, setSosSent] = useState<string | null>(null);
  const [walk, setWalk] = useState<null | { to: string }>(null);
  const [dest, setDest] = useState('KK12 Kolej Raja Dr Nazrin Shah');
  const [checkedIn, setCheckedIn] = useState(false);
  const [anon, setAnon] = useState(true);

  const sendSos = () => {
    const id = nextIncidentId(state.incidents);
    dispatch({
      type: 'raise',
      incident: {
        id,
        title: 'SOS: student on Rimba Ilmu path',
        category: 'Personal safety',
        severity: 'Critical',
        status: 'New',
        source: 'Student app SOS',
        location: 'Rimba Ilmu boundary path',
        precinct: 'gates',
        camera: cameraByScene('perimeter').id,
        time: '',
        date: '2026-10-26',
        summary:
          'SOS raised from the EzSafe app. Live location shared with the SOC until this incident closes. Nearest camera opened automatically.',
        timeline: [
          {
            time: now,
            text: 'SOS pressed. Live location shared with SOC',
            actor: 'EzSafe app',
          },
        ],
        sop: [
          { step: 'Call the student back', done: false },
          { step: 'Dispatch nearest officer', done: false },
          { step: 'Officer confirms student safe', done: false },
        ],
      },
      session: {
        id: `S-${id.slice(-4)}`,
        kind: 'SOS',
        who: 'Student · KK12',
        from: 'Rimba Ilmu path',
        to: '—',
        started: '',
        status: 'Waiting for SOC',
        pos: [15, 60],
      },
    });
    setConfirm(false);
    setSosSent(id);
    notify.warning(
      'SOS sent to UM Security',
      `${id} is now in the SOC alarm queue`,
    );
  };

  const incident = sosSent
    ? state.incidents.find((i) => i.id === sosSent)
    : null;

  return (
    <Phone label="EzSafe · student & staff app" time={now}>
      <header className="flex items-center gap-2 border-b px-4 pb-3">
        <UniversityLogo id="um" acronym="UM" className="size-7 text-[9px]" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">EzSafe UM</div>
          <div className="text-[11px] text-muted-foreground">
            Location off · shared only when you ask
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Call security"
          onClick={() =>
            notify.info(`Calling ${university.hotline}`, 'Demo only')
          }
        >
          <PhoneIcon />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'home' && (
          <div className="grid gap-4">
            {incident ? (
              <Card className="bg-critical-soft ring-critical/30">
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-critical">
                    <Siren className="size-4" />
                    SOS active · {incident.id}
                  </div>
                  <div>
                    Status: <b>{incident.status}</b>
                    {incident.assigned && ` · ${incident.assigned} on the way`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your location is shared with UM Security until this closes,
                    then deleted after 90 days.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSosSent(null)}
                  >
                    Hide
                  </Button>
                </CardContent>
              </Card>
            ) : confirm ? (
              <Card className="ring-critical/40">
                <CardContent className="grid gap-3 text-center">
                  <div className="text-sm font-semibold">
                    Send SOS to UM Security?
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your name, phone and live location go to the operations
                    centre and the nearest camera opens.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setConfirm(false)}>
                      <X />
                      Cancel
                    </Button>
                    <Button
                      className="bg-critical text-white hover:bg-critical/90"
                      onClick={sendSos}
                    >
                      <Siren />
                      Send SOS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="mx-auto grid size-40 place-items-center rounded-full bg-critical text-white shadow-[0_0_0_12px_var(--critical-soft)] transition-transform active:scale-95 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid place-items-center gap-1">
                  <Siren className="size-9" />
                  <span className="text-lg font-bold tracking-wide">SOS</span>
                  <span className="text-[11px] opacity-85">Tap for help</span>
                </span>
              </button>
            )}

            {!checkedIn && (
              <Card size="sm" className="bg-warning-soft/70">
                <CardContent className="grid gap-2 text-sm">
                  <div className="font-medium">
                    Flash flood warning near Faculty of Law. Are you safe?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setCheckedIn(true);
                        notify.success('Checked in as safe');
                      }}
                    >
                      <CheckCircle2 />
                      I’m safe
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCheckedIn(true);
                        notify.warning('Help request sent');
                      }}
                    >
                      <HeartPulse />
                      Need help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                ['Friend Walk', Footprints, () => setTab('walk')],
                [
                  'Safety timer',
                  Timer,
                  () =>
                    notify.info(
                      'Safety timer set for 60 min',
                      'Security is alerted if you miss a check-in',
                    ),
                ],
                [
                  'Request escort',
                  Shield,
                  () =>
                    notify.success(
                      'Escort requested',
                      'An officer will meet you',
                    ),
                ],
                [
                  'Shuttle',
                  Bus,
                  () =>
                    notify.info('Route B: next bus 4 min', 'UM Central → KK12'),
                ],
                ['Report', MessageSquareLock, () => setTab('report')],
                [
                  'Help points',
                  MapPin,
                  () =>
                    notify.info(
                      'Nearest help point HP-11',
                      '120 m, outside Perpustakaan Utama',
                    ),
                ],
              ].map(([label, Icon, fn]) => {
                const I = Icon as typeof Siren;
                return (
                  <button
                    key={label as string}
                    type="button"
                    onClick={fn as () => void}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl bg-muted/70 p-2 text-center text-xs font-medium hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <I className="size-5 text-primary" />
                    {label as string}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'walk' && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Friend Walk</h2>
            {walk ? (
              <Card className="bg-accent">
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <Footprints className="size-4 text-primary" />
                    Walking to {walk.to}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background">
                    <div className="h-full w-2/5 rounded-full bg-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Shared with 1 friend and UM Security. ETA 7 min. If you stop
                    moving for 3 minutes we will check on you.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWalk(null);
                        notify.success(
                          'Arrived safely',
                          'Location history for this walk deleted',
                        );
                      }}
                    >
                      I’ve arrived
                    </Button>
                    <Button
                      className="bg-critical text-white hover:bg-critical/90"
                      onClick={() => {
                        setTab('home');
                        setConfirm(true);
                      }}
                    >
                      <Siren />
                      SOS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                <Label htmlFor="dest">Where are you going?</Label>
                <NativeSelect
                  id="dest"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full"
                >
                  {[
                    'KK12 Kolej Raja Dr Nazrin Shah',
                    'KK8 Kolej Kinabalu',
                    'UM Central shuttle hub',
                    'Universiti LRT',
                  ].map((d) => (
                    <NativeSelectOption key={d}>{d}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="text-xs text-muted-foreground">
                  Your location is shared only during the walk and deleted when
                  it ends.
                </div>
                <Button
                  onClick={() => {
                    setWalk({ to: dest });
                    notify.info('Friend Walk started');
                  }}
                >
                  <Footprints />
                  Start walk
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'report' && (
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">Report a concern</h2>
            <Label htmlFor="cat">What happened?</Label>
            <NativeSelect id="cat" className="w-full">
              {[
                'Harassment',
                'Bullying',
                'Theft',
                'Suspicious activity',
                'Unsafe lighting or path',
                'Wildlife',
                'Something else',
              ].map((c) => (
                <NativeSelectOption key={c}>{c}</NativeSelectOption>
              ))}
            </NativeSelect>
            <Label htmlFor="desc">Details</Label>
            <Textarea
              id="desc"
              rows={4}
              placeholder="Where, when and what you saw"
            />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="anon">Report anonymously</Label>
              <Switch id="anon" checked={anon} onCheckedChange={setAnon} />
            </div>
            <div className="text-xs text-muted-foreground">
              Harassment and bullying reports go to a confidential HEP case
              officer, not the college. You can chat with them without revealing
              who you are.
            </div>
            <Button
              onClick={() => {
                notify.success(
                  'Report submitted',
                  anon ? 'Anonymous · reference R-5521' : 'Reference R-5521',
                );
                setTab('home');
              }}
            >
              Submit report
            </Button>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="grid gap-2">
            <h2 className="mb-1 text-lg font-semibold">Alerts</h2>
            {state.broadcasts.map((b, n) => (
              <Card key={n} size="sm">
                <CardContent className="text-sm">
                  <div className="font-medium">{b.template}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.time} · {b.audience}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <nav className="grid shrink-0 grid-cols-4 border-t bg-card pb-2">
        {(
          [
            ['home', 'Home', Home],
            ['walk', 'Walk', Footprints],
            ['report', 'Report', MessageSquareLock],
            ['alerts', 'Alerts', Bell],
          ] as const
        ).map(([id, label, I]) => (
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
            <I className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </Phone>
  );
}
