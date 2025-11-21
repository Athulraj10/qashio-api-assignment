import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import PageLayout from './components/PageLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qashio - Financial Dashboard',
  description: 'Manage your transactions, budgets, and categories with Qashio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PageLayout>{children}</PageLayout>
        </Providers>
      </body>
    </html>
  );
}
