import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StrataQuest",
  description: "具体⇔抽象の往復トレーニングと英語語彙学習を融合させたRPG型Webアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
