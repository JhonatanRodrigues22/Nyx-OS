export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  if (process.env.NYX_ENABLE_LOCAL_GATEWAY?.trim().toLowerCase() !== "true") {
    return;
  }

  const { getCockpitRuntime } = await import("@/server/cockpitRuntime");

  getCockpitRuntime();
}
