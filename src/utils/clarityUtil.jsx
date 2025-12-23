// --- Clarity (optional) ---
// Events: window.clarity("event", "name")
// Tags:   window.clarity("set", "key", "value")
export function clarityEvent(name) {
    try {
        if (typeof window !== "undefined" && typeof window.clarity === "function") {
            window.clarity("event", String(name));
        }
    } catch { }
}

export function claritySet(key, value) {
    try {
        if (typeof window !== "undefined" && typeof window.clarity === "function") {
            window.clarity("set", String(key), Array.isArray(value) ? value.map(String) : String(value));
        }
    } catch { }
}

export function waitBucket(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s <= 1) return "0-1s";
    if (s <= 5) return "2-5s";
    if (s <= 10) return "6-10s";
    if (s <= 20) return "11-20s";
    if (s <= 30) return "21-30s";
    return "31s+";
}

export function spreadTag(spread) {
    // Keep tags compact & deterministic
    try {
        if (!Array.isArray(spread) || spread.length !== 3) return "";
        return spread.map((c) => c?.id || c?.name || "").filter(Boolean).join("|");
    } catch {
        return "";
    }
}
