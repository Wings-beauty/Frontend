import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("wings_has_seen_welcome") === "true";

    if (hasSeenWelcome) {
      navigate("/home", { replace: true });
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 2400);

    const navigateTimer = window.setTimeout(() => {
      localStorage.setItem("wings_has_seen_welcome", "true");
      navigate("/onboarding", { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center md:overflow-visible overflow-hidden bg-white">
      <div className="absolute left-1/2 top-1/2 h-dvh w-dvh -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream-100 blur-3xl" aria-hidden="true" />

      <div className="relative flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5">
        <div className={`flex flex-col items-center text-center opacity-80 ${isLeaving ? "welcome-fade-out" : "welcome-fade-in"}`}>
          <div className="rounded-full bg-cream-100 size-144 absolute blur-2xl z-0 top-1/2 -translate-y-1/2 " />
          <img src={logo} className="size-32 object-cover object-center z-10" alt="Wings" />
          <p className="mt-0 max-w-xs text-center text-base font-normal leading-7 text-[#6b4a3f] z-10">
            나에게 맞는 색을 찾는
            <br />
            가장 쉬운 방법
          </p>
        </div>
      </div>

      <div className="absolute bottom-16 flex gap-2" aria-hidden="true">
        <div className="size-2 rounded-full bg-brown-600 opacity-20" />
        <div className="size-2 rounded-full bg-brown-600 opacity-60" />
        <div className="size-2 rounded-full bg-brown-600 opacity-20" />
      </div>
    </main>
  );
}
