'use client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiwasLogo } from '../../_components/brand';
import { ThemeToggle } from '../../_components/theme-toggle';
import { PageHeader, Note } from '../../_components/ui-bits';
import { navigate } from '../../_lib/router';
import { WardenApp } from './warden-app';

/** The warden app inside the UM workspace. */
export function WardenShowcase() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Warden app"
        description="What the felo on duty at KK12 carries. Hostel alerts arrive here first; if nobody accepts within 5 minutes they escalate to the command centre. Accept, check, then record the outcome in two taps."
      />
      <div className="grid justify-center">
        <WardenApp />
      </div>
      <Note>
        App preview on synthetic data. In the pilot, alerts also arrive by
        WhatsApp; no real message is sent here.
      </Note>
    </div>
  );
}

/** Standalone app preview at #/app/warden. */
export function AppsWorkspace() {
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="flex items-center gap-2 border-b bg-background px-3 py-2 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft />
          Sign-in
        </Button>
        <AiwasLogo className="hidden h-4 sm:block" />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/um/console')}
          >
            Open command centre
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="grid place-items-center sm:py-8">
        <WardenApp />
      </main>
    </div>
  );
}
