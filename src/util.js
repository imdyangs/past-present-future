// --- Debug helper: parse markdown reading + log structure ---
export function debugParseReadingMarkdown(markdown) {
    if (!markdown) {
        console.warn("[debugParseReadingMarkdown] empty input");
        return { sections: [], footer: "" };
    }

    // Important: use escaped newlines, not literal newlines inside quotes
    const text = String(markdown).replace(/\r/g, "");
    const lines = text.split("\n");

    const sections = [];
    let current = null;

    const flush = () => {
        if (!current) return;

        const paragraphs = [];
        let buf = [];

        for (const line of current.body) {
            const t = String(line).trim();

            if (!t) {
                if (buf.length) {
                    paragraphs.push(buf.join("\n"));
                    buf = [];
                }
                continue;
            }

            if (t === "---") continue;
            buf.push(t);
        }

        if (buf.length) paragraphs.push(buf.join("\n"));

        sections.push({ heading: current.heading, paragraphs });
        current = null;
    };

    let footer = "";

    for (const rawLine of lines) {
        const line = String(rawLine).trim();

        if (
            line.toLowerCase().startsWith("for reflection") &&
            line.toLowerCase().includes("not certainty")
        ) {
            footer = line;
            continue;
        }

        if (line.startsWith("### ")) {
            flush();
            current = { heading: line.slice(4).trim(), body: [] };
            continue;
        }

        if (current) current.body.push(rawLine);
    }

    flush();

    console.group("[debugParseReadingMarkdown]");
    console.log("sections:", sections);
    console.log("footer:", footer);
    console.groupEnd();

    return { sections, footer };
}


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

export async function getCachedImageUrl(cardId, specialUrl) {
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
