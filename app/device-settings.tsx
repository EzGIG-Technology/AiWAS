'use client';
import { useState } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  Server,
  Camera as CameraIcon,
  HardDrive,
  Activity,
} from 'lucide-react';
import type { Camera } from './data';
import {
  defaultDeviceConfig,
  deviceConfigError,
  type DeviceConfig,
} from './device-settings-data';
export function DeviceSettings({
  school,
  cameras,
}: {
  school: string;
  cameras: Camera[];
}) {
  const [saved, setSaved] = useState<Record<string, DeviceConfig>>({}),
    [draft, setDraft] = useState<DeviceConfig>(defaultDeviceConfig),
    [scope, setScope] = useState(school),
    [notice, setNotice] = useState(''),
    [audit, setAudit] = useState<{ school: string; text: string }[]>([]);
  if (scope !== school) {
    setScope(school);
    setDraft(saved[school] || defaultDeviceConfig);
    setNotice('');
  }
  const field = (key: keyof DeviceConfig, value: number | string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setNotice('');
  };
  const save = () => {
    const error = deviceConfigError(draft);
    if (error) {
      setNotice(error);
      return;
    }
    setSaved((s) => ({ ...s, [school]: { ...draft } }));
    setAudit((a) => [
      {
        school,
        text: `Configuration saved · ${draft.fps} fps · ${draft.retention}-day incident retention`,
      },
      ...a,
    ]);
    setNotice('Configuration saved in this preview. No device was changed.');
  };
  const exportConfig = () => {
    const config = saved[school];
    if (!config) {
      setNotice('Save a valid configuration before exporting.');
      return;
    }
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { school, mode: 'demonstration', configuration: config },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiwas-device-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="device-workspace">
      <div className="device-summary">
        <Server size={28} />
        <div>
          <h2>School edge configuration</h2>
          <p>
            {school} · {cameras.length} registered cameras · Preview only
          </p>
        </div>
        <button className="btn" onClick={exportConfig}>
          <Download size={16} /> Export configuration
        </button>
      </div>
      <div className="device-grid">
        <section className="panel matrix-card">
          <h3>
            <CameraIcon size={18} /> Ingestion & recovery
          </h3>
          <div className="matrix-fields">
            <label>
              Target frames / second
              <input
                type="number"
                min={1}
                max={30}
                value={draft.fps}
                onChange={(e) => field('fps', Number(e.target.value))}
              />
            </label>
            <label>
              Image width
              <select
                value={draft.width}
                onChange={(e) => field('width', Number(e.target.value))}
              >
                {[640, 1280, 1920].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Reconnect delay · seconds
              <input
                type="number"
                min={1}
                max={120}
                value={draft.reconnect}
                onChange={(e) => field('reconnect', Number(e.target.value))}
              />
            </label>
            <label>
              Operational logging
              <select
                value={draft.logging}
                onChange={(e) => field('logging', e.target.value)}
              >
                <option>Standard</option>
                <option>Errors only</option>
                <option>Diagnostic preview</option>
              </select>
            </label>
          </div>
          <p>
            Connection secrets belong in the deployed device service. This form
            collects no camera passwords.
          </p>
        </section>
        <section className="panel matrix-card">
          <h3>
            <HardDrive size={18} /> Incident evidence
          </h3>
          <label>
            Retention · days
            <input
              type="number"
              min={1}
              max={90}
              value={draft.retention}
              onChange={(e) => field('retention', Number(e.target.value))}
            />
          </label>
          <div className="matrix-fields">
            <label>
              Pre-event buffer · seconds
              <input
                type="number"
                min={0}
                max={15}
                value={draft.preEvent}
                onChange={(e) => field('preEvent', Number(e.target.value))}
              />
            </label>
            <label>
              Post-event capture · seconds
              <input
                type="number"
                min={5}
                max={60}
                value={draft.postEvent}
                onChange={(e) => field('postEvent', Number(e.target.value))}
              />
            </label>
          </div>
          <div className="matrix-route">
            <HardDrive size={18} />
            <p>
              Incident-only retention. The pre-event buffer is transient;
              unflagged footage is not retained. Actual retention requires
              approval and backend enforcement.
            </p>
          </div>
        </section>
      </div>
      <div className="device-actions">
        <button className="btn primary" onClick={save}>
          <Save size={16} /> Save configuration
        </button>
        <button
          className="btn"
          onClick={() => {
            setDraft(saved[school] || defaultDeviceConfig);
            setNotice('Unsaved edits discarded.');
          }}
        >
          <RotateCcw size={16} /> Discard edits
        </button>
        <output>{notice}</output>
      </div>
      <section className="panel matrix-card">
        <h3>
          <Activity size={18} /> Configuration activity
        </h3>
        {audit.filter((a) => a.school === school).length ? (
          audit
            .filter((a) => a.school === school)
            .map((a, i) => <p key={i}>{a.text}</p>)
        ) : (
          <p>No changes recorded for this school.</p>
        )}
      </section>
    </div>
  );
}
