import { POPUP_EVENT } from "../constants/popup";

export type PopupAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_path: string | null;
};

const STORAGE_KEY = `wings_popup_attribution_${POPUP_EVENT.key}`;
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const REFERRER_SOURCE_DOMAINS: readonly [domain: string, source: string][] = [
  ["instagram.com", "instagram"],
  ["facebook.com", "facebook"],
  ["threads.net", "threads"],
  ["twitter.com", "twitter"],
  ["x.com", "twitter"],
  ["youtube.com", "youtube"],
  ["naver.com", "naver"],
  ["kakao.com", "kakaotalk"],
  ["kakaocorp.com", "kakaotalk"],
  ["band.us", "band"],
];

function hostnameMatchesDomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

/** 리퍼러(문서 유입 출처)나 광고 클릭 ID로 utm_source가 비어 있을 때의 유입 경로를 추정한다. */
export function inferSourceFromReferrer(referrer: string | null): string | null {
  if (!referrer) {
    return null;
  }

  let hostname: string;

  try {
    hostname = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }

  if (/(^|\.)google\./.test(hostname)) {
    return "google";
  }

  const match = REFERRER_SOURCE_DOMAINS.find(([domain]) =>
    hostnameMatchesDomain(hostname, domain),
  );

  return match?.[1] ?? null;
}

/** 광고 클릭 ID(fbclid/gclid)로 utm_source가 비어 있을 때의 유입 경로를 추정한다. */
export function inferSourceFromClickId(params: URLSearchParams): string | null {
  if (params.has("fbclid")) return "facebook";
  if (params.has("gclid")) return "google";

  return null;
}

function readStored(): PopupAttribution | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? (JSON.parse(stored) as PopupAttribution) : null;
  } catch {
    return null;
  }
}

function collect(): PopupAttribution {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)?.slice(0, 200) || null]),
  ) as Pick<PopupAttribution, (typeof UTM_KEYS)[number]>;
  const referrer = document.referrer.slice(0, 500) || null;

  return {
    ...utm,
    utm_source:
      utm.utm_source ?? inferSourceFromClickId(params) ?? inferSourceFromReferrer(referrer),
    referrer,
    landing_path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
  };
}

/** 최초 유입(first-touch)만 저장하고, 이미 저장돼 있으면 그대로 반환한다. */
export function captureAttribution(): PopupAttribution {
  const stored = readStored();

  if (stored) {
    return stored;
  }

  const attribution = collect();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // 저장소를 쓸 수 없어도 현재 방문의 유입 정보는 그대로 사용한다.
  }

  return attribution;
}
