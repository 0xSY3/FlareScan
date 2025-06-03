import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FlareScanAI - AI-Powered Data Blockchain Explorer',
  description: 'Advanced AI blockchain explorer for Flare network. Analyze transactions, FTSO data feeds, FAssets, and ecosystem interactions with intelligent insights.',
  keywords: 'Flare, blockchain, explorer, FTSO, FAssets, data oracles, cross-chain, AI analysis',
  authors: [{ name: 'FlareScanAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ec4899',
  openGraph: {
    title: 'FlareScanAI - AI-Powered Data Blockchain Explorer',
    description: 'Explore the Flare ecosystem with AI-powered transaction analysis, FTSO data feeds, and cross-chain insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlareScanAI - AI-Powered Data Blockchain Explorer',
    description: 'Explore the Flare ecosystem with AI-powered transaction analysis.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}