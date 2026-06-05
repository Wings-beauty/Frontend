import type { Metadata } from "next";
import QueryProvider from "../components/QueryProvider";
import "../index.css";

export const metadata: Metadata = {
  title: "WINGS",
  description: "내 톤에 맞는 화장품을 찾아주는 AI 뷰티 플랫폼",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <QueryProvider>
          <div id="root">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
