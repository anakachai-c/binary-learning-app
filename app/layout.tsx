import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Binary Lab — เรียนรู้เลขฐาน 2",
  description: "เว็บแอปเรียนรู้และฝึกแปลงเลขฐานสองสำหรับผู้เริ่มต้น",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
