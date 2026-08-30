import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/Toast';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: 'AfDB Enterprise Dashboard',
  description: 'African Development Bank — Enterprise Data Platform Dashboard',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-background text-foreground antialiased"
        style={{ fontFamily: "'Afacad', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <FloatingChatWidget />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
