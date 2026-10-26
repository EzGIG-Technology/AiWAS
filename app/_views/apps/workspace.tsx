'use client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiwasLogo } from '../../_components/brand';
import { ThemeToggle } from '../../_components/theme-toggle';
import { PageHeader, Note } from '../../_components/ui-bits';
import { navigate } from '../../_lib/router';
import { MobileApp } from './mobile-app';

/** The phone app inside the UM workspace. */
export function MobileShowcase() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="EzVision Mobile"
        description="Camera alerts on a responder's phone. A detection raised in the console arrives here; verify it on the phone and the console updates."
      />
      <div className="grid justify-center">
        <MobileApp />
      </div>
      <Note>App preview on synthetic data. No real notification is sent.</Note>
    </div>
  );
}

/** Standalone app preview at #/app/mobile. */
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
            onClick={() => navigate('/um/events')}
          >
            Open console
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="grid place-items-center sm:py-8">
        <MobileApp />
      </main>
    </div>
  );
}
