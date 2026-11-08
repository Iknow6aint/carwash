/** Layout classes shared by the landing sections. */

/** 1280 px column with the design's clamp(16px, 4vw, 48px) gutters. */
export const CONTAINER = "mx-auto w-full max-w-[1280px] px-[clamp(16px,4vw,48px)]";

/** Section padding top and bottom: clamp(72px, 10vw, 128px). */
export const SECTION_Y = "py-[clamp(72px,10vw,128px)]";

/** Section headline: Barlow Condensed 600, 40–72 px, with an accent italic phrase inside. */
export const SECTION_TITLE =
  "m-0 font-heading text-[clamp(40px,5.2vw,72px)] leading-[0.98] font-semibold tracking-[-0.015em]";

/** The italic accent phrase inside a headline. */
export const ACCENT_PHRASE = "text-accent italic";

/** Small uppercase label in mock screens ("01 Services", "Total"). */
export const MOCK_KICKER = "text-[10px] tracking-[0.1em] text-accent uppercase";
