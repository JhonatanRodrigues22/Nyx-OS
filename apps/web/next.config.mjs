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
  transpilePackages: [
    "@nyx-os/config",
    "@nyx-os/core",
    "@nyx-os/event-bus",
    "@nyx-os/events",
    "@nyx-os/logger",
    "@nyx-os/plugin",
    "@nyx-os/state"
  ]
};

export default withPWA(nextConfig);
