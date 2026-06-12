"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HiHeart, HiHome, HiMiniUser, HiSparkles, HiUserGroup } from "react-icons/hi2";
import { supabase } from "../lib/supabase";
import NotificationPopover from "./NotificationPopover";
import { useNavigate } from "../lib/router";

const primaryNavItems = [
  { label: "진단", href: "/photo" },
  { label: "커뮤니티", href: "/community" },
  { label: "상품", href: "/products" },
  { label: "뉴스", href: "/news" },
];

const mobileNavItems = [
  { icon: HiHome, label: "홈", href: "/home" },
  { icon: HiUserGroup, label: "커뮤니티", href: "/community" },
  { icon: HiSparkles, label: "진단", href: "/photo" },
  { icon: HiHeart, label: "상품", href: "/products" },
  { icon: HiMiniUser, label: "마이", href: "/mypage" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/home") return pathname === "/" || pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AuthState = { status: "loading" | "guest" | "user"; avatarUrl?: string | null; initials?: string };

function UserButton({ state, onClick }: { state: AuthState; onClick: () => void }) {
  if (state.status === "loading") {
    return <div className="bg-cream-100 size-10 animate-pulse rounded-full" />;
  }

  if (state.status === "guest") {
    return (
      <button type="button" onClick={onClick} className="border-brown-200 text-brown-600 hover:bg-cream-50 rounded-full border bg-white px-4 py-2 text-sm font-medium transition">
        로그인
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="마이페이지"
      className="border-cream-200 bg-cream-100 flex size-10 items-center justify-center overflow-hidden rounded-full border transition hover:opacity-80"
    >
      {state.avatarUrl ? (
        <img src={state.avatarUrl} alt="프로필" className="size-full object-cover" />
      ) : (
        <span className="text-brown-500 text-sm font-medium">{state.initials ?? <HiMiniUser className="size-5" />}</span>
      )}
    </button>
  );
}

export default function AppHeader() {
  const navigate = useNavigate();
  const pathname = usePathname() ?? "/";
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const resolveAuth = async (userId: string | undefined) => {
      if (!userId) {
        setAuth({ status: "guest" });
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("nickname, email, profile_image_url")
        .eq("id", userId)
        .maybeSingle<{ nickname: string | null; email: string | null; profile_image_url: string | null }>();

      const name = data?.nickname ?? data?.email ?? "";
      const initials = name.charAt(0).toUpperCase() || undefined;
      setAuth({ status: "user", avatarUrl: data?.profile_image_url ?? null, initials });
    };

    supabase.auth.getUser().then(({ data }) => void resolveAuth(data.user?.id));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolveAuth(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserButtonClick = () => {
    if (auth.status === "guest") {
      navigate(`/login?returnTo=${encodeURIComponent(pathname)}`);
    } else {
      navigate("/mypage");
    }
  };

  return (
    <>
      <header className="border-cream-200 fixed inset-x-0 top-0 z-50 border-b bg-white/95 px-4 text-[#2B211F] backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-360 items-center justify-between py-3.5">
          <button type="button" className="text-xl font-medium tracking-[0.18em] text-[#2B211F]" onClick={() => navigate("/home")}>
            WINGS
          </button>

          <nav className="hidden items-center gap-9 text-sm font-medium text-[#725C53] md:flex">
            {primaryNavItems.map((item) => (
              <button key={item.href} type="button" className={`transition ${isActivePath(pathname, item.href) ? "text-[#2B211F]" : "hover:text-[#2B211F]"}`} onClick={() => navigate(item.href)}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm text-[#725C53]">
            <NotificationPopover authStatus={auth.status} />
            <div className="hidden md:block">
              <UserButton state={auth} onClick={handleUserButtonClick} />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-cream-200 fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-4 py-2 text-[#725C53] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md justify-between text-xs">
          {mobileNavItems.map((item) => {
            const isMypage = item.href === "/mypage";
            return (
              <button
                key={item.href}
                type="button"
                className="flex flex-col items-center gap-1 py-1"
                onClick={() => {
                  if (isMypage && auth.status === "guest") {
                    navigate(`/login?returnTo=/mypage`);
                  } else {
                    navigate(item.href);
                  }
                }}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full border transition ${isActivePath(pathname, item.href) ? "border-brown-600 bg-brown-600 text-white" : "border-cream-200 bg-white"}`}
                >
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
