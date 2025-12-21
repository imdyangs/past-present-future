// src/App.jsx
import { useState, useEffect } from "react";
import { getDeck } from "./data/decks";

// Tailwind doesn't ship this keyframe by default; we inline a tiny utility via an arbitrary animation.
// (Used in the shimmer overlay.)

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

// --- Cards (imported from deck module) ---
const ACTIVE_DECK_ID = "riderWaite";
const ACTIVE_DECK = getDeck(ACTIVE_DECK_ID);
const CARDS = ACTIVE_DECK.cards;

const POSITIONS = ["Past", "Present", "Future"]; 

// --- Modal helpers ---
function useEscape(handler) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handler?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

function ReadingModal({ open, onClose, title, sections, footer }) {
  useEscape(() => {
    if (open) onClose?.();
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Reading"}
    >
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close reading"
      />

      {/* panel */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Your Reading</div>
            {title ? <h2 className="mt-2 text-2xl md:text-3xl font-light tracking-tight">{title}</h2> : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:border-neutral-600 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 pt-5 max-h-[75vh] overflow-y-auto">
          <div className="space-y-6">
            {(sections || []).map((sec, i) => (
              <div key={i} className="space-y-2">
                {sec.heading ? (
                  <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">{sec.heading}</h3>
                ) : null}
                {(sec.paragraphs || []).map((p, j) => (
                  <p key={j} className="text-base leading-relaxed text-neutral-200">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {footer ? (
            <div className="mt-8 pt-5 border-t border-neutral-800">
              <p className="text-sm text-neutral-400 leading-relaxed">{footer}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


// Shimmer keyframes (Tailwind arbitrary animation uses this name)
const animStyle = `@keyframes shimmer { 0% { transform: translateX(-60%); } 100% { transform: translateX(60%); } }
@keyframes settle { 0% { transform: translateY(6px) scale(0.99); filter: blur(1px); opacity: 0.0; } 100% { transform: translateY(0px) scale(1); filter: blur(0px); opacity: 1.0; } }`;

function TarotCard({ card, position, index = 0 }) {
  return (
    <div className="bg-neutral-950 p-4 flex flex-col h-full" style={{ transitionDelay: `${index * 80}ms` }}>
      <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-4">{position}</h2>

      {/* Image only renders after the whole spread has been preloaded */}
      <div className="relative rounded-xl overflow-hidden mb-3 group aspect-[3/5] bg-neutral-950">
        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-1">
          <img
            src={card.img}
            alt={card.name}
            decoding="async"
            loading="eager"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col flex-grow">
        <h3 className="text-xl font-light tracking-tight leading-snug mb-2 min-h-[2.75rem]">{card.name}</h3>

        {/* short meaning */}
        <p className="text-base text-neutral-300 leading-relaxed">{card.meaning}</p>

        {/* long description (optional) */}
        {card.description && <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{card.description}</p>}
      </div>
    </div>
  );
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function preloadSpreadCards(cards) {
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

export default function TarotApp() {
  const [isReadingOpen, setIsReadingOpen] = useState(false);
  const [reading, setReading] = useState({ title: "", sections: [], footer: "" });

  const [spread, setSpread] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tarot-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tarot-history", JSON.stringify(history));
  }, [history]);

  const drawSpread = async () => {
    const start = performance.now();
    setIsDrawing(true);
    setSpread([]); // don't render any images until all 3 are ready

    const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
    const draw = shuffled.slice(0, 3);
    const timestamp = new Date().toISOString();

    const ready = await preloadSpreadCards(draw);

    // Ensure loading state lasts at least 200ms
    const elapsed = performance.now() - start;
    if (elapsed < 200) {
      await new Promise((res) => setTimeout(res, 200 - elapsed));
    }

    setSpread(ready);
    setHistory([{ timestamp, deckId: ACTIVE_DECK_ID, cards: ready }, ...history]);
    setIsDrawing(false);
  };
  // Images are preloaded as a batch; no per-card load callback needed.

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <ReadingModal
        open={isReadingOpen}
        onClose={() => setIsReadingOpen(false)}
        title={reading.title}
        sections={reading.sections}
        footer={reading.footer}
      />
      <style>{animStyle}</style>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">Past · Present · Future</h1>
        <p className="sr-only">Tarot reading</p>

        {/* Co–Star-style section divider */}
        <div className="h-px w-full bg-neutral-800/50 mb-8" />

        <div className="mb-6 md:mb-8">
          <button
            onClick={drawSpread}
            disabled={isDrawing}
            className="group relative text-left disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">What’s unfolding</div>
            <div className="flex items-center gap-4">
              <span className="text-2xl md:text-3xl font-light tracking-tight text-neutral-200 group-hover:text-neutral-100 transition">
                Reveal
              </span>
              <span className="inline-block h-px w-12 bg-neutral-700 group-hover:w-20 transition-all duration-300" />
            </div>
          </button>

          {isDrawing && (
            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Drawing</div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-10">
                {POSITIONS.map((label) => (
                  <div key={label} className="bg-neutral-950 p-4 flex flex-col h-full">
                    <div className="text-sm uppercase tracking-widest text-neutral-600 mb-4">{label}</div>

                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-[3/5] bg-neutral-900/40">
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                          animation: "shimmer 1.2s linear infinite",
                        }}
                      />
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-col flex-grow">
                      <div className="h-6 w-2/3 bg-neutral-900/40 rounded-sm" />
                      <div className="mt-3 h-4 w-4/5 bg-neutral-900/30 rounded-sm" />
                      <div className="mt-2 h-4 w-3/5 bg-neutral-900/30 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isDrawing && spread.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6 md:mb-8">
              {spread.map((card, i) => (
                <TarotCard key={card.id} card={card} position={POSITIONS[i]} index={i} />
              ))}
            </div>

            {/* AI Reading CTA */}
            <div className="mb-12 md:mb-16 flex justify-center">
              <button
                className="group w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/60 px-6 py-6 text-center transition hover:border-neutral-600 hover:bg-neutral-950 focus:outline-none"
                onClick={() => {
                  if (!spread || spread.length !== 3) return;

                  const [past, present, future] = spread;

                  // Placeholder reading (until you wire the LLM).
                  // This mirrors the intended length/tone and uses the current spread.
                  const title = `${POSITIONS[0]} · ${POSITIONS[1]} · ${POSITIONS[2]}`;

                  const sections = [
                    {
                      heading: `PAST — ${past.name}${past.arcana === "Major" ? ` (${past.number})` : ""}`,
                      paragraphs: [
                        "This card suggests a period where you needed to retreat—not to escape, but to see.",
                        "It can point to necessary solitude: sifting through noise to reconnect with your inner voice.",
                        "There’s a sense of shedding distractions so you could remember what actually guides you.",
                      ],
                    },
                    {
                      heading: `PRESENT — ${present.name}`,
                      paragraphs: [
                        "Now, focus narrows.",
                        "You’re in a phase of disciplined iteration—working patiently on the foundations of something that matters.",
                        "This isn’t about speed; it’s about refinement. Where does attention to detail feel like devotion, not drudgery?",
                      ],
                    },
                    {
                      heading: `FUTURE — ${future.name}${future.arcana === "Major" ? ` (${future.number})` : ""}`,
                      paragraphs: [
                        "A gentle shift awaits.",
                        "After invested effort and inner realignment, this points to renewal—not sudden miracles, but a quieter assurance.",
                        "It speaks to trusting your path again, even if the destination isn’t fully visible. Small, consistent acts of self-trust matter.",
                      ],
                    },
                    {
                      heading: "The Thread Connecting Them",
                      paragraphs: [
                        `Your story moves from clarity through reflection (${past.name}) → grounded skill-building (${present.name}) → renewed faith in your direction (${future.name}).`,
                        "It implies an arc of integration: the wisdom gathered in stillness fuels your present focus—and that focus, paired with patience, gradually reconnects you to purpose.",
                      ],
                    },
                    {
                      heading: "One Question to Carry",
                      paragraphs: ["What small act today would honor both your discipline and your hope?"],
                    },
                  ];

                  const footer = "For reflection — not certainty. 🌱";

                  setReading({ title, sections, footer });
                  setIsReadingOpen(true);
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100">Get a reading</span>
                  <span className="inline-block h-px w-12 bg-neutral-600 group-hover:w-20 transition-all duration-300" />
                  <span className="text-xs tracking-wide text-neutral-400">For reflection — not certainty.</span>
                </div>
              </button>
            </div>
          </>
        )}

        {history.length > 0 && (
          <div>
            {/* Co–Star-style section divider */}
            <div className="h-px w-full bg-neutral-800/50 mb-8" />

            <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">History</h2>
            <div className="space-y-0">
              {history.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="py-4 text-sm">
                  <div className="mb-4 flex justify-start">
                    <span className="h-px w-10 bg-neutral-800" />
                  </div>
                  <div className="text-neutral-500 text-xs uppercase tracking-[0.25em] mb-3">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(Array.isArray(entry.cards) ? entry.cards : []).map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 text-xs uppercase tracking-wide text-neutral-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
