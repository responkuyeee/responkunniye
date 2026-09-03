import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Marketplace Responden — Jual-Beli Jasa Isi Survei Berbasis Token',
  description:
    'Platform dua sisi yang mempertemukan Researcher dengan Respondent berbayar berkualitas dengan sistem token dan verifikasi terpercaya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
