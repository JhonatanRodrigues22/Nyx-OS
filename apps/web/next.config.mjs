import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  transpilePackages: [
    "@nyx-os/ai",
    "@nyx-os/automation",
    "@nyx-os/capabilities",
    "@nyx-os/config",
    "@nyx-os/context",
    "@nyx-os/core",
    "@nyx-os/event-bus",
    "@nyx-os/knowledge",
    "@nyx-os/logger",
    "@nyx-os/memory",
    "@nyx-os/plugin",
    "@nyx-os/prompt",
    "@nyx-os/scheduler",
    "@nyx-os/state",
    "@nyx-os/tools",
    "@nyx-os/workflow"
  ]
};

export default withPWA(nextConfig);
