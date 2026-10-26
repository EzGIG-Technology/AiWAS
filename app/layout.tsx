import type { Metadata } from 'next';
import '../vercel-entry/fonts.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'EzVision Campus · AiWAS',
  description:
    'Camera intelligence demonstration for universities: Universiti Malaya analytics workspace, KPT national oversight and the EzVision Mobile app.',
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
