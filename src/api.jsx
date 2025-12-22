// src/lib/api.js

// - In dev:     https://hidden-wind-bd08.d65yang.workers.dev/
// - Localhost:  http://localhost:8787/

const DEV_API_URL = "https://hidden-wind-bd08.d65yang.workers.dev";
const LOCAL_API_URL = "http://localhost:8787";

export function getApiBase() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return LOCAL_API_URL;
  }
  return DEV_API_URL;
}

/**
 * Health check
 */
export async function fetchHealth() {
  const base = getApiBase();
  const res = await fetch(`${base}/health`, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Health check failed ${res.status}: ${text || res.statusText}`);
  }

  // health returns plain text ("ok")
  return res.text();
}

/**
 * Tarot reading
 */
export async function fetchReadingFromApi(spread) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/reading`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spread }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
