export type DeviceConfig = {
  fps: number;
  width: number;
  reconnect: number;
  retention: number;
  preEvent: number;
  postEvent: number;
  logging: string;
  incidentOnly: boolean;
};
export const defaultDeviceConfig: DeviceConfig = {
  fps: 8,
  width: 1280,
  reconnect: 5,
  retention: 30,
  preEvent: 5,
  postEvent: 15,
  logging: 'Standard',
  incidentOnly: true,
};
export function deviceConfigError(v: DeviceConfig) {
  if (!Number.isInteger(v.fps) || v.fps < 1 || v.fps > 30)
    return 'Frame rate must be a whole number from 1 to 30.';
  if (![640, 1280, 1920].includes(v.width))
    return 'Choose a supported image width.';
  if (!Number.isInteger(v.reconnect) || v.reconnect < 1 || v.reconnect > 120)
    return 'Reconnect delay must be 1–120 seconds.';
  if (!Number.isInteger(v.retention) || v.retention < 1 || v.retention > 90)
    return 'Incident retention must be 1–90 days.';
  if (
    !Number.isInteger(v.preEvent) ||
    v.preEvent < 0 ||
    v.preEvent > 15 ||
    !Number.isInteger(v.postEvent) ||
    v.postEvent < 5 ||
    v.postEvent > 60
  )
    return 'Use 0–15 seconds before and 5–60 seconds after the event.';
  if (!['Standard', 'Errors only', 'Diagnostic preview'].includes(v.logging))
    return 'Choose a supported logging level.';
  if (!v.incidentOnly)
    return 'Continuous recording is outside the incident-only policy.';
  return '';
}
