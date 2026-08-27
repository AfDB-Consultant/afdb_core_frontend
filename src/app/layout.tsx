import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AfDB Enterprise Dashboard',
  description: 'African Development Bank — Enterprise Data Platform Dashboard',
  icons: { icon: '/icons/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
