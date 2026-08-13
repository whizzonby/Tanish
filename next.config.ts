import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the dev-only on-screen route indicator badge. Has no effect in
  // production builds — that indicator never renders there anyway.
  devIndicators: false,
  // isomorphic-dompurify wraps jsdom, which needs native Node.js require()
  // rather than being bundled — bundling it crashes the server worker.
  serverExternalPackages: ["isomorphic-dompurify"],
  experimental: {
    serverActions: {
      // Default 1MB is too small for real photo uploads (admin media
      // uploads go through a Server Action — see lib/storage.ts).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
