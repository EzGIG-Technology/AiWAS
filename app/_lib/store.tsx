'use client';
import { createContext, useContext, useMemo, useReducer } from 'react';
import {
  DEMO_DATE,
  DEMO_TIME,
  blocks,
  type BlockHours,
  type BlockId,
} from '../_data/um';
import {
  seedAlerts,
  seedCases,
  seedRules,
  type Alert,
  type CaseFile,
  type Rule,
} from '../_data/alerts';
import { auditSeed } from '../_data/govern';
import type { PersonaId } from '../_data/personas';

/**
 * Session-memory demo state shared by every workspace, so an alert raised in
 * the command centre reaches the warden app, and the warden's verification
 * shows in the console. Nothing is persisted; a refresh restores the seed.
 */
export type AuditEntry = {
  time: string;
  who: string;
  action: string;
  target: string;
  reason: string;
};

type State = {
  persona: PersonaId | null;
  alerts: Alert[];
  cases: CaseFile[];
  rules: Rule[];
  hours: Record<BlockId, BlockHours>;
  audit: AuditEntry[];
  /** Minutes the demo clock has been moved on from 18:40. */
  clock: number;
  onDuty: boolean;
};

type Action =
  | { type: 'persona'; persona: PersonaId | null }
  | {
      type: 'alert';
      id: string;
      patch: Partial<Alert>;
      note: string;
      actor: string;
    }
  | { type: 'raise'; alert: Alert }
  | { type: 'tick'; minutes: number }
  | {
      type: 'case';
      id: string;
      patch: Partial<CaseFile>;
      note?: { who: string; text: string };
    }
  | { type: 'openCase'; caseFile: CaseFile }
  | { type: 'rule'; rule: Rule }
  | { type: 'hours'; block: BlockId; hours: BlockHours }
  | { type: 'duty'; onDuty: boolean }
  | { type: 'audit'; entry: Omit<AuditEntry, 'time'> };

export function stamp(clock: number) {
  const [h, m] = DEMO_TIME.split(':').map(Number);
  const total = h * 60 + m + clock;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const dateStamp = (now: string) => `26 Oct ${now}`;

function reducer(state: State, action: Action): State {
  const now = stamp(state.clock);
  switch (action.type) {
    case 'persona':
      return { ...state, persona: action.persona };
    case 'alert':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.id
            ? {
                ...a,
                ...action.patch,
                timeline: [
                  ...a.timeline,
                  { time: now, text: action.note, actor: action.actor },
                ],
              }
            : a,
        ),
      };
    case 'raise':
      return {
        ...state,
        alerts: [
          {
            ...action.alert,
            date: DEMO_DATE,
            time: now,
            timeline: action.alert.timeline.map((t) => ({ ...t, time: now })),
          },
          ...state.alerts,
        ],
      };
    case 'tick':
      return { ...state, clock: state.clock + action.minutes };
    case 'case':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.id
            ? {
                ...c,
                ...action.patch,
                notes: action.note
                  ? [...c.notes, { time: dateStamp(now), ...action.note }]
                  : c.notes,
              }
            : c,
        ),
      };
    case 'openCase':
      return {
        ...state,
        cases: [{ ...action.caseFile, opened: dateStamp(now) }, ...state.cases],
      };
    case 'rule':
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.id === action.rule.id ? action.rule : r,
        ),
      };
    case 'hours':
      return {
        ...state,
        hours: { ...state.hours, [action.block]: action.hours },
      };
    case 'duty':
      return { ...state, onDuty: action.onDuty };
    case 'audit':
      return {
        ...state,
        audit: [{ ...action.entry, time: now }, ...state.audit],
      };
  }
}

const initial: State = {
  persona: null,
  alerts: seedAlerts,
  cases: seedCases,
  rules: seedRules,
  hours: Object.fromEntries(blocks.map((b) => [b.id, b.hours])) as Record<
    BlockId,
    BlockHours
  >,
  audit: [...auditSeed],
  clock: 0,
  onDuty: true,
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

export function nextAlertId(alerts: Alert[]) {
  const max = Math.max(...alerts.map((a) => Number(a.id.split('-').pop())));
  return `AL-26-${max + 1}`;
}

export function nextCaseId(cases: CaseFile[]) {
  const max = Math.max(...cases.map((c) => Number(c.id.split('-').pop())));
  return `CS-26-${String(max + 1).padStart(3, '0')}`;
}
