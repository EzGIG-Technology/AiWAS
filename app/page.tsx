'use client';
import { Toaster } from '@/components/ui/toast';
import { DemoProvider, useDemo } from './_lib/store';
import { useRoute } from './_lib/router';
import { personaById, defaultPersona, type Workspace } from './_data/personas';
import { SignIn } from './_views/sign-in';
import { UmWorkspace } from './_views/um/workspace';
import { KptWorkspace } from './_views/kpt/workspace';
import { AppsWorkspace } from './_views/apps/workspace';

/**
 * EzVision Campus: one client application with three workspaces.
 *
 *   #/            demo sign-in
 *   #/um/<view>   Universiti Malaya: command centre, six modules, platform
 *   #/kpt/<view>  KPT: smart-campus audit and pilot aggregates only
 *   #/app/warden  EzVision Warden, the felo's phone app
 */
export default function Home() {
  return (
    <DemoProvider>
      <Toaster>
        <Router />
      </Toaster>
    </DemoProvider>
  );
}

function Router() {
  const { parts } = useRoute();
  const { state } = useDemo();
  const ws = parts[0] as Workspace | undefined;

  if (ws !== 'um' && ws !== 'kpt' && ws !== 'app') return <SignIn />;

  // A deep link without a sign-in previews the workspace's default role.
  const chosen = state.persona ? personaById(state.persona) : null;
  const persona =
    chosen && chosen.workspace === ws
      ? chosen
      : personaById(defaultPersona[ws]);

  if (ws === 'um')
    return <UmWorkspace persona={persona} view={parts[1]} sub={parts[2]} />;
  if (ws === 'kpt')
    return <KptWorkspace persona={persona} view={parts[1]} sub={parts[2]} />;
  return <AppsWorkspace />;
}
