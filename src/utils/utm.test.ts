import { describe, expect, it } from "vitest";
import { inferSourceFromClickId, inferSourceFromReferrer } from "./utm";

describe("inferSourceFromReferrer", () => {
  it("recognizes major social/search referrers regardless of subdomain", () => {
    expect(inferSourceFromReferrer("https://www.instagram.com/")).toBe("instagram");
    expect(inferSourceFromReferrer("https://l.instagram.com/foo")).toBe("instagram");
    expect(inferSourceFromReferrer("https://m.facebook.com/")).toBe("facebook");
    expect(inferSourceFromReferrer("https://www.threads.net/")).toBe("threads");
    expect(inferSourceFromReferrer("https://x.com/")).toBe("twitter");
    expect(inferSourceFromReferrer("https://t.co/abc")).toBe(null);
    expect(inferSourceFromReferrer("https://www.youtube.com/")).toBe("youtube");
    expect(inferSourceFromReferrer("https://blog.naver.com/foo")).toBe("naver");
    expect(inferSourceFromReferrer("https://talk.kakao.com/")).toBe("kakaotalk");
    expect(inferSourceFromReferrer("https://band.us/band/123")).toBe("band");
    expect(inferSourceFromReferrer("https://www.google.com/search?q=wings")).toBe("google");
    expect(inferSourceFromReferrer("https://www.google.co.kr/search?q=wings")).toBe("google");
  });

  it("does not false-positive on lookalike or unrelated domains", () => {
    expect(inferSourceFromReferrer("https://notgoogle.com/")).toBe(null);
    expect(inferSourceFromReferrer("https://xinstagram.com/")).toBe(null);
    expect(inferSourceFromReferrer("https://example.com/")).toBe(null);
  });

  it("returns null for missing or malformed referrers", () => {
    expect(inferSourceFromReferrer(null)).toBe(null);
    expect(inferSourceFromReferrer("")).toBe(null);
    expect(inferSourceFromReferrer("not-a-url")).toBe(null);
  });
});

describe("inferSourceFromClickId", () => {
  it("infers facebook from fbclid and google from gclid", () => {
    expect(inferSourceFromClickId(new URLSearchParams("fbclid=abc"))).toBe("facebook");
    expect(inferSourceFromClickId(new URLSearchParams("gclid=abc"))).toBe("google");
  });

  it("returns null when no known click id is present", () => {
    expect(inferSourceFromClickId(new URLSearchParams("foo=bar"))).toBe(null);
  });
});
