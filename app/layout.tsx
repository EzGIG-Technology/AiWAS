import type { Metadata } from 'next';
import '../vercel-entry/fonts.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'EzVision Campus Safety · AiWAS',
  description:
    'Campus safety demonstration for universities: Universiti Malaya operations workspace, KPT national oversight and the EzSafe and EzPatrol apps.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
