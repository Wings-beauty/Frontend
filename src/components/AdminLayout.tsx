"use client";

import { usePathname } from "next/navigation";
import { HiChartBar, HiChatBubbleLeftRight, HiHome, HiNewspaper, HiShieldCheck, HiUsers } from "react-icons/hi2";
import { useNavigate } from "../lib/router";

const navItems = [
  { label: "대시보드", href: "/admin", icon: HiChartBar, exact: true },
  { label: "회원 관리", href: "/admin/users", icon: HiUsers },
  { label: "문의 관리", href: "/admin/inquiries", icon: HiChatBubbleLeftRight },
  { label: "뉴스 관리", href: "/admin/news", icon: HiNewspaper },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = usePathname() ?? "/admin";

  return (
    <div className="flex min-h-dvh max-w-360 mx-auto">
      {/* 사이드바 — 데스크탑 */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-cream-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-cream-200 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-brown-600 text-white">
            <HiShieldCheck className="size-4" />
          </div>
          <span className="text-base font-medium text-brown-600">관리자</span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-brown-600 text-white" : "text-brown-400 hover:bg-cream-50 hover:text-brown-600"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-cream-200 px-3 py-3">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brown-400 transition hover:bg-cream-50 hover:text-brown-600"
          >
            <HiHome className="size-4 shrink-0" />
            서비스로 돌아가기
          </button>
        </div>
      </aside>

      {/* 모바일 상단 탭 */}
      <div className="fixed inset-x-0 top-[73px] z-40 flex gap-1 overflow-x-auto border-b border-cream-200 bg-white px-4 py-2 lg:hidden">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? "bg-brown-600 text-white" : "border border-cream-200 text-brown-400"}`}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto bg-white px-5 py-6 pt-[calc(40px+1.5rem)] lg:px-8 lg:py-8 lg:pt-8">{children}</main>
    </div>
  );
}
