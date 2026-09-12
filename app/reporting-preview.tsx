'use client';
import { useState } from 'react';
import {
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
export function ReportingPreview({
  school,
  onReport,
}: {
  school: string;
  onReport: (data: {
    topic: string;
    message: string;
    source: string;
    contact: string;
  }) => string;
}) {
  const [step, setStep] = useState(0),
    [source, setSource] = useState('Pupil'),
    [topic, setTopic] = useState('Bullying & intimidation'),
    [message, setMessage] = useState(''),
    [contact, setContact] = useState('School counsellor'),
    [reference, setReference] = useState(''),
    [error, setError] = useState('');
  return (
    <div className="reporting-preview">
      <aside>
        <ShieldCheck size={32} />
        <span className="eyebrow">PUPIL & FAMILY PORTAL · PREVIEW</span>
        <h2>
          Tell someone.
          <br />
          You do not have to handle it alone.
        </h2>
        <p>A simple, private way to ask your school for help.</p>
        <div>
          <LockKeyhole size={18} />
          <p>
            Use invented information. This preview creates a fictional case in
            the school workspace; it does not contact anyone.
          </p>
        </div>
        <small>{school}</small>
      </aside>
      <section className="panel">
        <div className="setup-steps">
          {['Your concern', 'Safe contact', 'Reference'].map((t, i) => (
            <span key={t} className={i === step ? 'current' : ''}>
              {i + 1} {t}
            </span>
          ))}
        </div>
        {step === 0 ? (
          <form
            className="operations-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim().length < 10) {
                setError(
                  'Please describe the concern in at least 10 characters.',
                );
                return;
              }
              setError('');
              setStep(1);
            }}
          >
            <h3>What would you like help with?</h3>
            <label className="field">
              I am reporting as
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {[
                  'Pupil',
                  'Parent / guardian',
                  'Staff member',
                  'Anonymous reporter',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Concern type
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {[
                  'Bullying & intimidation',
                  'Verbal or discriminatory bullying',
                  'Cyberbullying or threats',
                  'Sexual safeguarding concern',
                  'Adult conduct concern',
                  'Retaliation after reporting',
                  'Emotional wellbeing',
                  'Substance support',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Tell us what happened
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                rows={5}
                placeholder="Fictional example: I would like to speak with a trusted adult about…"
              />
            </label>
            <p className="help-text">
              If someone is in immediate danger, seek help from a trusted adult
              and use the school’s emergency procedure. Do not wait for an
              online response.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="btn primary">Continue</button>
          </form>
        ) : step === 1 ? (
          <div className="operations-form">
            <h3>How can the school follow up safely?</h3>
            <label className="field">
              Preferred safe contact
              <select
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              >
                {[
                  'School counsellor',
                  'Trusted school staff',
                  'Guardian through school',
                  'Secure reference only',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="concept-policy">
              <strong>
                {source === 'Anonymous reporter'
                  ? 'Anonymous report'
                  : 'Review before submitting'}
              </strong>
              <p>
                {source === 'Anonymous reporter'
                  ? 'No name is requested. In a live service, anonymity can limit the school’s ability to contact you and ask follow-up questions.'
                  : 'The designated team would review your concern and agree a safe next step.'}
              </p>
              <span>{topic}</span>
              <p>{message}</p>
            </div>
            <div className="response-action-buttons">
              <button className="btn" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setReference(
                    onReport({
                      topic,
                      message: message.trim(),
                      source,
                      contact,
                    }),
                  );
                  setStep(2);
                }}
              >
                Submit fictional report
              </button>
            </div>
          </div>
        ) : (
          <div className="reporting-receipt">
            <CheckCircle2 size={44} />
            <h3>Your demonstration report is recorded</h3>
            <p>Keep this sample reference.</p>
            <code>{reference}</code>
            <div className="concept-policy">
              <MessageCircle size={18} />
              <strong>Status: received for school review</strong>
              <span>No real response or notification has been sent.</span>
            </div>
            <button
              className="btn"
              onClick={() => {
                setStep(0);
                setMessage('');
                setReference('');
              }}
            >
              Start another fictional report
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
