"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

type NavigateOptions = {
  replace?: boolean;
};

type LocationState = {
  pathname: string;
  search: string;
};

type LinkProps = Omit<NextLinkProps, "href"> & {
  href?: NextLinkProps["href"];
  to?: NextLinkProps["href"];
  children: ReactNode;
  className?: string;
};

export function Link({ to, href, ...props }: LinkProps) {
  return <NextLink href={href ?? to ?? "#"} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  }, [router]);
}

export function useLocation(): LocationState {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const pathname = currentPathname ?? "/";
  const search = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  return useMemo(() => ({ pathname, search }), [pathname, search]);
}

export function useParams(): Record<string, string | undefined> {
  const params = useNextParams();
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return normalized;
}
