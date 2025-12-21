// src/data/rwsDescriptions.js
// Longer (1–2 sentence) descriptions for Rider–Waite–Smith (RWS) cards.
// Keyed by stable IDs so you can merge safely.

export const RWS_DESCRIPTIONS = {
    major: {
        "00": "A fresh start with no guarantees. Trust the next step, stay curious, and let experience teach you as you go.",
        "01": "You have the tools, focus, and leverage to shape outcomes. Align intention with action and commit to making it real.",
        "02": "Quiet knowledge and subtle signals matter right now. Slow down, listen inward, and let what’s hidden reveal itself over time.",
        "03": "Growth comes through care, creativity, and receptivity. Nurture what you want to flourish and let it mature naturally.",
        "04": "Stability is built through structure and clear boundaries. Lead with calm authority and prioritize long-term foundations.",
        "05": "Learning through tradition, mentorship, or shared values. Seek guidance, refine your beliefs, and commit to a disciplined path.",
        "06": "A meaningful choice about love, loyalty, or values. What you choose now shapes your direction more than what you desire.",
        "07": "Momentum through discipline and steering your energy. Win by focusing, not forcing—keep the reins in your hands.",
        "08": "Real power is gentle and steady, not loud. Meet challenges with patience, self-trust, and emotional bravery.",
        "09": "Step back to see clearly and regain your inner compass. Solitude, reflection, or mentorship helps you find the signal in the noise.",
        "10": "The cycle is shifting—luck, timing, and circumstance are turning. Stay adaptable and position yourself for the next phase.",
        "11": "Truth, accountability, and consequences. Make decisions you can stand behind, and let integrity be the guiding principle.",
        "12": "A pause that changes your viewpoint. Release control, let the situation ripen, and consider what you’re learning by waiting.",
        "13": "A chapter ends so something truer can begin. Let go cleanly, grieve honestly, and allow transformation to do its work.",
        "14": "Balance through blending and pacing yourself. Small, consistent adjustments bring harmony more than dramatic swings.",
        "15": "Desire, attachment, or compulsions may be running the show. Name the chain, then choose what you want to be free from.",
        "16": "A disruption that clears illusions and exposes the truth. What falls away makes space for rebuilding on something real.",
        "17": "Renewal, guidance, and steady hope after difficulty. Keep faith in your path and take practical steps toward healing.",
        "18": "Uncertainty, projection, and emotional fog. Move slowly, verify assumptions, and trust intuition—but don’t mistake fear for truth.",
        "19": "Clarity, confidence, and simple joy. Things are illuminated—share openly, celebrate progress, and let yourself be seen.",
        "20": "A reckoning that calls you to rise into a new version of yourself. Answer the wake-up call, forgive what’s past, and recommit.",
        "21": "Completion and integration—what you started comes together. Enjoy the milestone and carry the lesson into your next chapter.",
    },

    // Minor arcana keyed by suit + number (or court rank)
    // Example keys:
    // "Wands:01", "Cups:12", "Swords:Queen", "Pentacles:14"
    minor: {
        // Wands
        "Wands:01": "A surge of inspiration or desire to begin. Act while the spark is alive, but channel it into a real plan.",
        "Wands:02": "You’re standing at the threshold of expansion. Evaluate options and choose a direction you can commit to.",
        "Wands:03": "Early progress signals you’re on the right track. Keep building momentum and think bigger than the first win.",
        "Wands:04": "A moment of stability, celebration, or “home base.” Enjoy it—then use it as a platform for the next step.",
        "Wands:05": "Competition and friction test your confidence. Engage with skill, not ego, and use the challenge to sharpen you.",
        "Wands:06": "Recognition for effort and a boost in confidence. Accept the win, then stay humble enough to keep improving.",
        "Wands:07": "Hold your ground—your position is worth defending. Protect your focus and don’t let others dictate your pace.",
        "Wands:08": "Things move fast: messages, decisions, travel, or sudden momentum. Respond quickly, but don’t panic-react.",
        "Wands:09": "You’ve been through it and you’re still standing. Rest, stay alert, and don’t quit right before the breakthrough.",
        "Wands:10": "Carrying too much alone will burn you out. Delegate, simplify, and choose what actually matters.",
        "Wands:11": "Curiosity and a bold willingness to explore. Say yes to learning, experimentation, and a playful first attempt.",
        "Wands:12": "Action-oriented energy with a risk of impulsiveness. Move decisively—just check that you’re not chasing chaos.",
        "Wands:13": "Magnetic confidence and creative fire. Lead with warmth and courage, and trust your ability to influence outcomes.",
        "Wands:14": "Visionary leadership and purposeful direction. Make decisions from values and strategy, not from mood or noise.",

        // Cups
        "Cups:01": "A new emotional opening—love, tenderness, or renewed empathy. Let yourself feel without demanding certainty.",
        "Cups:02": "A mutual bond that’s built on reciprocity. Prioritize honesty and balanced give-and-take.",
        "Cups:03": "Friendship, community, and shared joy. Celebrate connection and let support systems strengthen you.",
        "Cups:04": "A pause in feeling: boredom, apathy, or emotional withdrawal. Look at what you’re ignoring—and why.",
        "Cups:05": "Grief and regret, but not the whole story. Acknowledge what’s lost, then notice what still remains.",
        "Cups:06": "Nostalgia and soft memories, sometimes idealized. Reconnect with the good while staying present to reality.",
        "Cups:07": "Too many options can distort clarity. Choose with values, not fantasy, and avoid chasing every mirage.",
        "Cups:08": "Walking away from what no longer fulfills you. It’s not failure—it’s growth toward something truer.",
        "Cups:09": "Contentment and a personal wish coming into focus. Enjoy pleasure, but don’t confuse comfort with purpose.",
        "Cups:10": "Emotional fulfillment through harmony and shared values. Protect what’s good and invest in what lasts.",
        "Cups:11": "A tender message, creative spark, or emotional surprise. Stay open, but keep your feet on the ground.",
        "Cups:12": "Romance and idealism—an invitation to follow your heart. Be sincere, and watch for overpromising.",
        "Cups:13": "Deep empathy and intuitive understanding. Hold space without absorbing everything—boundaries are love too.",
        "Cups:14": "Steady emotional leadership. Respond with maturity, regulate your nervous system, and choose calm power.",

        // Swords
        "Swords:01": "A mental breakthrough and clean clarity. Use truth as a tool—direct it with precision, not aggression.",
        "Swords:02": "Indecision and self-protection create a stalemate. You may need more information—or the courage to choose.",
        "Swords:03": "Heartbreak or disappointment that reveals a hard truth. Let the pain inform you, but don’t let it define you.",
        "Swords:04": "Rest and recovery after strain. Step back, heal your mind, and return with a clearer strategy.",
        "Swords:05": "A conflict where “winning” costs too much. Check ego, choose your battles, and aim for outcomes, not dominance.",
        "Swords:06": "A transition toward calmer waters. Leave what hurts behind and focus on steady forward movement.",
        "Swords:07": "Strategy, secrecy, or avoidance—sometimes clever, sometimes self-sabotage. Ask whether you’re being wise or just scared.",
        "Swords:08": "Feeling trapped by fear or limiting beliefs. The exit exists—start by changing the story you’re telling yourself.",
        "Swords:09": "Anxiety loops and late-night catastrophizing. Name the fear, ground your body, and address the real problem in daylight.",
        "Swords:10": "An ending that’s definitive and clarifying. Let it be over, take the lesson, and don’t resurrect what’s dead.",
        "Swords:11": "Mental alertness, curiosity, and honesty. Ask sharp questions, but don’t weaponize your intelligence.",
        "Swords:12": "Fast action and blunt truth with a risk of collateral damage. Move quickly, but stay ethical and aim clearly.",
        "Swords:13": "Discernment, boundaries, and clean communication. Say what’s true, cut what’s unnecessary, and protect your peace.",
        "Swords:14": "Authority through logic, fairness, and structure. Make principled decisions and hold yourself to the same standard.",

        // Pentacles
        "Pentacles:01": "A concrete opportunity to build something valuable. Start small, invest wisely, and let consistency compound.",
        "Pentacles:02": "Balancing priorities, money, or energy in motion. Stay flexible and don’t drop what matters while you juggle.",
        "Pentacles:03": "Craftsmanship, teamwork, and progress through collaboration. Build with others and respect the long game.",
        "Pentacles:04": "Security and control—sometimes stability, sometimes scarcity mindset. Loosen your grip where it’s costing you freedom.",
        "Pentacles:05": "Hardship, isolation, or feeling left out in the cold. Ask for help, seek community, and remember this isn’t forever.",
        "Pentacles:06": "Giving and receiving in fair proportion. Practice generosity with boundaries and let reciprocity guide you.",
        "Pentacles:07": "Patience and long-term investment. Keep tending the work—results arrive through steady attention over time.",
        "Pentacles:08": "Practice, repetition, and mastery. Get obsessed with fundamentals and let skill become your advantage.",
        "Pentacles:09": "Independence and earned comfort. Enjoy the reward, and appreciate what you’ve built through discipline.",
        "Pentacles:10": "Legacy, family, and long-term stability. Think in generations: what you build now can outlast your current season.",
        "Pentacles:11": "A practical new beginning in work, study, or money habits. Be curious, commit to learning, and start responsibly.",
        "Pentacles:12": "Consistency and duty—progress through routine. Show up, do the work, and let reliability be your edge.",
        "Pentacles:13": "Practical care and grounded abundance. Nourish your life with simple rituals that support body, home, and finances.",
        "Pentacles:14": "Stewardship, security, and wise leadership with resources. Build systems, invest long-term, and lead with stability.",
    },
};
  