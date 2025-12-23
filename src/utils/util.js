// --- Image URL resolution + caching (redirect → final Wikimedia URL) ---
const IMG_CACHE_KEY = "tarot-img-url-cache-v1";

function loadImgCache() {
  try {
    return JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveImgCache(cache) {
  localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache));
}

async function resolveFinalUrl(specialUrl) {
  // Follow redirect without downloading the image body
  const res = await fetch(specialUrl, { method: "HEAD", redirect: "follow" });
  return res.url || specialUrl;
}

async function getCachedImageUrl(cardId, specialUrl) {
  const cache = loadImgCache();
  if (cache[cardId]) return cache[cardId];

  try {
    const finalUrl = await resolveFinalUrl(specialUrl);
    cache[cardId] = finalUrl;
    saveImgCache(cache);
    return finalUrl;
  } catch {
    return specialUrl;
  }
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export async function preloadSpreadCards(cards) {
  // Resolve redirect URLs first (cached), then preload the actual image bytes.
  const withResolved = await Promise.all(
    cards.map(async (c) => {
      const resolved = await getCachedImageUrl(c.id, c.img);
      return { ...c, img: resolved };
    })
  );

  await Promise.all(withResolved.map((c) => preloadImage(c.img)));
  return withResolved;
}


export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function getLoadingPhaseText(elapsedMs) {
  if (elapsedMs < 2500) return "Connecting to the reader…";
  if (elapsedMs < 10000) return "Interpreting your spread…";
  if (elapsedMs < 20000) return "Writing the story across time…";
  return "Still working — this sometimes takes a bit.";
}
