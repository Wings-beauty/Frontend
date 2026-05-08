import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiSparkles } from "react-icons/hi2";
import {
  consumeAuthReturnTo,
  getCurrentUser,
  saveCurrentDiagnosisToUser,
  signInWithGoogle,
} from "../api/auth";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const isInitialDiagnosisLogin =
    sessionStorage.getItem("wings_auth_return_to") === "/photo";

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then(async (user) => {
        if (!user) {
          return;
        }

        await saveCurrentDiagnosisToUser(user);

        if (isMounted) {
          navigate(consumeAuthReturnTo(), { replace: true });
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

      void saveCurrentDiagnosisToUser(session.user).finally(() => {
        navigate(consumeAuthReturnTo(), { replace: true });
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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
        className="absolute -left-24 bottom-12 size-72 rounded-full bg-tone-spring/25 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex items-center justify-between">
        {isInitialDiagnosisLogin ? (
          <div className="size-10" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="flex size-10 items-center justify-center text-brown-600"
            aria-label="이전 페이지로 이동"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </button>
        )}

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
          내 퍼스널 컬러 결과를 저장하세요
        </h2>
        <p className="mt-6 text-base font-normal leading-7 text-[#7a625c]">
          구글 계정으로 간편하게 시작할 수 있어요.
          <br />
          저장한 진단 기록과 찜한 제품은 마이페이지에서 다시 확인할 수 있습니다.
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
