'use client';
import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
export function SchoolOnboarding({
  existing,
  onCreate,
}: {
  existing: string[];
  onCreate: (
    name: string,
    admin: string,
    email: string,
    zone: string,
  ) => boolean;
}) {
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0),
    [name, setName] = useState(''),
    [admin, setAdmin] = useState(''),
    [email, setEmail] = useState(''),
    [zone, setZone] = useState('Main gate'),
    [error, setError] = useState('');
  function next(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (
      !name.trim() ||
      existing.some((n) => n.toLowerCase() === name.trim().toLowerCase())
    ) {
      setError('Enter a unique school name.');
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (
      !onCreate(
        name.trim(),
        admin.trim(),
        email.trim().toLowerCase(),
        zone.trim(),
      )
    ) {
      setError(
        'This administrator email already exists. Go back and choose a unique email.',
      );
      return;
    }
    setOpen(false);
  }
  return (
    <>
      <div className="toolbar">
        <span className="toolbar-meta">
          Create a school workspace and prepare its first camera zone.
        </span>
        <button
          className="btn primary push-right"
          onClick={() => {
            setName('');
            setAdmin('');
            setEmail('');
            setZone('Main gate');
            setStep(0);
            setError('');
            setOpen(true);
          }}
        >
          <Plus size={16} /> Add school
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="operations-dialog">
          <DialogHeader>
            <DialogTitle>Set up a school</DialogTitle>
            <DialogDescription>
              Step {step + 1} of 3 · Demonstration setup
            </DialogDescription>
          </DialogHeader>
          <div className="setup-steps">
            {['School', 'People & coverage', 'Review'].map((s, i) => (
              <span className={step === i ? 'current' : ''} key={s}>
                {i < step ? <Check size={14} /> : i + 1} {s}
              </span>
            ))}
          </div>
          <form className="operations-form" onSubmit={next}>
            {step === 0 && (
              <label className="field">
                School name
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example Secondary School"
                />
              </label>
            )}
            {step === 1 && (
              <>
                <label className="field">
                  School administrator
                  <input
                    required
                    maxLength={100}
                    value={admin}
                    onChange={(e) => setAdmin(e.target.value)}
                  />
                </label>
                <label className="field">
                  Administrator email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="administrator@example.com"
                  />
                </label>
                <label className="field">
                  First camera zone
                  <input
                    required
                    maxLength={80}
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                  />
                </label>
              </>
            )}
            {step === 2 && (
              <div className="setup-review">
                <h3>{name}</h3>
                <p>
                  {admin} · {email}
                </p>
                <p>First zone: {zone}</p>
                <ul>
                  <li>School appears in the directory and school selector.</li>
                  <li>Administrator is added as an inactive demo account.</li>
                  <li>
                    First camera is offline until a real integration exists.
                  </li>
                </ul>
                <p className="help-text">
                  No invitation is sent. No credentials or camera stream are
                  created. Records remain in this page session.
                </p>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="response-action-buttons">
              <button
                className="btn"
                type="button"
                onClick={() => (step ? setStep(step - 1) : setOpen(false))}
              >
                {step ? 'Back' : 'Cancel'}
              </button>
              <button className="btn primary">
                {step === 2 ? 'Create demo workspace' : 'Continue'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
