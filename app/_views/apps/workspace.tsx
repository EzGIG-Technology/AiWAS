'use client';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AiwasLogo } from '../../_components/brand';
import { ThemeToggle } from '../../_components/theme-toggle';
import { PageHeader, Note } from '../../_components/ui-bits';
import { navigate } from '../../_lib/router';
import { StudentApp } from './student-app';
import { PatrolApp } from './patrol-app';

/** Both apps side by side, inside the UM workspace. */
export function AppsShowcase() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="EzSafe & EzPatrol"
        description="The two phone apps connected to this console. Raise an SOS in EzSafe and it appears in the alarm queue; dispatch it here and it arrives in EzPatrol."
      />
      <div className="grid justify-center gap-8 xl:grid-cols-2">
        <StudentApp />
        <PatrolApp />
      </div>
      <Note>
        App previews run on synthetic data. No real location, phone call or
        notification is sent.
      </Note>
    </div>
  );
}

/** Standalone app preview at #/app/student or #/app/patrol. */
export function AppsWorkspace({ app }: { app?: string }) {
  const which = app === 'patrol' ? 'patrol' : 'student';
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="flex items-center gap-2 border-b bg-background px-3 py-2 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft />
          Sign-in
        </Button>
        <AiwasLogo className="hidden h-4 sm:block" />
        <div className="ml-auto flex items-center gap-1">
          {(['student', 'patrol'] as const).map((a) => (
            <Button
              key={a}
              size="sm"
              variant={which === a ? 'default' : 'ghost'}
              onClick={() => navigate(`/app/${a}`)}
              className={cn(which !== a && 'text-muted-foreground')}
            >
              <Smartphone />
              {a === 'student' ? 'EzSafe' : 'EzPatrol'}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/um/incidents')}
          >
            Open SOC console
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="grid place-items-center sm:py-8">
        {which === 'student' ? <StudentApp /> : <PatrolApp />}
      </main>
    </div>
  );
}
