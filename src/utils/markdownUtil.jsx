// --- Tiny inline-markdown renderer (bold/italic) ---
export function renderInlineMarkdown(text) {
    const s = String(text || "");
    const out = [];

    // Tokenize on **bold** and *italic* (simple, non-nested)
    const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
    let last = 0;
    let m;

    while ((m = re.exec(s)) !== null) {
        if (m.index > last) out.push(s.slice(last, m.index));
        const token = m[0];

        if (token.startsWith("**")) {
            out.push(
                <strong key={`b-${m.index}`} className="font-semibold text-neutral-100">
                    {token.slice(2, -2)}
                </strong>
            );
        } else {
            out.push(
                <em key={`i-${m.index}`} className="italic text-neutral-200">
                    {token.slice(1, -1)}
                </em>
            );
        }

        last = m.index + token.length;
    }

    if (last < s.length) out.push(s.slice(last));
    return out;
}

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



