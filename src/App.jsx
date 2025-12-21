import { useState, useEffect } from "react";
import { RWS_DESCRIPTIONS } from "./data/descriptions";

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

// --- Card Data (extensible) ---
// Rider–Waite images are public domain
// Decks are extensible: add new decks with their own image + meaning sets
const DECKS = {
  riderWaite: {
    id: "riderWaite",
    label: "Rider–Waite (RWS)",
    // Public-domain scans commonly used across Wikipedia/Wikimedia Commons
    majorArcana: [
      { no: "00", name: "The Fool", file: "RWS_Tarot_00_Fool.jpg", meaning: "Beginnings, openness, leap of faith" },
      { no: "01", name: "The Magician", file: "RWS_Tarot_01_Magician.jpg", meaning: "Willpower, skill, making it real" },
      { no: "02", name: "The High Priestess", file: "RWS_Tarot_02_High_Priestess.jpg", meaning: "Intuition, inner knowing, mystery" },
      { no: "03", name: "The Empress", file: "RWS_Tarot_03_Empress.jpg", meaning: "Nurture, abundance, growth" },
      { no: "04", name: "The Emperor", file: "RWS_Tarot_04_Emperor.jpg", meaning: "Structure, authority, stability" },
      { no: "05", name: "The Hierophant", file: "RWS_Tarot_05_Hierophant.jpg", meaning: "Tradition, learning, guidance" },
      { no: "06", name: "The Lovers", file: "RWS_Tarot_06_Lovers.jpg", meaning: "Union, values, choice" },
      { no: "07", name: "The Chariot", file: "RWS_Tarot_07_Chariot.jpg", meaning: "Drive, control, forward motion" },
      { no: "08", name: "Strength", file: "RWS_Tarot_08_Strength.jpg", meaning: "Courage, patience, inner power" },
      { no: "09", name: "The Hermit", file: "RWS_Tarot_09_Hermit.jpg", meaning: "Solitude, insight, guidance" },
      { no: "10", name: "Wheel of Fortune", file: "RWS_Tarot_10_Wheel_of_Fortune.jpg", meaning: "Cycles, change, turning point" },
      { no: "11", name: "Justice", file: "RWS_Tarot_11_Justice.jpg", meaning: "Fairness, truth, consequences" },
      { no: "12", name: "The Hanged Man", file: "RWS_Tarot_12_Hanged_Man.jpg", meaning: "Pause, surrender, new perspective" },
      { no: "13", name: "Death", file: "RWS_Tarot_13_Death.jpg", meaning: "Endings, transformation, release" },
      { no: "14", name: "Temperance", file: "RWS_Tarot_14_Temperance.jpg", meaning: "Balance, blending, moderation" },
      { no: "15", name: "The Devil", file: "RWS_Tarot_15_Devil.jpg", meaning: "Attachment, shadow, temptation" },
      { no: "16", name: "The Tower", file: "RWS_Tarot_16_Tower.jpg", meaning: "Shock, upheaval, truth revealed" },
      { no: "17", name: "The Star", file: "RWS_Tarot_17_Star.jpg", meaning: "Hope, renewal, guidance" },
      { no: "18", name: "The Moon", file: "RWS_Tarot_18_Moon.jpg", meaning: "Uncertainty, dreams, intuition" },
      { no: "19", name: "The Sun", file: "RWS_Tarot_19_Sun.jpg", meaning: "Joy, clarity, success" },
      { no: "20", name: "Judgement", file: "RWS_Tarot_20_Judgement.jpg", meaning: "Awakening, reckoning, renewal" },
      { no: "21", name: "The World", file: "RWS_Tarot_21_World.jpg", meaning: "Completion, integration, wholeness" },
    ],
    minorArcana: {
      Wands: {
        prefix: "Wands",
        suitMeaning: "Drive, action, creativity",
        cards: [
          { n: "01", name: "Ace of Wands", meaning: "Spark, inspiration, new energy" },
          { n: "02", name: "Two of Wands", meaning: "Planning, options, looking ahead" },
          { n: "03", name: "Three of Wands", meaning: "Expansion, progress, momentum" },
          { n: "04", name: "Four of Wands", meaning: "Stability, celebration, home base" },
          { n: "05", name: "Five of Wands", meaning: "Friction, competition, testing" },
          { n: "06", name: "Six of Wands", meaning: "Recognition, win, confidence" },
          { n: "07", name: "Seven of Wands", meaning: "Defense, conviction, holding ground" },
          { n: "08", name: "Eight of Wands", meaning: "Speed, messages, movement" },
          { n: "09", name: "Nine of Wands", meaning: "Resilience, persistence, guarded" },
          { n: "10", name: "Ten of Wands", meaning: "Burden, responsibility, strain" },
          { n: "11", name: "Page of Wands", meaning: "Curiosity, bold start, exploration" },
          { n: "12", name: "Knight of Wands", meaning: "Action, passion, impulsive push" },
          { n: "13", name: "Queen of Wands", meaning: "Confidence, warmth, magnetism" },
          { n: "14", name: "King of Wands", meaning: "Leadership, vision, command" },
        ],
      },
      Cups: {
        prefix: "Cups",
        suitMeaning: "Emotion, connection, intuition",
        cards: [
          { n: "01", name: "Ace of Cups", meaning: "New feeling, openness, love" },
          { n: "02", name: "Two of Cups", meaning: "Bond, mutuality, partnership" },
          { n: "03", name: "Three of Cups", meaning: "Friendship, joy, community" },
          { n: "04", name: "Four of Cups", meaning: "Apathy, reevaluation, pause" },
          { n: "05", name: "Five of Cups", meaning: "Loss, regret, grief" },
          { n: "06", name: "Six of Cups", meaning: "Nostalgia, innocence, past" },
          { n: "07", name: "Seven of Cups", meaning: "Choices, fantasy, overwhelm" },
          { n: "08", name: "Eight of Cups", meaning: "Leaving, seeking, moving on" },
          { n: "09", name: "Nine of Cups", meaning: "Satisfaction, wish, pleasure" },
          { n: "10", name: "Ten of Cups", meaning: "Harmony, family, fulfillment" },
          { n: "11", name: "Page of Cups", meaning: "Tenderness, new feelings, message" },
          { n: "12", name: "Knight of Cups", meaning: "Romance, invitation, idealism" },
          { n: "13", name: "Queen of Cups", meaning: "Empathy, calm, emotional depth" },
          { n: "14", name: "King of Cups", meaning: "Emotional mastery, steadiness" },
        ],
      },
      Swords: {
        prefix: "Swords",
        suitMeaning: "Mind, truth, conflict",
        cards: [
          { n: "01", name: "Ace of Swords", meaning: "Clarity, truth, breakthrough" },
          { n: "02", name: "Two of Swords", meaning: "Stalemate, indecision, guard" },
          { n: "03", name: "Three of Swords", meaning: "Heartbreak, truth hurts" },
          { n: "04", name: "Four of Swords", meaning: "Rest, recovery, retreat" },
          { n: "05", name: "Five of Swords", meaning: "Conflict, ego, hollow win" },
          { n: "06", name: "Six of Swords", meaning: "Transition, moving forward" },
          { n: "07", name: "Seven of Swords", meaning: "Strategy, secrecy, evasion" },
          { n: "08", name: "Eight of Swords", meaning: "Restriction, fear, stuck" },
          { n: "09", name: "Nine of Swords", meaning: "Anxiety, worry, insomnia" },
          { n: "10", name: "Ten of Swords", meaning: "End, collapse, finality" },
          { n: "11", name: "Page of Swords", meaning: "Curiosity, alertness, honesty" },
          { n: "12", name: "Knight of Swords", meaning: "Charge, urgency, bluntness" },
          { n: "13", name: "Queen of Swords", meaning: "Discernment, boundaries, truth" },
          { n: "14", name: "King of Swords", meaning: "Authority, logic, fairness" },
        ],
      },
      Pentacles: {
        prefix: "Pents",
        suitMeaning: "Work, body, money",
        cards: [
          { n: "01", name: "Ace of Pentacles", meaning: "New opportunity, seed, value" },
          { n: "02", name: "Two of Pentacles", meaning: "Balance, juggling, adapt" },
          { n: "03", name: "Three of Pentacles", meaning: "Craft, teamwork, growth" },
          { n: "04", name: "Four of Pentacles", meaning: "Holding, control, security" },
          { n: "05", name: "Five of Pentacles", meaning: "Hardship, lack, isolation" },
          { n: "06", name: "Six of Pentacles", meaning: "Giving, receiving, fairness" },
          { n: "07", name: "Seven of Pentacles", meaning: "Patience, investment, wait" },
          { n: "08", name: "Eight of Pentacles", meaning: "Practice, mastery, focus" },
          { n: "09", name: "Nine of Pentacles", meaning: "Independence, comfort, reward" },
          { n: "10", name: "Ten of Pentacles", meaning: "Legacy, wealth, stability" },
          { n: "11", name: "Page of Pentacles", meaning: "Study, new work, ambition" },
          { n: "12", name: "Knight of Pentacles", meaning: "Consistency, routine, duty" },
          { n: "13", name: "Queen of Pentacles", meaning: "Practical care, abundance" },
          { n: "14", name: "King of Pentacles", meaning: "Security, success, stewardship" },
        ],
      },
    },
  },
};

const ACTIVE_DECK_ID = "riderWaite";

// Wikimedia file URLs include a hashed path we don't want to hardcode.
// Instead, we use the stable Commons "Special:FilePath" redirect.
const commonsFilePath = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const buildDeckCards = (deck) => {
  const majors = deck.majorArcana.map((c) => ({
    id: `maj-${c.no}`,
    arcana: "Major",
    suit: null,
    number: c.no,
    name: c.name,
    meaning: c.meaning,
    img: commonsFilePath(c.file),
  }));

  const minors = [];
  const minor = deck.minorArcana;

  Object.entries(minor).forEach(([suitName, suitDef]) => {
    suitDef.cards.forEach((c) => {
      const file = `${suitDef.prefix}${c.n}.jpg`;
      minors.push({
        id: `min-${suitName.toLowerCase()}-${c.n}`,
        arcana: "Minor",
        suit: suitName,
        number: c.n,
        name: c.name,
        meaning: c.meaning,
        img: commonsFilePath(file),
      });
    });
  });

  return [...majors, ...minors];
};

const ACTIVE_DECK = DECKS[ACTIVE_DECK_ID];
const CARDS = buildDeckCards(ACTIVE_DECK);

const POSITIONS = ["Past", "Present", "Future"];

// Shimmer keyframes (Tailwind arbitrary animation uses this name)
const animStyle = `@keyframes shimmer { 0% { transform: translateX(-60%); } 100% { transform: translateX(60%); } }
@keyframes settle { 0% { transform: translateY(6px) scale(0.99); filter: blur(1px); opacity: 0.0; } 100% { transform: translateY(0px) scale(1); filter: blur(0px); opacity: 1.0; } }`;

function TarotCard({ card, position, index = 0 }) {
  return (
    <div
      className="bg-neutral-950 p-4 flex flex-col h-full"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
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
        <p className="text-base text-neutral-300 leading-relaxed flex-grow">{card.meaning}</p>
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
    setHistory([{ timestamp, cards: ready }, ...history]);
    setIsDrawing(false);
  };
  // Images are preloaded as a batch; no per-card load callback needed.

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
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
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
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
                  /* TODO: trigger LLM reading */
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100">
                    Get a reading
                  </span>
                  <span className="inline-block h-px w-12 bg-neutral-600 group-hover:w-20 transition-all duration-300" />
                  <span className="text-xs tracking-wide text-neutral-400">
                    For reflection — not certainty.
                  </span>
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
