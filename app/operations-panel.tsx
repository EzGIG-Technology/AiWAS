'use client';
import { workItemError } from './workflow';
import { useState } from 'react';
import {
  Plus,
  ClipboardCheck,
  Wrench,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Incident, User, Camera } from './data';

type WorkItem = {
  id: string;
  school: string;
  kind: string;
  title: string;
  owner: string;
  due: string;
  link: string;
  status: string;
  history: string[];
};
export function OperationsPanel({
  school,
  incidents,
  users,
  cameras,
  onOpen,
  onReport,
}: {
  school: string;
  incidents: Incident[];
  users: User[];
  cameras: Camera[];
  onOpen: (id: string) => void;
  onReport: (i: Incident) => void;
}) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [dialog, setDialog] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<WorkItem | null>(null);
  const [filter, setFilter] = useState('Active');
  const [zone, setZone] = useState('');
  const [scope, setScope] = useState(school);
  if (scope !== school) {
    setScope(school);
    setDialog('');
    setSelected(null);
    setZone('');
    setError('');
  }
  const staff = users.filter(
    (u) => u.active && (u.school === school || u.school === 'All PoC schools'),
  );
  const work = items.filter((i) => i.school === school);
  const visible = work.filter(
    (i) =>
      filter === 'All' ||
      (filter === 'Completed'
        ? i.status === 'Completed'
        : i.status !== 'Completed'),
  );
  const openDialog = (type: string) => {
    setError('');
    setSelected(null);
    setDialog(type);
  };
  const stamp = () =>
    new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) +
    ' MYT';
  function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (key: string) => {
      const value = data.get(key);
      return typeof value === 'string' ? value.trim() : '';
    };
    const title = text('title'),
      detail = text('detail'),
      owner = text('owner');
    if (detail.length < 10) {
      setError(
        'Include at least 10 characters describing the concern or action.',
      );
      return;
    }
    if (dialog !== 'Update' && title.trim().length < 3) {
      setError('Enter a summary of at least three characters.');
      return;
    }
    if (dialog === 'Update') {
      if (
        !['Open', 'In progress', 'Blocked', 'Completed'].includes(
          text('status'),
        )
      ) {
        setError('Choose a valid status.');
        return;
      }
      if (!selected || selected.school !== school) return;
      setItems((all) =>
        all.map((i) =>
          i.id === selected.id
            ? {
                ...i,
                status: text('status'),
                history: [
                  ...i.history,
                  `${stamp()} · ${text('status')}: ${detail}`,
                ],
              }
            : i,
        ),
      );
    } else if (dialog === 'Report concern') {
      const camera = cameras.find((c) => c.id === text('zone'));
      if (!camera || !staff.some((u) => u.name === owner)) {
        setError('Choose a school zone and an active responder.');
        return;
      }
      const now = new Date();
      onReport({
        id: `STAFF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        school,
        category: text('category'),
        zone: camera.zone,
        camera: camera.id,
        block: camera.block,
        severity: text('severity'),
        confidence: 0,
        date: now.toLocaleDateString('en-CA', {
          timeZone: 'Asia/Kuala_Lumpur',
        }),
        time: now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kuala_Lumpur',
          hour: '2-digit',
          minute: '2-digit',
        }),
        description: `Staff report: ${title}. ${detail}`,
        status: 'Open',
        validation: 'Pending',
        assigned: owner,
        history: [
          {
            text: `Manual concern recorded: ${detail}. No camera evidence attached.`,
            actor: 'Staff · demo session',
            time: stamp(),
          },
        ],
      });
    } else {
      if (!staff.some((u) => u.name === owner) || !text('due')) {
        setError('Choose an active owner and a due date.');
        return;
      }
      const issue = workItemError(title, detail, text('due'));
      if (issue) {
        setError(issue);
        return;
      }
      const link = text('link');
      if (dialog === 'Follow-up' && !incidents.some((i) => i.id === link)) {
        setError('Choose an incident in this school.');
        return;
      }
      if (dialog === 'Maintenance' && !cameras.some((c) => c.id === link)) {
        setError('Choose a camera in this school.');
        return;
      }
      setItems((all) => [
        {
          id: crypto.randomUUID(),
          school,
          kind: dialog,
          title,
          owner,
          due: text('due'),
          link,
          status: 'Open',
          history: [`${stamp()} · Created: ${detail}`],
        },
        ...all,
      ]);
    }
    setDialog('');
    setError('');
  }
  return (
    <>
      <section className="response-hero panel">
        <div>
          <div className="eyebrow">STAFF RESPONSE</div>
          <h2>Turn a concern into a coordinated response</h2>
          <p>
            Record what happened, assign the next action and document the
            outcome.
          </p>
        </div>
        <button
          className="btn primary"
          onClick={() => openDialog('Report concern')}
        >
          <Plus size={16} /> Report concern
        </button>
      </section>
      <div className="response-metrics">
        <div className="panel">
          <span>Open follow-ups</span>
          <strong>
            {
              work.filter(
                (i) => i.kind === 'Follow-up' && i.status !== 'Completed',
              ).length
            }
          </strong>
        </div>
        <div className="panel">
          <span>Maintenance tasks</span>
          <strong>
            {
              work.filter(
                (i) => i.kind === 'Maintenance' && i.status !== 'Completed',
              ).length
            }
          </strong>
        </div>
        <div className="panel">
          <span>Completed actions</span>
          <strong>{work.filter((i) => i.status === 'Completed').length}</strong>
        </div>
      </div>
      <Tabs defaultValue="actions">
        <TabsList className="section-tabs">
          <TabsTrigger value="actions">Action register</TabsTrigger>
          <TabsTrigger value="campus">Campus coverage</TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <div className="toolbar">
            <label className="field">
              Show
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {['Active', 'Completed', 'All'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <button
              className="btn push-right"
              onClick={() => openDialog('Maintenance')}
            >
              <Wrench size={16} /> Maintenance task
            </button>
            <button
              className="btn primary"
              disabled={!incidents.length}
              onClick={() => openDialog('Follow-up')}
            >
              <ClipboardCheck size={16} /> Add follow-up
            </button>
          </div>
          {!visible.length ? (
            <section className="panel response-empty">
              <ClipboardCheck size={28} />
              <h3>No {filter.toLowerCase()} actions</h3>
              <p>
                Create a follow-up from an incident or a maintenance task for a
                camera.
              </p>
            </section>
          ) : (
            <div className="response-action-grid">
              {visible.map((item) => (
                <article className="panel response-action" key={item.id}>
                  <div className="response-action-top">
                    <span className="eyebrow">{item.kind}</span>
                    <span className="badge blue">{item.status}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.owner} · Due {item.due}
                  </p>
                  <p className="help-text">{item.link}</p>
                  <div className="response-action-buttons">
                    {item.kind === 'Follow-up' && (
                      <button className="btn" onClick={() => onOpen(item.link)}>
                        Incident <ArrowUpRight size={14} />
                      </button>
                    )}
                    <button
                      className="btn"
                      onClick={() => {
                        setSelected(item);
                        setError('');
                        setDialog('Update');
                      }}
                    >
                      Update & history
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="campus">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h2>Campus zone register</h2>
                <p>
                  Select a zone to see its alerts. This is a coverage diagram,
                  not a surveyed school plan.
                </p>
              </div>
            </div>
            <div className="campus-zone-grid">
              {cameras.map((c) => (
                <button
                  key={c.id}
                  className={`campus-zone ${zone === c.id ? 'selected' : ''}`}
                  onClick={() => setZone(c.id)}
                >
                  <MapPin size={20} />
                  <strong>{c.zone}</strong>
                  <span>
                    {c.id} ·{' '}
                    {c.online ? 'Sample feed available' : 'Offline sample'}
                  </span>
                  <b>
                    {
                      incidents.filter(
                        (i) => i.zone === c.zone && i.status !== 'Closed',
                      ).length
                    }{' '}
                    open incidents
                  </b>
                </button>
              ))}
            </div>
            {zone && (
              <div className="zone-incidents">
                <h3>
                  {cameras.find((c) => c.id === zone)?.zone} · incident register
                </h3>
                {incidents
                  .filter((i) => i.camera === zone)
                  .map((i) => (
                    <button
                      className="btn"
                      key={i.id}
                      onClick={() => onOpen(i.id)}
                    >
                      {i.id} · {i.category} · {i.severity}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                {!incidents.some((i) => i.camera === zone) && (
                  <p>No incidents recorded in this zone.</p>
                )}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
      <p className="help-text">
        Demonstration workspace. Changes last for this page session. Creating
        tasks does not contact staff, repair cameras or send emergency
        notifications.
      </p>
      <Dialog
        open={!!dialog}
        onOpenChange={(o) => {
          if (!o) setDialog('');
        }}
      >
        <DialogContent className="operations-dialog">
          <DialogHeader>
            <DialogTitle>{dialog}</DialogTitle>
            <DialogDescription>
              {school} · Fictional workflow preview
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="operations-form">
            {dialog === 'Update' ? (
              <>
                <h3>{selected?.title}</h3>
                <label className="field">
                  Status
                  <select name="status" defaultValue={selected?.status}>
                    {['Open', 'In progress', 'Blocked', 'Completed'].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </label>
                <div className="work-history">
                  {selected?.history.map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="field">
                  {dialog === 'Report concern'
                    ? 'Concern summary'
                    : 'Action title'}
                  <input
                    name="title"
                    required
                    maxLength={160}
                    placeholder={
                      dialog === 'Maintenance'
                        ? 'Inspect the offline assembly hall camera'
                        : 'Briefly describe the concern or next step'
                    }
                  />
                </label>
                {dialog === 'Report concern' ? (
                  <div className="operations-fields">
                    <label className="field">
                      Concern type
                      <select name="category">
                        {[
                          'Bullying',
                          'Fighting',
                          'Visible blade concern',
                          'Medical concern',
                          'Missing student concern',
                          'Safeguarding concern',
                          'Restricted area intrusion',
                          'Other staff concern',
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Priority
                      <select name="severity">
                        {['Medium', 'Low', 'High', 'Critical'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Observed location
                      <select name="zone" required>
                        {cameras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.zone}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <>
                    <label className="field">
                      {dialog === 'Maintenance'
                        ? 'Affected camera'
                        : 'Related incident'}
                      <select name="link" required>
                        {dialog === 'Maintenance'
                          ? cameras.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.id} · {c.zone}
                              </option>
                            ))
                          : incidents.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.id} · {i.category}
                              </option>
                            ))}
                      </select>
                    </label>
                    <label className="field">
                      Due date
                      <input name="due" type="date" required />
                    </label>
                  </>
                )}
                <label className="field">
                  Assigned owner
                  <select name="owner" required>
                    {staff.map((u) => (
                      <option key={u.email}>{u.name}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label className="field">
              {dialog === 'Update'
                ? 'Progress / completion evidence'
                : 'Details and next action'}
              <textarea
                name="detail"
                rows={4}
                required
                minLength={10}
                maxLength={3000}
                placeholder="Record observations and the action needed. Use fictional information in this demo."
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="response-action-buttons">
              <button
                type="button"
                className="btn"
                onClick={() => setDialog('')}
              >
                Cancel
              </button>
              <button className="btn primary" type="submit">
                {dialog === 'Update'
                  ? 'Record update'
                  : dialog === 'Report concern'
                    ? 'Create incident'
                    : 'Create task'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
