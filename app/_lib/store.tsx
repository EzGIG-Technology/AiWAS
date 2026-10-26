'use client';
import { createContext, useContext, useMemo, useReducer } from 'react';
import {
  incidents as seedIncidents,
  appSessions as seedSessions,
  broadcasts as seedBroadcasts,
  auditLog as seedAudit,
  DEMO_TIME,
  type Incident,
  type IncidentStatus,
} from '../_data/um';
import type { PersonaId } from '../_data/personas';

/**
 * Session-memory demo state shared by every workspace, so an SOS raised in
 * the student app appears in the UM operations console and the patrol app.
 * Nothing is persisted or sent anywhere; a refresh restores the seed data.
 */
type Audit = {
  time: string;
  who: string;
  action: string;
  target: string;
  reason: string;
};
type Session = (typeof seedSessions)[number];
type Broadcast = {
  time: string;
  template: string;
  audience: string;
  reach: number;
  read: number;
};

type State = {
  persona: PersonaId | null;
  incidents: Incident[];
  sessions: Session[];
  broadcasts: Broadcast[];
  audit: Audit[];
  clock: number;
};

type Action =
  | { type: 'persona'; persona: PersonaId | null }
  | {
      type: 'status';
      id: string;
      status: IncidentStatus;
      actor: string;
      note?: string;
    }
  | { type: 'assign'; id: string; officer: string; actor: string }
  | { type: 'sop'; id: string; index: number }
  | { type: 'raise'; incident: Incident; session?: Session }
  | { type: 'broadcast'; broadcast: Broadcast }
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
  switch (action.type) {
    case 'persona':
      return { ...state, persona: action.persona };
    case 'status':
      return {
        ...state,
        ...tick,
        incidents: state.incidents.map((i) =>
          i.id === action.id
            ? {
                ...i,
                status: action.status,
                timeline: [
                  ...i.timeline,
                  {
                    time: now,
                    text:
                      action.note ?? `Marked ${action.status.toLowerCase()}`,
                    actor: action.actor,
                  },
                ],
              }
            : i,
        ),
      };
    case 'assign':
      return {
        ...state,
        ...tick,
        incidents: state.incidents.map((i) =>
          i.id === action.id
            ? {
                ...i,
                assigned: action.officer,
                status:
                  i.status === 'New' || i.status === 'Acknowledged'
                    ? 'Dispatched'
                    : i.status,
                timeline: [
                  ...i.timeline,
                  {
                    time: now,
                    text: `${action.officer} dispatched`,
                    actor: action.actor,
                  },
                ],
              }
            : i,
        ),
      };
    case 'sop':
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.id
            ? {
                ...i,
                sop: i.sop.map((s, n) =>
                  n === action.index ? { ...s, done: !s.done } : s,
                ),
              }
            : i,
        ),
      };
    case 'raise':
      return {
        ...state,
        ...tick,
        incidents: [{ ...action.incident, time: now }, ...state.incidents],
        sessions: action.session
          ? [{ ...action.session, started: now }, ...state.sessions]
          : state.sessions,
      };
    case 'broadcast':
      return {
        ...state,
        ...tick,
        broadcasts: [{ ...action.broadcast, time: now }, ...state.broadcasts],
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
  incidents: seedIncidents,
  sessions: [...seedSessions],
  broadcasts: [...seedBroadcasts],
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

export function nextIncidentId(incidents: Incident[]) {
  const max = Math.max(...incidents.map((i) => Number(i.id.split('-').pop())));
  return `UM-26-${max + 1}`;
}
