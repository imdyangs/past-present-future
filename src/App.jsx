import { useState, useEffect } from "react";

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

const commonsFileUrl = (fileName) =>
  `https://upload.wikimedia.org/wikipedia/commons/${fileName}`;

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
  const [imgSrc, setImgSrc] = useState(card.img);
  const [isLoading, setIsLoading] = useState(true);
  const [revealKey, setRevealKey] = useState(0);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);

    getCachedImageUrl(card.id, card.img).then((url) => {
      if (!alive) return;
      setImgSrc(url);
      // bump key to restart the reveal animation when the resolved URL swaps in
      setRevealKey((k) => k + 1);
    });

    return () => {
      alive = false;
    };
  }, [card.id, card.img]);

  return (
    <div
      className="bg-neutral-900 rounded-2xl shadow-lg p-4 transform transition duration-500 flex flex-col"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <h2 className="text-lg font-medium mb-2">{position}</h2>
      <div className="relative rounded-xl overflow-hidden mb-3 group">
        {/* Intentional "drawing" feel: soft shimmer while loading, then a gentle reveal */}
        {isLoading && (
          <div className="absolute inset-0 animate-pulse">
            <div className="h-full w-full bg-neutral-800" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent translate-x-[-60%] animate-[shimmer_1.2s_infinite]" />
          </div>
        )}

        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-1">
        <img
          key={`${card.id}-${revealKey}`}
          src={imgSrc}
          alt={card.name}
          decoding="async"
          loading="eager"
          onLoad={() => {
            setIsLoading(false);
            setDidLoad(true);
            window.setTimeout(() => setDidLoad(false), 550);
          }}
          className={`w-full rounded-xl ${
            isLoading
              ? "opacity-0 scale-[0.98] blur-[1px]"
              : didLoad
              ? "animate-[settle_520ms_cubic-bezier(0.2,0.8,0.2,1)]"
              : "opacity-100 scale-100 blur-0"
          }`}
          style={{ willChange: "transform, filter, opacity" }}
        />
      </div>
      </div>
      <div className="mt-auto pt-3 border-t border-neutral-800/70">
        <h3 className="font-semibold leading-tight">{card.name}</h3>
        <p className="text-sm text-neutral-400 leading-snug line-clamp-2">
          {card.meaning}
        </p>
      </div>
    </div>
  );
}

export default function TarotApp() {
  const [spread, setSpread] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("tarot-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tarot-history", JSON.stringify(history));
  }, [history]);

  const drawSpread = () => {
    const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
    const draw = shuffled.slice(0, 3);
    const timestamp = new Date().toISOString();

    setSpread(draw);
    setHistory([{ timestamp, cards: draw }, ...history]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <style>{animStyle}</style>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Past · Present · Future</h1>
        <p className="text-neutral-400 mb-6">Simple Rider–Waite tarot spread</p>

        <button
          onClick={drawSpread}
          className="mb-8 px-6 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 transition"
        >
          Draw Cards
        </button>

        {spread.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {spread.map((card, i) => (
              <TarotCard
                key={card.id}
                card={card}
                position={POSITIONS[i]}
                index={i}
              />
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">History</h2>
            <div className="space-y-3">
              {history.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="bg-neutral-900 rounded-xl p-3 text-sm">
                  <div className="text-neutral-500 mb-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {entry.cards.map(c => (
                      <span key={c.id} className="px-2 py-1 bg-neutral-800 rounded-lg">
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
