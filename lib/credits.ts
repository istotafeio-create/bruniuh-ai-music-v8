export const WELCOME_CREDITS = 10;

export type CreditPackId = "mini" | "starter" | "creator" | "pro";

export const CREDIT_PACKS = {
  mini: {
    credits: 50,
    priceEur: 2.99,
    envPriceId: "STRIPE_PRICE_50"
  },
  starter: {
    credits: 100,
    priceEur: 4.99,
    envPriceId: "STRIPE_PRICE_100"
  },
  creator: {
    credits: 300,
    priceEur: 12.99,
    envPriceId: "STRIPE_PRICE_300"
  },
  pro: {
    credits: 1000,
    priceEur: 34.99,
    envPriceId: "STRIPE_PRICE_1000"
  }
} as const;

/**
 * BRUNIUH AI MUSIC credit rule:
 * - Up to 3 minutes: 10 credits for TWO songs.
 * - Up to 4 minutes: 15 credits for TWO songs.
 * - Up to 6 minutes: 20 credits for TWO songs.
 * - Up to 8 minutes: 30 credits for TWO songs.
 */
export function creditCostForDuration(seconds: number) {
  if (seconds <= 180) return 10;
  if (seconds <= 240) return 15;
  if (seconds <= 360) return 20;
  return 30;
}
