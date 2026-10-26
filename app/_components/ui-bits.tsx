import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { DetectorStatus } from '../_data/um';
import type { AlertStatus, Severity, Verdict } from '../_data/alerts';

/** Tone classes built only from design tokens. */
export const tone = {
  critical: 'bg-critical-soft text-critical',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  brand: 'bg-brand-soft text-brand',
  muted: 'bg-muted text-muted-foreground',
} as const;
export type Tone = keyof typeof tone;

export function Pill({
  t = 'muted',
  children,
  className,
  dot,
}: {
  t?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(tone[t], 'border-transparent', className)}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  );
}

export const severityTone: Record<Severity, Tone> = {
  High: 'critical',
  Medium: 'warning',
  Low: 'muted',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Pill t={severityTone[severity]} dot>
      {severity}
    </Pill>
  );
}

export const statusTone: Record<AlertStatus, Tone> = {
  New: 'critical',
  Acknowledged: 'warning',
  Verified: 'info',
  Actioned: 'brand',
  Closed: 'success',
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return <Pill t={statusTone[status]}>{status}</Pill>;
}

const verdictTone: Record<Verdict, Tone> = {
  True: 'critical',
  'False alarm': 'muted',
  Unsure: 'warning',
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <Pill t={verdictTone[verdict]}>
      {verdict === 'True' ? 'Verified true' : verdict}
    </Pill>
  );
}

const detectorTone: Record<DetectorStatus, Tone> = {
  Live: 'success',
  PoC: 'warning',
  Build: 'info',
  'New model': 'muted',
  Partner: 'muted',
  'To confirm': 'muted',
};

export function DetectorStatusBadge({ status }: { status: DetectorStatus }) {
  return <Pill t={detectorTone[status]}>{status}</Pill>;
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  t,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  t?: Tone;
}) {
  return (
    <Card size="sm" className="gap-1">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="tabular mt-1 text-2xl font-semibold tracking-tight">
            {value}
          </div>
          {hint && (
            <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-lg',
              tone[t ?? 'brand'],
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-xs font-medium text-primary">{eyebrow}</div>
        )}
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}

export function Note({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground',
        className,
      )}
    >
      <Info className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Horizontal meter for percentages. */
export function Meter({
  value,
  t = 'brand',
  className,
}: {
  value: number;
  t?: Tone;
  className?: string;
}) {
  const bar = {
    critical: 'bg-critical',
    warning: 'bg-warning',
    success: 'bg-success',
    info: 'bg-info',
    brand: 'bg-primary',
    muted: 'bg-muted-foreground',
  }[t];
  return (
    <div
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full', bar)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function csvDownload(name: string, rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const s = String(v);
    // Neutralise spreadsheet formula injection and quote every cell.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], {
    type: 'text/csv',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
