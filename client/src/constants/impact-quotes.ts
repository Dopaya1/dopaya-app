export interface ImpactQuote {
  text: string;
  author: string;
}

export const IMPACT_QUOTES: ImpactQuote[] = [
  {
    text: "No one is too small to make a difference.",
    author: "Greta Thunberg",
  },
  {
    text: "What you do makes a difference, and you have to decide what kind of difference you want to make.",
    author: "Jane Goodall",
  },
  {
    text: "It’s the little things citizens do. That’s what will make the difference. My little thing is planting trees.",
    author: "Wangari Maathai",
  },
  {
    text: "One child, one teacher, one book and one pen can change the world.",
    author: "Malala Yousafzai",
  },
  {
    text: "A social business is not designed primarily to maximize profit, but to solve a social problem.",
    author: "Muhammad Yunus",
  },
  {
    text: "Do your little bit of good where you are; it’s those little bits of good put together that overwhelm the world.",
    author: "Desmond Tutu",
  },
  {
    text: "If you think you’re too small to make a difference, try sleeping with a mosquito.",
    author: "Dalai Lama",
  },
  {
    text: "There is no greater calling than to serve your fellow human beings, and no greater reward than doing it well.",
    author: "Maya Angelou",
  },
  {
    text: "If we can get the right incentives, markets, and entrepreneurship working, we can solve the climate problem.",
    author: "Bill Gates",
  },
  {
    text: "We are the first generation to feel the effect of climate change and the last generation who can do something about it.",
    author: "Barack Obama",
  },
  {
    text: "Sustainability is not a buzzword; it’s a license to operate.",
    author: "Paul Hawken",
  },
  {
    text: "Saving our planet, lifting people out of poverty, advancing economic growth — these are one and the same fight.",
    author: "Ban Ki-moon",
  },
];

/**
 * Returns a quote index for the current user and day, stable across reloads for that day.
 * Stored in localStorage so we don't re-randomize on every render.
 */
export function getDailyQuoteForUser(userId?: string | null): ImpactQuote {
  if (!IMPACT_QUOTES.length) {
    return { text: "", author: "" };
  }

  try {
    const keyBase = userId || "guest";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const storageKey = `impactQuote:${keyBase}:${today}`;

    if (typeof window !== "undefined" && window.localStorage) {
      const storedIndex = window.localStorage.getItem(storageKey);
      if (storedIndex !== null) {
        const idx = Number.parseInt(storedIndex, 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < IMPACT_QUOTES.length) {
          return IMPACT_QUOTES[idx];
        }
      }

      // No stored index yet → pick one and store it.
      const randomIndex = Math.floor(Math.random() * IMPACT_QUOTES.length);
      window.localStorage.setItem(storageKey, String(randomIndex));
      return IMPACT_QUOTES[randomIndex];
    }
  } catch {
    // Ignore storage errors (e.g. private mode)
  }

  // Fallback: simple random without persistence
  const fallbackIndex = Math.floor(Math.random() * IMPACT_QUOTES.length);
  return IMPACT_QUOTES[fallbackIndex];
}


