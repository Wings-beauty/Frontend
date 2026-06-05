"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

const ROUTE_STATE_PREFIX = "wings_route_state:";

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type LocationState = {
  pathname: string;
  search: string;
  state: unknown;
};

type LinkProps = Omit<NextLinkProps, "href"> & {
  href?: NextLinkProps["href"];
  to?: NextLinkProps["href"];
  children: ReactNode;
  className?: string;
};

function stateKey(pathname: string) {
  return `${ROUTE_STATE_PREFIX}${pathname}`;
}

function readRouteState(pathname: string) {
  if (typeof window === "undefined") return null;
  const rawValue = window.sessionStorage.getItem(stateKey(pathname));
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function Link({ to, href, ...props }: LinkProps) {
  return <NextLink href={href ?? to ?? "#"} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    if (options?.state !== undefined) {
      window.sessionStorage.setItem(stateKey(to), JSON.stringify(options.state));
    }
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  };
}

export function useLocation(): LocationState {
  const currentPathname = usePathname();
  const pathname = currentPathname ?? "/";
  const search = typeof window === "undefined" ? "" : window.location.search;
  const [state] = useState(() => readRouteState(pathname));
  return useMemo(() => ({ pathname, search, state }), [pathname, search, state]);
}

export function useParams(): Record<string, string | undefined> {
  const params = useNextParams();
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return normalized;
}
