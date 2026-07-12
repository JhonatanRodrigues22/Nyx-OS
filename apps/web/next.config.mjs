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
    "@nyx-os/capabilities",
    "@nyx-os/config",
    "@nyx-os/core",
    "@nyx-os/event-bus",
    "@nyx-os/logger",
    "@nyx-os/memory",
    "@nyx-os/plugin",
    "@nyx-os/scheduler",
    "@nyx-os/state",
    "@nyx-os/tools"
  ]
};

export default withPWA(nextConfig);
