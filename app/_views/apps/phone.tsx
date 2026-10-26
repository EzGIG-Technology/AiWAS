import { cn } from '@/lib/utils';
import { Signal, Wifi, BatteryFull } from 'lucide-react';

/**
 * Device frame for app previews. On a phone-sized screen the frame drops
 * away and the app fills the viewport.
 */
export function Phone({
  children,
  label,
  time,
  className,
}: {
  children: React.ReactNode;
  label: string;
  time: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <section
        aria-label={label}
        className="relative flex h-[min(780px,calc(100svh-7rem))] w-full max-w-[390px] flex-col overflow-hidden bg-background sm:rounded-[2.6rem] sm:shadow-2xl sm:ring-[10px] sm:ring-neutral-900 dark:sm:ring-neutral-700"
      >
        <div className="flex h-9 shrink-0 items-center justify-between px-6 text-xs font-semibold">
          <span className="tabular">{time}</span>
          <span className="absolute left-1/2 top-2 hidden h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900 sm:block" />
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </section>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
