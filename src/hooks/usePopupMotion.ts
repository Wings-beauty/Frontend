import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** 팝업 페이지에서 기존 #root 폭 제한을 푼다. 첫 페인트 전에 적용해 레이아웃 깜빡임을 막는다. */
export function useWideLayout() {
  useLayoutEffect(() => {
    document.documentElement.dataset.layout = "wide";

    return () => {
      delete document.documentElement.dataset.layout;
    };
  }, []);
}

/** 요소가 화면에 들어오면 한 번만 data-revealed="true"를 붙인다. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      element.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 0에서 target까지 숫자를 세어 올린다. 모션 감소 설정에서는 바로 목표값을 보여준다. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const total = prefersReducedMotion() ? 0 : duration;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = total === 0 ? 1 : Math.min(1, (now - startedAt) / total);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

/** 스크롤 위치를 0~1로 돌려준다. 패럴랙스처럼 transform에만 쓰는 값이다. */
export function useScrollProgress(distance: number) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      setProgress(Math.min(1, window.scrollY / distance));
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [distance]);

  return progress;
}

/** 요소가 화면에 보이는지 계속 추적한다. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}
