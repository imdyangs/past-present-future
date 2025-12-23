// src/App.jsx
import { useState, useEffect, useRef } from "react";
import { getDeck } from "./data/decks";
import { fetchReadingFromApi, fetchHealth } from "./api";
import { formatElapsed, getLoadingPhaseText, preloadSpreadCards } from "./utils/util";
import { debugParseReadingMarkdown, renderInlineMarkdown } from "./utils/markdownUtil"
import { clarityEvent, claritySet, waitBucket, spreadTag } from './utils/clarityUtil'

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

function SkeletonLine({ w = "100%", h = 12 }) {
  return (
    <div
      className="relative overflow-hidden rounded-full bg-neutral-900/80"
      style={{ width: w, height: h }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-[60%] animate-[shimmer_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function ReadingModal({ open, onClose, title, sections, footer, loading, loadingText, elapsedMs }) {
  useEscape(() => {
    if (open) onClose?.();
  });

  if (!open) return null;

  const allSections = Array.isArray(sections) ? sections : [];
  const ppfSections = allSections.slice(0, 3);
  const restSections = allSections.slice(3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Reading"}
    >
      {/* backdrop (vignette + blur) */}
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close reading"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 40%, rgba(255,255,255,0.06), transparent 70%), radial-gradient(110% 90% at 50% 110%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />

      {/* panel */}
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-[0_30px_120px_rgba(0,0,0,0.75)] overflow-hidden animate-[settle_180ms_ease-out]"
        style={{
          boxShadow:
            "0 30px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* subtle gradient ring */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0.02))",
            opacity: 0.08,
          }}
        />
        {/* soft header wash */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.0))",
          }}
        />

        <div className="relative flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-600" />
              Your Reading
            </div>
            {title ? (
              <h2 className="mt-3 text-2xl md:text-3xl font-light tracking-tight">
                {title}
              </h2>
            ) : null}

            {loading ? (
              <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-neutral-700 animate-pulse" />
                  {loadingText || "Generating…"}
                </span>
                <span className="text-neutral-700">·</span>
                <span className="font-mono tracking-normal text-neutral-500">{formatElapsed(elapsedMs || 0)}</span>
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:border-neutral-600 hover:bg-neutral-900/50 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="relative px-6 pb-6 pt-5 max-h-[75vh] overflow-y-auto">
          <div className="space-y-7">
            {loading ? (
              <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/30 p-5 md:p-6">
                <div className="space-y-6">
                  {POSITIONS.map((pos, i) => (
                    <div
                      key={pos}
                      className={i === 0 ? "" : "pt-5 border-t border-neutral-800/60"}
                    >
                      <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-300">
                        {pos}
                      </h3>
                      <div className="mt-3 space-y-3">
                        <SkeletonLine w="92%" />
                        <SkeletonLine w="84%" />
                        <SkeletonLine w="78%" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between gap-4 text-xs tracking-wide text-neutral-500">
                    <span>Listening for the pattern — usually 15–30 seconds</span>
                    <span className="text-neutral-700">You can keep reading the cards while this loads.</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* past / present / future as one visual section */}
                {ppfSections.length > 0 ? (
                  <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/30 p-5 md:p-6">
                    <div className="space-y-6">
                      {ppfSections.map((sec, i) => (
                        <div
                          key={i}
                          className={i === 0 ? "" : "pt-5 border-t border-neutral-800/60"}
                        >
                          {sec.heading ? (
                            <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-300">
                              {sec.heading}
                            </h3>
                          ) : null}
                          {(sec.paragraphs || []).map((p, j) => (
                            <p
                              key={j}
                              className="mt-3 text-base leading-relaxed text-neutral-200"
                            >
                              {renderInlineMarkdown(p)}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* everything else */}
                {restSections.map((sec, i) => (
                  <div key={`rest-${i}`} className="space-y-2.5">
                    {sec.heading ? (
                      <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-neutral-800" />
                        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-300">
                          {sec.heading}
                        </h3>
                      </div>
                    ) : null}
                    {(sec.paragraphs || []).map((p, j) => (
                      <p key={j} className="text-base leading-relaxed text-neutral-200">
                        {renderInlineMarkdown(p)}
                      </p>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>

          {footer ? (
            <div className="mt-8 pt-5 border-t border-neutral-800">
              <p className="text-sm text-neutral-400 leading-relaxed text-center tracking-wide">
                {footer}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Shimmer keyframes (Tailwind arbitrary animation uses this name)
const animStyle = `@keyframes shimmer { 0% { transform: translateX(-60%); } 100% { transform: translateX(60%); } }
@keyframes settle { 0% { transform: translateY(10px) scale(0.985); filter: blur(1px); opacity: 0.0; } 100% { transform: translateY(0px) scale(1); filter: blur(0px); opacity: 1.0; } }

/* CTA loading micro-animations */
@keyframes breathe {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}
@keyframes ellipsis {
  0% { content: ""; }
  33% { content: "."; }
  66% { content: ".."; }
  100% { content: "..."; }
}`;

function TarotCard({ card, position, index = 0 }) {
  return (
    <div
      className="bg-neutral-950 p-4 flex flex-col h-full"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
        {position}
      </h2>

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
        <h3 className="text-xl font-light tracking-tight leading-snug mb-2 min-h-[2.75rem]">
          {card.name}
        </h3>

        {/* short meaning */}
        <p className="text-base text-neutral-300 leading-relaxed">{card.meaning}</p>

        {/* long description (optional) */}
        {card.description && (
          <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TarotApp() {
  const [isReadingOpen, setIsReadingOpen] = useState(false);
  // If the user closes the modal while an API read is in-flight, reopen it automatically when done.
  const [reopenReadingWhenDone, setReopenReadingWhenDone] = useState(false);

  // Refs to avoid stale state inside long async handlers
  const isReadingOpenRef = useRef(false);
  const reopenReadingWhenDoneRef = useRef(false);
  const [reading, setReading] = useState({ title: "", sections: [], footer: "" });

  const [spread, setSpread] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Cache key for the currently revealed spread
  const [revealCacheKey, setRevealCacheKey] = useState(null);

  // Cache the most recent API response for the currently revealed spread
  const [readingCacheKey, setReadingCacheKey] = useState(null);
  const [cachedApiReading, setCachedApiReading] = useState(null);

  // Reading CTA loading + errors
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState("");

  // Loading UX: elapsed timer + phased copy
  const [readingElapsedMs, setReadingElapsedMs] = useState(0);
  const [readingLoadingText, setReadingLoadingText] = useState("");

  // Instrumentation refs
  const readingRequestStartMsRef = useRef(0);

  useEffect(() => {
    // Health check on page load
    fetchHealth()
      .then((res) => {
        console.log("[health] API reachable:", res);
      })
      .catch((err) => {
        console.warn("[health] API not reachable:", err);
      });

    const saved = localStorage.getItem("tarot-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tarot-history", JSON.stringify(history));
  }, [history]);

  // Keep refs in sync with state (prevents stale closure issues in long async reads)
  useEffect(() => {
    isReadingOpenRef.current = isReadingOpen;
  }, [isReadingOpen]);

  useEffect(() => {
    reopenReadingWhenDoneRef.current = reopenReadingWhenDone;
  }, [reopenReadingWhenDone]);

  useEffect(() => {
    if (!isReadingLoading) return;

    const start = performance.now();
    setReadingElapsedMs(0);
    setReadingLoadingText(getLoadingPhaseText(0));

    const id = window.setInterval(() => {
      const ms = performance.now() - start;
      setReadingElapsedMs(ms);
      setReadingLoadingText(getLoadingPhaseText(ms));
    }, 250);

    return () => window.clearInterval(id);
  }, [isReadingLoading]);

  const drawSpread = async () => {
    clarityEvent("reveal");
    claritySet("deck", ACTIVE_DECK_ID);
    // Generate a new cache key for each Reveal click
    const newCacheKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setRevealCacheKey(newCacheKey);

    // New reveal => invalidate cached reading
    setReadingCacheKey(null);
    setCachedApiReading(null);
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

    // Associate this spread with the current reveal cache key
    console.log("[reveal] cache key:", newCacheKey);
    setHistory([{ timestamp, deckId: ACTIVE_DECK_ID, cards: ready }, ...history]);
    setIsDrawing(false);
  };

  const openReadingModal = (nextReading) => {
    // Opening explicitly cancels any pending "reopen when done" intent.
    setReopenReadingWhenDone(false);
    reopenReadingWhenDoneRef.current = false;

    setReading(nextReading);
    setIsReadingOpen(true);
    isReadingOpenRef.current = true;
  };

  const maybeReopenReadingModal = () => {
    if (reopenReadingWhenDoneRef.current) {
      setIsReadingOpen(true);
      isReadingOpenRef.current = true;
      setReopenReadingWhenDone(false);
      reopenReadingWhenDoneRef.current = false;
    }
  };

  const buildPromptPayload = () => {
    if (!spread || spread.length !== 3) return null;
    const [past, present, future] = spread;

    // Match the API signature: fetchReadingFromApi(spread)
    // (The API will wrap as { spread: <this> })
    return {
      type: "Past–Present–Future",
      cards: [
        {
          position: "PAST",
          id: past.id,
          name: past.name,
          arcana: past.arcana,
          number: past.arcana === "Major" ? past.number : undefined,
          meaning: past.meaning,
          description: past.description || "",
        },
        {
          position: "PRESENT",
          id: present.id,
          name: present.name,
          arcana: present.arcana,
          number: present.arcana === "Major" ? present.number : undefined,
          meaning: present.meaning,
          description: present.description || "",
        },
        {
          position: "FUTURE",
          id: future.id,
          name: future.name,
          arcana: future.arcana,
          number: future.arcana === "Major" ? future.number : undefined,
          meaning: future.meaning,
          description: future.description || "",
        },
      ],
    };
  };

  const fallbackReading = () => {
    const [past, present, future] = spread;

    const title = `${POSITIONS[0]} · ${POSITIONS[1]} · ${POSITIONS[2]}`;

    const sections = [
      {
        heading: `PAST — ${past.meaning}`,
        paragraphs: [
          "This card suggests a period where you needed to retreat—not to escape, but to see. It can point to necessary solitude: sifting through noise to reconnect with your inner voice. There’s a sense of shedding distractions so you could remember what actually guides you.",
        ],
      },
      {
        heading: `PRESENT — ${present.meaning}`,
        paragraphs: [
          "Now, focus narrows. You’re in a phase of disciplined iteration—working patiently on the foundations of something that matters. This isn’t about speed; it’s about refinement. The card invites you to ask: Where does attention to detail feel like devotion, not drudgery?",
        ],
      },
      {
        heading: `FUTURE — ${future.meaning}`,
        paragraphs: [
          "A gentle shift awaits. After invested effort and inner realignment, this points to renewal—not sudden miracles, but a quieter assurance. It speaks to trusting your path again, even if the destination isn’t fully visible. Small, consistent acts of self-trust matter.",
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

    return { title, sections, footer: "For reflection — not certainty. 🌱" };
  };

  // Images are preloaded as a batch; no per-card load callback needed.
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <ReadingModal
        open={isReadingOpen}
        onClose={() => {
          // If user closes while loading, remember to reopen when the reading arrives.
          if (isReadingLoading) {
            clarityEvent("reading_closed_while_loading");
            setReopenReadingWhenDone(true);
            reopenReadingWhenDoneRef.current = true;
          }
          setIsReadingOpen(false);
          isReadingOpenRef.current = false;
        }}
        title={reading.title}
        sections={reading.sections}
        footer={reading.footer}
        loading={isReadingLoading}
        loadingText={readingLoadingText}
        elapsedMs={readingElapsedMs}
      />

      <style>{animStyle}</style>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
          Past · Present · Future
        </h1>
        <p className="sr-only">Tarot reading</p>

        {/* Co–Star-style section divider */}
        <div className="h-px w-full bg-neutral-800/50 mb-8" />

        <div className="mb-2 md:mb-4">
          <button
            onClick={drawSpread}
            disabled={isDrawing}
            className="group relative text-left disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">
              What’s unfolding
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl md:text-3xl font-light tracking-tight text-neutral-200 group-hover:text-neutral-100 transition">
                Reveal
              </span>
              <span className="inline-block h-px w-12 bg-neutral-700 group-hover:w-20 transition-all duration-300" />
            </div>
          </button>
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
                className="group w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/60 px-6 py-6 text-center transition hover:border-neutral-600 hover:bg-neutral-950 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isReadingLoading}
                onClick={async () => {
                  if (!spread || spread.length !== 3) return;

                  clarityEvent("get_reading");
                  claritySet("deck", ACTIVE_DECK_ID);
                  const sTag = spreadTag(spread);
                  if (sTag) claritySet("spread", sTag);
                  readingRequestStartMsRef.current = performance.now();

                  // Open modal immediately (B): users should never wonder if click worked.
                  // Also clear any pending "reopen when done" from a prior run.
                  setReopenReadingWhenDone(false);
                  openReadingModal({
                    title: POSITIONS.join(" · "),
                    sections: [],
                    footer: "For reflection — not certainty. 🌱",
                  });

                  // If the reveal cache key hasn't changed, reuse the cached API result
                  // (i.e., same revealed cards => same reading)
                  const key = revealCacheKey || spread.map((c) => c?.id).join("|");
                  if (cachedApiReading && readingCacheKey === key) {
                    clarityEvent("reading_cache_hit");
                    claritySet("reading_source", "cache");
                    console.log("[reading] cache hit:", key);
                    console.log("[reading] raw api response:", cachedApiReading);

                    const cachedMd =
                      cachedApiReading?.text ??
                      cachedApiReading?.raw?.choices?.[0]?.message?.content ??
                      "";

                    const parsed = debugParseReadingMarkdown(cachedMd);
                    if (parsed?.sections?.length) {
                      const withMeanings = parsed.sections.map((sec, idx) => {
                        if (idx < 3 && spread[idx]?.meaning) {
                          return {
                            ...sec,
                            heading: `${sec.heading} ${spread[idx].meaning}`,
                          };
                        }
                        return sec;
                      });

                      setReading({
                        title: POSITIONS.join(" · "),
                        sections: withMeanings,
                        footer: parsed.footer || "For reflection — not certainty. 🌱",
                      });

                      const waitMs = performance.now() - (readingRequestStartMsRef.current || performance.now());
                      clarityEvent("reading_loaded");
                      claritySet("reading_wait_bucket", waitBucket(waitMs));
                      if (isReadingOpenRef.current) clarityEvent("reading_waited");

                      clarityEvent("reading_loaded");
                      claritySet("reading_wait_bucket", "0-1s");
                      // If the reading is visible when it arrives, count as "waited".
                      if (isReadingOpenRef.current) clarityEvent("reading_waited");

                      // If the user closed the modal while we were loading, reopen now.
                      maybeReopenReadingModal();
                    } else {
                      setReading(fallbackReading());
                      clarityEvent("reading_fallback_used");
                      claritySet("reading_source", "fallback");
                    }

                    // If the user closed the modal while we were loading, reopen now.
                    maybeReopenReadingModal();

                    return;
                  }

                  setReadingError("");
                  setIsReadingLoading(true);

                  try {
                    // 1) Build payload for your API
                    const payload = buildPromptPayload();

                    // 2) Call your LLM-backed API (Cloudflare worker / OpenRouter proxy)
                    const apiReading = await fetchReadingFromApi(payload);

                    claritySet("reading_source", "api");

                    // Save for reuse if the cards (reveal) haven't changed
                    setReadingCacheKey(key);
                    setCachedApiReading(apiReading);

                    // Debug: your worker returns { model, text, raw }
                    console.log("[reading] raw api response:", apiReading);

                    const md =
                      apiReading?.text ??
                      apiReading?.raw?.choices?.[0]?.message?.content ??
                      "";

                    const parsed = debugParseReadingMarkdown(md);

                    if (parsed?.sections?.length) {
                      const withMeanings = parsed.sections.map((sec, idx) => {
                        if (idx < 3 && spread[idx]?.meaning) {
                          return {
                            ...sec,
                            heading: `${sec.heading} ${spread[idx].meaning}`,
                          };
                        }
                        return sec;
                      });

                      setReading({
                        title: POSITIONS.join(" · "),
                        sections: withMeanings,
                        footer: parsed.footer || "For reflection — not certainty. 🌱",
                      });

                      // If the user closed the modal while we were loading, reopen now.
                      maybeReopenReadingModal();
                    } else {
                      setReading(fallbackReading());
                      clarityEvent("reading_fallback_used");
                      claritySet("reading_source", "fallback_parse");
                      maybeReopenReadingModal();
                    }
                  } catch (err) {
                    // Keep UI calm: fall back, but also show a subtle error
                    setReadingError(
                      "Couldn’t reach the reading service. Showing a local reflection instead."
                    );
                    clarityEvent("reading_api_error");
                    claritySet("reading_source", "fallback_error");
                    setReading(fallbackReading());
                    maybeReopenReadingModal();
                  } finally {
                    setIsReadingLoading(false);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100">
                    {isReadingLoading ? (
                      <span className="inline-flex items-center gap-1 animate-[breathe_2.4s_ease-in-out_infinite]">
                        Reading<span className="w-3 text-left after:content-[''] after:animate-[ellipsis_1.4s_steps(1,end)_infinite]"></span>
                      </span>
                    ) : "Get a reading"}
                  </span>
                  <span className="inline-block h-px w-12 bg-neutral-600 group-hover:w-20 transition-all duration-300" />
                  <span className="text-xs tracking-wide text-neutral-400">
                    For reflection — not certainty.
                  </span>
                </div>
              </button>
            </div>

            {readingError ? (
              <div className="-mt-10 mb-10 flex justify-center">
                <div className="max-w-md text-center text-xs tracking-wide text-neutral-500">
                  {readingError}
                </div>
              </div>
            ) : null}
          </>
        )}

        {history.length > 0 && (
          <div>
            {/* Co–Star-style section divider */}
            <div className="h-px w-full bg-neutral-800/50 mb-8" />

            <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">
              History
            </h2>
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
