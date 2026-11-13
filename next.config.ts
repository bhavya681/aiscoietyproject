import type { NextConfig } from "next";

/**
 * CORS for the public JSON API.
 *
 * The mobile client authenticates with `Authorization: Bearer`, so requests
 * are not credentialed: a wildcard origin is correct and avoids the browser
 * rule that forbids `*` together with `Access-Control-Allow-Credentials`.
 * The browser app keeps using its same-origin httpOnly cookie.
 *
 * These headers are emitted by `next dev` and on Vercel alike, unlike
 * `vercel.json` which only applies after deployment.
 */
const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, X-Client-Platform, Authorization",
  },
  { key: "Access-Control-Max-Age", value: "86400" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: corsHeaders,
      },
    ];
  },
};

export default nextConfig;
