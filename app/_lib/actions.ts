'use client';
import { cameraById, blockLabel } from '../_data/um';
import { routesToWarden, type Alert, type Verdict } from '../_data/alerts';
import type { Persona } from '../_data/personas';
import { useDemo, nextCaseId } from './store';
import { notify } from './notify';

/**
 * The alert lifecycle as actions: acknowledge, verify, record the action,
 * close. Shared by the console, the alert sheet and the warden app so every
 * surface moves an alert the same way and writes the same timeline.
 */
export function useAlertActions(persona: Persona) {
  const { state, dispatch } = useDemo();
  const actor = persona.name;

  const tuneFalseAlarm = (a: Alert) => {
    const rule = state.rules.find((r) => r.id === a.rule);
    if (rule)
      dispatch({ type: 'rule', rule: { ...rule, false7d: rule.false7d + 1 } });
  };

  const openCase = (
    a: Alert,
    status: 'Open' | 'With HEP' | 'Handed to PDRM',
  ) => {
    if (a.caseId) {
      dispatch({
        type: 'case',
        id: a.caseId,
        patch: { status },
        note: { who: actor, text: `Status set to ${status} from ${a.id}.` },
      });
      return a.caseId;
    }
    const id = nextCaseId(state.cases);
    dispatch({
      type: 'openCase',
      caseFile: {
        id,
        title: a.title,
        module: a.module,
        block: a.block,
        status,
        owner: actor,
        opened: '',
        alerts: [a.id],
        notes: [{ time: `26 Oct`, who: actor, text: `Opened from ${a.id}.` }],
        exports: [],
      },
    });
    dispatch({
      type: 'alert',
      id: a.id,
      patch: { caseId: id },
      note: `Linked to case ${id}`,
      actor,
    });
    return id;
  };

  const verify = (a: Alert, verdict: Verdict) => {
    if (verdict === 'False alarm') {
      dispatch({
        type: 'alert',
        id: a.id,
        patch: {
          status: 'Closed',
          verdict,
          outcome: 'False alarm. Sent to tuning for this camera.',
        },
        note: 'Verified: false alarm. Closed and fed back to tuning.',
        actor,
      });
      tuneFalseAlarm(a);
      notify.info(
        'False alarm recorded',
        'The rule’s threshold for this camera will be reviewed.',
      );
      return;
    }
    dispatch({
      type: 'alert',
      id: a.id,
      patch: { status: 'Verified', verdict, assignee: a.assignee ?? actor },
      note: verdict === 'True' ? 'Verified true' : 'Verified: unsure',
      actor,
    });
  };

  return {
    acknowledge(a: Alert) {
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Acknowledged', assignee: actor },
        note: routesToWarden(a)
          ? 'Accepted; escalation timer stopped'
          : 'Acknowledged',
        actor,
      });
    },
    verify,
    act(a: Alert, action: string) {
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Actioned', action },
        note: action,
        actor,
      });
      if (action === 'HEP referral') {
        const id = openCase(a, 'With HEP');
        notify.success(
          'Referred to HEP',
          `${id} is now in HEP’s confirmed-cases list.`,
        );
      } else if (action === 'Case opened' || action === 'PDRM informed') {
        const id = openCase(
          a,
          action === 'PDRM informed' ? 'Handed to PDRM' : 'Open',
        );
        notify.success('Case opened', id);
      } else {
        notify.success('Action recorded', action);
      }
    },
    close(a: Alert, outcome: string) {
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Closed', outcome },
        note: `Closed: ${outcome}`,
        actor,
      });
    },
    /** The warden app's two taps: a verdict, then an outcome. */
    resolve(a: Alert, verdict: Verdict, outcome: string) {
      if (verdict === 'False alarm') return verify(a, verdict);
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Verified', verdict },
        note: verdict === 'True' ? 'Verified true on site' : 'Verified: unsure',
        actor,
      });
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Actioned', action: outcome },
        note: outcome,
        actor,
      });
      if (outcome === 'HEP referral') openCase(a, 'With HEP');
      dispatch({
        type: 'alert',
        id: a.id,
        patch: { status: 'Closed', outcome },
        note: 'Closed with outcome',
        actor,
      });
    },
    openCase(a: Alert) {
      const id = openCase(a, 'Open');
      notify.success('Case opened', `${id} · ${a.title}`);
      return id;
    },
    logView(a: Alert) {
      const where = a.camera
        ? cameraById(a.camera)?.id
        : a.block
          ? blockLabel(a.block)
          : a.sensor;
      dispatch({
        type: 'audit',
        entry: {
          who: actor,
          action: 'Viewed alert clip',
          target: where ?? a.id,
          reason: a.id,
        },
      });
    },
  };
}
