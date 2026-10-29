import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'BizChefs ERP — Commercial Multi-Tenant Enterprise Management',
  description: 'Production multi-tenant ERP platform for BizChefs featuring Accounting, Double-entry General Ledger, Inventory, Purchasing, CRM, and Operations.',
  openGraph: {
    title: 'BizChefs ERP — Commercial Multi-Tenant Enterprise Management',
    description: 'Production multi-tenant ERP platform for BizChefs featuring Accounting, Double-entry General Ledger, Inventory, Purchasing, CRM, and Operations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizChefs ERP — Commercial Multi-Tenant Enterprise Management',
    description: 'Production multi-tenant ERP platform for BizChefs featuring Accounting, Double-entry General Ledger, Inventory, Purchasing, CRM, and Operations.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
