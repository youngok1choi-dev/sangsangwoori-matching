import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결하는 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="min-h-screen bg-background text-foreground text-lg">
        <header className="border-b bg-white sticky top-0 z-10">
          <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-700 tracking-tight"
            >
              상상우리
            </Link>
            <ul className="flex gap-6 text-base font-medium">
              <li>
                <Link
                  href="/register"
                  className="hover:text-blue-700 transition-colors"
                >
                  프로필 등록
                </Link>
              </li>
              <li>
                <Link
                  href="/recommendations"
                  className="hover:text-blue-700 transition-colors"
                >
                  추천 일자리
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-blue-700 transition-colors"
                >
                  담당자 대시보드
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
