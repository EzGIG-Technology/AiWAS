'use client';
import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  EyeOff,
  MapPinOff,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AiwasLogo,
  UniversityLockup,
  UniversityLogo,
} from '../_components/brand';
import { ThemeToggle } from '../_components/theme-toggle';
import { CameraFeed } from '../_components/camera-feed';
import { initials } from '../_components/shell';
import { personas, type Persona, type Workspace } from '../_data/personas';
import { cameraByScene } from '../_data/um';
import { navigate } from '../_lib/router';
import { useDemo } from '../_lib/store';

const mosaic = [
  'hall',
  'courtyard',
  'gate',
  'transit-concourse',
  'hostel',
  'hosp-entrance',
] as const;

const tabs: {
  id: Workspace;
  label: string;
  icon: typeof Building2;
  org: { id: string; acronym: string; name: string };
  sso: string;
}[] = [
  {
    id: 'um',
    label: 'Universiti Malaya',
    icon: Building2,
    org: { id: 'um', acronym: 'UM', name: 'Universiti Malaya' },
    sso: 'Continue with UM single sign-on',
  },
  {
    id: 'kpt',
    label: 'KPT',
    icon: Landmark,
    org: { id: 'kpt', acronym: 'KPT', name: 'Kementerian Pendidikan Tinggi' },
    sso: 'Continue with government single sign-on',
  },
  {
    id: 'app',
    label: 'Mobile apps',
    icon: Smartphone,
    org: { id: 'um', acronym: 'UM', name: 'EzSafe & EzPatrol' },
    sso: 'Open app preview',
  },
];

export function SignIn() {
  const { dispatch } = useDemo();
  const [tab, setTab] = useState<Workspace>('um');
  const [choice, setChoice] = useState<Record<Workspace, Persona['id']>>({
    um: 'chief',
    kpt: 'kpt',
    app: 'student',
  });

  const go = (ws: Workspace) => {
    const p = personas.find((x) => x.id === choice[ws])!;
    dispatch({ type: 'persona', persona: p.id });
    navigate(p.landing);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-sidebar p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,oklch(0.477_0.175_354.8/55%),transparent)]" />
        <div className="relative flex items-center gap-3">
          <AiwasLogo className="h-7 text-white" />
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold tracking-widest uppercase">
            EzVision
          </span>
        </div>
        <div className="relative mt-10 max-w-lg">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Campus safety for universities, from the operations room to the
            ministry.
          </h1>
          <p className="mt-4 text-white/75">
            One platform for a university’s security operations centre, its
            residential colleges and student affairs, its students’ and
            officers’ phones, and the Ministry of Higher Education’s national
            oversight.
          </p>
        </div>
        <div className="relative mt-8 grid grid-cols-3 gap-2">
          {mosaic.map((s) => (
            <CameraFeed
              key={s}
              camera={cameraByScene(s)}
              compact
              className="ring-white/10"
            />
          ))}
        </div>
        <ul className="relative mt-auto grid gap-3 pt-8 text-sm text-white/80">
          <li className="flex gap-3">
            <EyeOff className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
            No facial recognition. Analytics describe events, never identities.
          </li>
          <li className="flex gap-3">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
            No protest, assembly or speech monitoring, in any report or search.
          </li>
          <li className="flex gap-3">
            <MapPinOff className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
            Students share location only when they start an SOS, walk or
            check-in.
          </li>
        </ul>
      </section>

      {/* Sign-in panel */}
      <section className="flex flex-col p-4 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:invisible">
            <AiwasLogo className="h-5" />
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              EzVision
            </span>
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose who you are signing in as. Each role opens its own workspace.
          </p>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Workspace)}
            className="mt-6"
          >
            <TabsList className="w-full">
              {tabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="flex-1">
                  <t.icon />
                  <span className="truncate">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-3">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-3">
                    {t.id === 'um' ? (
                      <div className="grid gap-2">
                        <UniversityLockup id="um" name="Universiti Malaya" />
                        <CardDescription>
                          Security operations, residential colleges, student
                          affairs and privacy
                        </CardDescription>
                      </div>
                    ) : (
                      <>
                        <UniversityLogo
                          id={t.org.id}
                          acronym={t.org.acronym}
                          className="size-10"
                        />
                        <div className="min-w-0">
                          <CardTitle>{t.org.name}</CardTitle>
                          <CardDescription>
                            {t.id === 'kpt'
                              ? 'National oversight: aggregate trends, compliance and escalations'
                              : 'Phone apps for students, staff and patrol officers'}
                          </CardDescription>
                        </div>
                      </>
                    )}
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <RadioGroup
                      aria-label="Role"
                      value={choice[t.id]}
                      onValueChange={(v) =>
                        setChoice((c) => ({ ...c, [t.id]: v as Persona['id'] }))
                      }
                    >
                      {personas
                        .filter((p) => p.workspace === t.id)
                        .map((p) => {
                          const on = choice[t.id] === p.id;
                          return (
                            <label
                              key={p.id}
                              className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                                on
                                  ? 'border-primary bg-accent'
                                  : 'hover:bg-muted',
                              )}
                            >
                              <RadioGroupItem
                                value={p.id}
                                className="sr-only"
                              />
                              <Avatar className="size-9">
                                <AvatarFallback
                                  className={cn(
                                    'text-xs font-semibold',
                                    on && 'bg-primary text-primary-foreground',
                                  )}
                                >
                                  {p.workspace === 'app' ? (
                                    <Smartphone className="size-4" />
                                  ) : (
                                    initials(p.name)
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                  <span className="text-sm font-medium">
                                    {p.title}
                                  </span>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {p.name}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {p.summary}
                                </div>
                              </div>
                              {!p.video && (
                                <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                                  No video
                                </span>
                              )}
                            </label>
                          );
                        })}
                    </RadioGroup>
                    <Button
                      size="lg"
                      className="mt-2 h-10"
                      onClick={() => go(t.id)}
                    >
                      <LockKeyhole />
                      {t.sso}
                      <ArrowRight className="ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Demonstration sign-in. No credentials are collected or checked, and
            every person, incident and figure is fictional. Footage is
            synthetic.
          </p>
        </div>
        <footer className="text-center text-xs text-muted-foreground">
          EzVision Campus Safety · powered by AiWAS · EzGIG Technology
        </footer>
      </section>
    </div>
  );
}
