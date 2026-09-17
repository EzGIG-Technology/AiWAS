'use client';
import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Camera,
  Siren,
  Building2,
  Radio,
  Search,
  SlidersHorizontal,
  FileChartColumn,
  Layers,
  Menu,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import SecurityWorkspace from './workspace';
import CapabilityLibrary from './library';
import { securityViews } from './workflow';
import './dashboard.css';
const icons = [
  LayoutDashboard,
  Camera,
  Siren,
  Building2,
  Radio,
  Search,
  SlidersHorizontal,
  FileChartColumn,
  Layers,
];
export default function SecurityDashboard({
  view,
  navigate,
  onSwitch,
  visible = true,
}: {
  view: string;
  navigate: (view: string) => void;
  onSwitch: (workspace: string) => void;
  visible?: boolean;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="security-dashboard">
      <aside className={`security-rail ${menu ? 'is-open' : ''}`}>
        <div className="security-brand">
          <ShieldCheck size={32} />
          <div>
            AiWAS <span>SECURITY COMMAND</span>
          </div>
          <button
            className="security-mobile"
            aria-label="Close security navigation"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>
        <div className="security-portfolio">
          <span>OPERATIONS WORKSPACE</span>
          <strong>Security company demo</strong>
          <small>3 sites · Commercial portfolio</small>
        </div>
        <nav aria-label="Security dashboard navigation">
          {securityViews.map((item, i) => {
            const Icon = icons[i];
            return (
              <button
                key={item}
                aria-current={view === item ? 'page' : undefined}
                onClick={() => {
                  navigate(item);
                  setMenu(false);
                }}
              >
                <Icon size={19} />
                {item}
              </button>
            );
          })}
        </nav>
        <div className="security-rail-footer">
          <span className="security-avatar">AM</span>
          <div>
            <strong>Alex Morgan</strong>
            <small>Security operator · Demo</small>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="security-scrim"
          aria-label="Dismiss security navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="security-body">
        <header className="security-topbar">
          <div className="security-location">
            <button
              className="security-mobile"
              aria-label="Open security navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span>
              SECURITY / <strong>{view}</strong>
            </span>
          </div>
          <div className="security-switch">
            <span className="security-demo">DEMO ENVIRONMENT</span>
            <ArrowLeftRight size={16} />
            <select
              aria-label="Switch dashboard"
              value="Security workspace"
              onChange={(e) => onSwitch(e.target.value)}
            >
              <option>Security workspace</option>
              <option>School workspace</option>
              <option>Superadmin</option>
            </select>
          </div>
        </header>
        <main className="security-main" aria-label="Security dashboard content">
          <div hidden={view === 'Capability library'}>
            <SecurityWorkspace
              visible={visible && view !== 'Capability library'}
              view={view}
              navigate={navigate}
            />
          </div>
          <div hidden={view !== 'Capability library'}>
            <CapabilityLibrary navigate={navigate} />
          </div>
        </main>
      </div>
    </div>
  );
}
