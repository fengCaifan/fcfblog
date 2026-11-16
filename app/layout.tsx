import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caifan's Notes",
  description: "个人开发与学习笔记",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
