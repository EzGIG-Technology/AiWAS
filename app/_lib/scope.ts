import { blockById } from '../_data/um';
import type { Alert } from '../_data/alerts';
import type { Persona } from '../_data/personas';

/**
 * The live alerts a role receives. A warden sees one college; a counsellor
 * sees wellbeing and at-height alerts only; roles without live alerts
 * (Pengetua, HEP, DPO, system admin, KPT) get none.
 */
export function alertsFor(p: Persona, alerts: Alert[]) {
  const s = p.alerts;
  if (s.modules === 'none') return [];
  const mods = s.modules;
  return alerts.filter(
    (a) =>
      (mods === 'all' || mods.includes(a.module)) &&
      (!s.college || (!!a.block && blockById(a.block).college === s.college)) &&
      (!s.wellbeingOnly ||
        a.detector === 'wellbeing' ||
        a.detector === 'at_height'),
  );
}

/** Roles that may change rules (thresholds, lines, routes). */
export const canEditRules = (p: Persona) => p.id === 'director';
/** Roles that may change block hours: the Pengetua for their college, and the director. */
export const canEditHours = (p: Persona) =>
  p.id === 'director' || p.id === 'pengetua';
/** Only the security director approves evidence exports and unblurs faces. */
export const canExport = (p: Persona) => p.id === 'director';
