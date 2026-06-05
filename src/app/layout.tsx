import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "WINGS",
  description: "WINGS personal color recommendation service",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
