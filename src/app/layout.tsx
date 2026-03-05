import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StrataQuest — 概念の地層を探索する英語語彙RPG',
  description:
    '英語語彙の階層構造を理解しながら、抽象化力と具体化力を鍛えるRPG型学習アプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
