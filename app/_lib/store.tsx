'use client';
import { createContext, useContext, useMemo, useReducer } from 'react';
import {
  cameraEvents as seedEvents,
  auditLog as seedAudit,
  DEMO_TIME,
  type CameraEvent,
  type EventStatus,
} from '../_data/um';
import type { PersonaId } from '../_data/personas';

/**
 * Session-memory demo state shared by every workspace, so a detection raised
 * in the console reaches EzVision Mobile and a verification on the phone
 * shows in the console. Nothing is persisted; a refresh restores the seed.
 */
type Audit = {
  time: string;
  who: string;
  action: string;
  target: string;
  reason: string;
};

type State = {
  persona: PersonaId | null;
  events: CameraEvent[];
  audit: Audit[];
  clock: number;
};

type Action =
  | { type: 'persona'; persona: PersonaId | null }
  | {
      type: 'status';
      id: string;
      status: EventStatus;
      actor: string;
      note?: string;
    }
  | { type: 'share'; id: string; team: string; actor: string }
  | { type: 'bookmark'; id: string }
  | { type: 'raise'; event: CameraEvent }
  | { type: 'audit'; entry: Omit<Audit, 'time'> };

/** Demo clock: starts at 18:40 and advances one minute per recorded action. */
function stamp(clock: number) {
  const [h, m] = DEMO_TIME.split(':').map(Number);
  const total = h * 60 + m + clock;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function reducer(state: State, action: Action): State {
  const now = stamp(state.clock);
  const tick = { clock: state.clock + 1 };
  const update = (id: string, fn: (e: CameraEvent) => CameraEvent) =>
    state.events.map((e) => (e.id === id ? fn(e) : e));
  switch (action.type) {
    case 'persona':
      return { ...state, persona: action.persona };
    case 'status':
      return {
        ...state,
        ...tick,
        events: update(action.id, (e) => ({
          ...e,
          status: action.status,
          timeline: [
            ...e.timeline,
            {
              time: now,
              text: action.note ?? `Marked ${action.status.toLowerCase()}`,
              actor: action.actor,
            },
          ],
        })),
      };
    case 'share':
      return {
        ...state,
        ...tick,
        events: update(action.id, (e) => ({
          ...e,
          status: 'Shared',
          sharedWith: action.team,
          bookmarked: true,
          timeline: [
            ...e.timeline,
            {
              time: now,
              text: `Clip shared with ${action.team}`,
              actor: action.actor,
            },
          ],
        })),
      };
    case 'bookmark':
      return {
        ...state,
        events: update(action.id, (e) => ({ ...e, bookmarked: !e.bookmarked })),
      };
    case 'raise':
      return {
        ...state,
        ...tick,
        events: [
          {
            ...action.event,
            time: now,
            timeline: action.event.timeline.map((t) => ({ ...t, time: now })),
          },
          ...state.events,
        ],
      };
    case 'audit':
      return {
        ...state,
        audit: [{ ...action.entry, time: now }, ...state.audit],
      };
  }
}

const initial: State = {
  persona: null,
  events: seedEvents,
  audit: [...seedAudit],
  clock: 0,
};

const Ctx = createContext<{
  state: State;
  dispatch: (a: Action) => void;
  now: string;
} | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(
    () => ({ state, dispatch, now: stamp(state.clock) }),
    [state],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDemo must be used inside DemoProvider');
  return v;
}

export function nextEventId(events: CameraEvent[]) {
  const max = Math.max(...events.map((e) => Number(e.id.split('-').pop())));
  return `EV-26-${max + 1}`;
}
