"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "../lib/router";
import { HiSparkles } from "react-icons/hi2";
import type { User } from "@supabase/supabase-js";
import {
  consumeAuthReturnTo,
  getCurrentUser,
  hasDiagnosisHistory,
  saveCurrentDiagnosisToUser,
  signInWithGoogle,
} from "../api/auth";
import { supabase } from "../lib/supabase";

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
      setAuthError(
        error instanceof Error ? error.message : "로그인 중 문제가 발생했어요.",
      );
      setIsSigningIn(false);
    }
  };

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-white px-5 pb-8 pt-6">
      <div
        className="absolute -right-28 top-4 size-72 rounded-full bg-tone-summer/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 bottom-12 size-72 rounded-full bg-tone-spring/40 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        <div className="size-10" aria-hidden="true" />

        <h1 className="text-2xl font-normal leading-[30px] text-[#1f1b1b]">
          WINGS
        </h1>

        <div className="size-10" aria-hidden="true" />
      </header>

      <section className="relative flex min-h-[calc(100dvh-88px)] flex-col justify-center">
        <div className="mb-7 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-cream-100 px-5 text-base font-normal leading-6 text-brown-600">
          <HiSparkles className="size-5" aria-hidden="true" />
          결과 저장하기
        </div>

        <h2 className="text-3xl font-normal leading-10 tracking-tight text-brown-600">
          로그인하고
          <br />
          윙즈의 모든 서비스를 이용해보세요.
        </h2>
        <p className="mt-6 text-base font-normal leading-7 text-[#7a625c]">
          구글 계정으로 간편하게 시작할 수 있어요.
          <br />
          저장한 진단 기록과 찜한 제품은 <br /> 마이페이지에서 다시 확인할 수
          있습니다.{" "}
        </p>

        <div className="mt-12 rounded-2xl bg-white px-5 py-6 shadow-lg">
          <button
            type="button"
            className="flex h-16 w-full items-center justify-center gap-3 rounded-full border border-cream-200 bg-white text-lg font-normal leading-7 text-brown-600 shadow-[0_8px_22px_rgb(107_74_63_/_0.08)] disabled:opacity-60"
            disabled={isCheckingSession || isSigningIn}
            onClick={handleGoogleLogin}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#4285f4] shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.08)]">
              G
            </span>
            {isCheckingSession
              ? "로그인 확인 중"
              : isSigningIn
                ? "구글로 이동 중"
                : "Google로 로그인 / 회원가입"}
          </button>

          {authError && (
            <p className="mt-4 text-center text-sm font-normal leading-5 text-[#c4544a]">
              {authError}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
