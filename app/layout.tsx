import type { Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';

import AppProvider from '@/app/appProvider';
import { Toaster } from '@/components/ui/sonner';

import '@/app/globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Companion — Personal & Customizable AI Assistants',
  description:
    'Build your team of AI companions. Custom personalities, multiple models, and a beautiful workspace for every task.',
};

const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProvider>{children}</AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
