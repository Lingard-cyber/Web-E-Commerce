function isLocalhost(value: string) {
  return /(^|\/\/)(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);
}

export function getPublicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_STORE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && !isLocalhost(configured)) {
    try { return new URL(configured).origin; } catch { /* Fall through to the canonical domain. */ }
  }

  const domain = process.env.SITE_DOMAIN?.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "") || "umkmkepuharjo.my.id";
  if (process.env.NODE_ENV === "production") return `https://${domain}`;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = forwardedHost || request.headers.get("host");
  if (host && !isLocalhost(host)) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    return `${forwardedProto === "http" ? "http" : "https"}://${host}`;
  }
  return new URL(request.url).origin;
}
