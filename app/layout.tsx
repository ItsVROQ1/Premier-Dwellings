import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/layout/shell';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Premium Real Estate Platform',
  description: 'A premium real estate marketplace for buying, selling, and renting properties',
  openGraph: {
    title: 'Premium Real Estate Platform',
    description: 'A premium real estate marketplace for buying, selling, and renting properties',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Real Estate Platform',
    description: 'A premium real estate marketplace for buying, selling, and renting properties',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Shell>{children}</Shell>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
