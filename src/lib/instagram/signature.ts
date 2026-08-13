import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PREFIX = "sha256=";

export function verifyInstagramWebhookSignature(rawBody: string, signature: string | null, appSecret: string | undefined) {
  if (!signature?.startsWith(SIGNATURE_PREFIX) || !appSecret) {
    return false;
  }

  const expected = `${SIGNATURE_PREFIX}${createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")}`;
  const received = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}
