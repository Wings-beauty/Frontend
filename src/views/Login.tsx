"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "../lib/router";
import Image from "next/image";
import { HiArchiveBox, HiHeart, HiSparkles, HiSwatch } from "react-icons/hi2";
import type { User } from "@supabase/supabase-js";
import { consumeAuthReturnTo, getCurrentUser, hasDiagnosisHistory, saveCurrentDiagnosisToUser, signInWithGoogle } from "../api/auth";
import { supabase } from "../lib/supabase";

const loginHighlights = [
  {
    icon: HiSwatch,
    title: "진단 결과 저장",
    description: "퍼스널 컬러 결과를 계정에 보관합니다.",
  },
  {
    icon: HiHeart,
    title: "찜한 상품 관리",
    description: "관심 상품을 한곳에서 다시 확인합니다.",
  },
  {
    icon: HiArchiveBox,
    title: "히스토리 확인",
    description: "진단 기록과 피드백을 이어서 관리합니다.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const hasHandledAuthenticatedUser = useRef(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const resolvePostLoginPath = useCallback(async (userId: string) => {
    const returnTo = consumeAuthReturnTo();

    if (returnTo !== "/home") {
      return returnTo;
    }

    return (await hasDiagnosisHistory(userId)) ? "/home" : "/photo";
  }, []);

  const handleAuthenticatedUser = useCallback(
    async (user: User) => {
      if (hasHandledAuthenticatedUser.current) {
        return null;
      }

      hasHandledAuthenticatedUser.current = true;

      await saveCurrentDiagnosisToUser(user);
      return resolvePostLoginPath(user.id);
    },
    [resolvePostLoginPath],
  );

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then(async (user) => {
        if (!user) {
          return;
        }

        const nextPath = await handleAuthenticatedUser(user);

        if (isMounted && nextPath) {
          navigate(nextPath, { replace: true });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        return;
      }

      void handleAuthenticatedUser(session.user).then((nextPath) => {
        if (isMounted && nextPath) {
          navigate(nextPath, { replace: true });
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthenticatedUser, navigate]);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError("");

    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "로그인 중 문제가 발생했어요.");
      setIsSigningIn(false);
    }
  };

  return (
    <main className="app-page px-5 py-5 text-brown-600 lg:px-8 lg:py-7">
      <div className="mx-auto grid min-h-[calc(100dvh-40px)] w-full max-w-7xl overflow-hidden rounded-2xl border border-cream-200 bg-white lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-full overflow-hidden bg-cream-100 lg:block">
          <Image src="/banner/banner2.png" alt="" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brown-600/72 via-brown-600/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-sm text-white/75">WINGS Personal Color</p>
            <h1 className="mt-4 max-w-xl text-5xl font-medium leading-[1.08]">내 컬러 여정을 계속 이어가세요.</h1>
            <div className="mt-8 grid gap-3">
              {loginHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
                  <item.icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-base leading-6">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-white/75">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100dvh-40px)] flex-col px-5 py-6 sm:px-8 lg:px-14 lg:py-10">
          <header className="flex items-center justify-between">
            <span className="text-xl font-medium tracking-[0.18em] text-[#2B211F]">WINGS</span>
          </header>

          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="mb-7 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-cream-100 px-5 text-base leading-6 text-brown-600">
              <HiSparkles className="size-5" aria-hidden="true" />
              결과 저장하기
            </div>

            <h2 className="max-w-xl text-4xl font-medium leading-[1.15] text-brown-600 lg:text-5xl">로그인하고 내 톤 기록을 저장하세요.</h2>
            <p className="app-copy mt-6 max-w-lg text-base">구글 계정으로 간편하게 시작하고, 진단 기록과 저장한 상품을 마이페이지에서 이어서 확인하세요.</p>

            <div className="mt-10 rounded-2xl border border-cream-200 bg-white px-5 py-6 sm:px-6">
              <button
                type="button"
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-cream-200 bg-white text-base leading-7 text-brown-600 transition hover:bg-cream-50 disabled:opacity-60"
                disabled={isCheckingSession || isSigningIn}
                onClick={handleGoogleLogin}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#4285f4] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]">G</span>
                {isCheckingSession ? "로그인 확인 중" : isSigningIn ? "구글로 이동 중" : "Google로 로그인 / 회원가입"}
              </button>

              {authError ? <p className="mt-4 text-center text-sm leading-5 text-[#c4544a]">{authError}</p> : null}
              <p className="mt-5 text-center text-xs leading-5 text-brown-300">로그인하면 WINGS 이용 약관과 개인정보 처리방침에 동의한 것으로 간주됩니다.</p>
            </div>

            <div className="mt-8 grid gap-3 lg:hidden">
              {loginHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-cream-100 px-4 py-3">
                  <item.icon className="mt-0.5 size-5 shrink-0 text-brown-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm leading-5 text-brown-600">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-[#756861]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
