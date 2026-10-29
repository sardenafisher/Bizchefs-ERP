import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://erp.bizchefs.com'),
  title: 'BizChefs ERP — Commercial Subscription ERP for Foodservice & Hospitality',
  description:
    'Commercial multi-tenant enterprise management platform by BizChefs. Centralized sales orders, multi-warehouse inventory valuation, double-entry accounting, and procurement.',
  openGraph: {
    title: 'BizChefs ERP — Commercial Subscription ERP for Foodservice & Hospitality',
    description:
      'Commercial multi-tenant enterprise management platform by BizChefs. Centralized sales orders, multi-warehouse inventory valuation, double-entry accounting, and procurement.',
    url: 'https://erp.bizchefs.com',
    siteName: 'BizChefs ERP',
    type: 'website',
    images: [
      {
        url: '/BizChefs-logo.png',
        width: 1200,
        height: 630,
        alt: 'BizChefs ERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizChefs ERP — Commercial Subscription ERP for Foodservice & Hospitality',
    description:
      'Commercial multi-tenant enterprise management platform by BizChefs. Centralized sales orders, multi-warehouse inventory valuation, double-entry accounting, and procurement.',
    images: ['/BizChefs-logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/BizChefs-emblem-transparent.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
