'use client';
import { useState } from 'react';
import { Cpu, HardDrive, MapPin, Server, Thermometer, Zap } from 'lucide-react';
import { getIndustry } from './industries';

// Edge appliances. One appliance sits at a site, ingests its cameras, runs
// inference locally and reports events upstream. The estate view is where a
// school group sees which sites are actually processing and which are dark.

type Service = { name: string; state: 'Running' | 'Stopped' | 'Degraded' };

export type Appliance = {
  id: string;
  site: string;
  location: string;
  coordinates: string;
  timezone: string;
  online: boolean;
  uptime: string;
  host: string;
  cpuModel: string;
  cpu: number;
  memUsed: number;
  memTotal: number;
  diskUsed: number;
  diskTotal: number;
  gpu: string;
  gpuUtil: number;
  vramUsed: number;
  vramTotal: number;
  temperature: number;
  cameras: number;
  services: Service[];
};

const SERVICES = (up: boolean): Service[] => [
  { name: 'AI Engine', state: up ? 'Running' : 'Stopped' },
  { name: 'AI API', state: up ? 'Running' : 'Stopped' },
  { name: 'Device UI', state: up ? 'Running' : 'Stopped' },
  { name: 'Redis', state: up ? 'Running' : 'Stopped' },
];

function applianceFor(
  site: string,
  i: number,
  zones: number,
  timezone: string,
): Appliance {
  const online = i !== 1;
  return {
    id: `AIWAS-EDGE-${String(i + 1).padStart(2, '0')}`,
    site,
    location: site,
    coordinates: `${(2.7 + i * 0.35).toFixed(4)}, ${(101.9 + i * 0.28).toFixed(4)}`,
    timezone,
    online,
    uptime: online ? `${1 + i} days, ${3 + i} hours` : '—',
    host: `aiwas-edge-${i + 1}`,
    cpuModel: 'AMD Ryzen 7 9700X 8-Core Processor (16 cores)',
    cpu: online ? 5 + i * 6 : 0,
    memUsed: online ? 4.1 + i * 2.2 : 0,
    memTotal: 30.5,
    diskUsed: online ? 103 + i * 46 : 0,
    diskTotal: 937,
    gpu: 'NVIDIA GeForce RTX 5070',
    gpuUtil: online ? 12 + i * 9 : 0,
    vramUsed: online ? 2.1 + i * 0.9 : 0,
    vramTotal: 12,
    temperature: online ? 30 + i * 4 : 0,
    cameras: zones,
    services: SERVICES(online),
  };
}

const pct = (used: number, total: number) =>
  total > 0 ? Math.round((used / total) * 100) : 0;

function Ring({
  value,
  label,
  detail,
  tone = 'blue',
}: {
  value: number;
  label: string;
  detail?: string;
  tone?: string;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="fleet-ring">
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ring-track" />
        <circle
          cx="32"
          cy="32"
          r={r}
          className={'ring-value ' + tone}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <strong>{value}%</strong>
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function DeviceFleet({
  industryId,
  sites,
}: {
  industryId: string;
  sites: string[];
}) {
  const industry = getIndustry(industryId);
  const appliances = sites.map((s, i) =>
    applianceFor(s, i, industry.zones.length, 'Asia/Kuala_Lumpur'),
  );
  const [selected, setSelected] = useState(appliances[0]?.id ?? '');
  const device = appliances.find((a) => a.id === selected) ?? appliances[0];
  const online = appliances.filter((a) => a.online).length;

  return (
    <div className="fleet">
      <section className="panel">
        <h2>
          <Server size={17} /> Edge appliances
        </h2>
        <p className="muted">
          One appliance per {industry.lexicon.site}. It ingests local cameras,
          runs inference on site and reports events upstream. If an appliance is
          down, that {industry.lexicon.site} is not being analysed at all —
          which is a coverage gap, not a quiet day.
        </p>
        <div className="concept-stats">
          <div>
            <strong>{appliances.length}</strong>
            <span>appliances</span>
          </div>
          <div>
            <strong>{online}</strong>
            <span>online</span>
          </div>
          <div>
            <strong>{appliances.length - online}</strong>
            <span>not reporting</span>
          </div>
          <div>
            <strong>
              {appliances.reduce((n, a) => n + (a.online ? a.cameras : 0), 0)}
            </strong>
            <span>cameras analysed</span>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Appliance</th>
                <th>Location</th>
                <th>Status</th>
                <th>Coordinates</th>
                <th>Timezone</th>
                <th>Cameras</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {appliances.map((a) => (
                <tr key={a.id} className={selected === a.id ? 'current' : ''}>
                  <td>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setSelected(a.id)}
                    >
                      {a.id}
                    </button>
                  </td>
                  <td>
                    <MapPin size={12} /> {a.location}
                  </td>
                  <td>
                    <i className={'badge ' + (a.online ? 'green' : 'red')}>
                      {a.online ? 'Online' : 'Not reporting'}
                    </i>
                  </td>
                  <td className="mono">{a.coordinates}</td>
                  <td>{a.timezone}</td>
                  <td>{a.online ? a.cameras : 0}</td>
                  <td>{a.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {device && (
        <section className="panel">
          <h2>
            <Cpu size={17} /> {device.id} · system health
          </h2>
          <ul className="fleet-meta">
            <li>
              <span>Hostname</span>
              <strong>{device.host}</strong>
            </li>
            <li>
              <span>Uptime</span>
              <strong>{device.uptime}</strong>
            </li>
            <li>
              <span>CPU</span>
              <strong>{device.cpuModel}</strong>
            </li>
          </ul>
          {!device.online ? (
            <p className="site-warn">
              This appliance is not reporting. No camera at {device.site} is
              being analysed, and no event from it can be trusted as absent.
              Dispatch a check and fall back to patrols.
            </p>
          ) : (
            <>
              <div className="fleet-rings">
                <Ring value={device.cpu} label="CPU usage" />
                <Ring
                  value={pct(device.memUsed, device.memTotal)}
                  label="Memory"
                  detail={`${device.memUsed.toFixed(1)} / ${device.memTotal} GB`}
                />
                <Ring
                  value={pct(device.diskUsed, device.diskTotal)}
                  label="Disk"
                  detail={`${device.diskUsed} / ${device.diskTotal} GB`}
                />
              </div>
              <h3 className="fleet-sub">
                <Zap size={15} /> {device.gpu}
              </h3>
              <div className="fleet-rings">
                <Ring value={device.gpuUtil} label="GPU utilisation" tone="violet" />
                <Ring
                  value={pct(device.vramUsed, device.vramTotal)}
                  label="VRAM"
                  detail={`${device.vramUsed.toFixed(1)} / ${device.vramTotal} GB`}
                  tone="violet"
                />
                <div className="fleet-ring">
                  <Thermometer size={26} />
                  <strong>{device.temperature}°C</strong>
                  <span>Temperature</span>
                </div>
              </div>
              <h3 className="fleet-sub">
                <HardDrive size={15} /> Services
              </h3>
              <ul className="fleet-services">
                {device.services.map((s) => (
                  <li key={s.name}>
                    <span>{s.name}</span>
                    <i
                      className={
                        'badge ' + (s.state === 'Running' ? 'green' : 'red')
                      }
                    >
                      {s.state}
                    </i>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="muted">
            Telemetry is generated for the demonstration. No appliance is
            connected and no metric here was measured from hardware.
          </p>
        </section>
      )}
    </div>
  );
}
