// Brand marks. These are SVG reconstructions drawn to match the supplied
// presentation artwork so the product is co-branded without depending on
// binary assets. Replace with the official vector files when they are
// available; the component API will not change.

export function AiwasLogo({
  size = 26,
  tone = 'colour',
}: {
  size?: number;
  tone?: 'colour' | 'mono';
}) {
  const mark = tone === 'mono' ? 'currentColor' : 'url(#aiwas-grad)';
  return (
    <span
      className="brand-logo aiwas-logo"
      style={{ ['--brand-size' as string]: `${size}px` }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="aiwas-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8912F" />
            <stop offset="55%" stopColor="#CE6417" />
            <stop offset="100%" stopColor="#B34A0E" />
          </linearGradient>
        </defs>
        {/* Four-point spark from the AiWAS wordmark. */}
        <path
          d="M12 1.6c.55 3.9 1.9 6.1 4.6 7.2-2.7 1.1-4.05 3.3-4.6 7.2-.55-3.9-1.9-6.1-4.6-7.2 2.7-1.1 4.05-3.3 4.6-7.2Z"
          fill={mark}
        />
        <path
          d="M5.4 13.9c.3 2.1 1.03 3.3 2.5 3.9-1.47.6-2.2 1.8-2.5 3.9-.3-2.1-1.03-3.3-2.5-3.9 1.47-.6 2.2-1.8 2.5-3.9Z"
          fill={mark}
          opacity=".8"
        />
      </svg>
      <span className="brand-word">
        A<span className="brand-word-i">i</span>WAS
      </span>
    </span>
  );
}

export function MicropayLogo({ size = 22 }: { size?: number }) {
  return (
    <span
      className="brand-logo micropay-logo"
      style={{ ['--brand-size' as string]: `${size}px` }}
    >
      <svg
        viewBox="0 0 28 28"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        {/* Two opposing arcs forming the MicroPay ring. */}
        <path
          d="M14 3.2a10.8 10.8 0 0 1 10.8 10.8"
          fill="none"
          stroke="#E8452F"
          strokeWidth="3.1"
          strokeLinecap="round"
        />
        <path
          d="M24.8 14A10.8 10.8 0 0 1 14 24.8"
          fill="none"
          stroke="#F0A62B"
          strokeWidth="3.1"
          strokeLinecap="round"
        />
        <path
          d="M14 24.8A10.8 10.8 0 0 1 3.2 14 10.8 10.8 0 0 1 14 3.2"
          fill="none"
          stroke="#2D7BE0"
          strokeWidth="3.1"
          strokeLinecap="round"
        />
      </svg>
      <span className="brand-word">
        MICRO<span className="brand-word-pay">PAY</span>
      </span>
    </span>
  );
}

/** Co-branded lockup used on the command centre and architecture headers. */
export function BrandLockup({ subtitle }: { subtitle?: string }) {
  return (
    <div className="brand-lockup">
      <AiwasLogo size={30} />
      <span className="brand-lockup-rule" aria-hidden="true" />
      <span className="brand-lockup-by">
        <small>Presented by</small>
        <MicropayLogo size={20} />
      </span>
      {subtitle && <p className="brand-lockup-sub">{subtitle}</p>}
    </div>
  );
}
