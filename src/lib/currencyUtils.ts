import type { Currency } from "./groupUtils";

/**
 * Duration for which exchange rates are cached (1 hour)
 * Used to prevent excessive API calls
 */
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * In-memory cache for exchange rates
 * Stores timestamp and rates for supported currencies
 */
let ratesCache: {
  timestamp: number;
  rates: Record<Currency, number>;
} | null = null;

/**
 * Fetches current exchange rates from API or returns cached rates
 * Implements caching to reduce API calls and provides fallback rates
 * @returns Promise resolving to exchange rates for supported currencies
 */
export async function getExchangeRates(): Promise<Record<Currency, number>> {
  // Return cached rates if they're still valid
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
    return ratesCache.rates;
  }

  try {
    // Fetch latest rates from free exchange rate API
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();

    // Map API response to our supported currencies
    const rates: Record<Currency, number> = {
      USD: 1, // Base currency
      INR: data.rates.INR,
      EUR: data.rates.EUR,
      GBP: data.rates.GBP,
    };

    // Update cache with new rates and timestamp
    ratesCache = {
      timestamp: Date.now(),
      rates,
    };

    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Fallback to cached rates or default values if API fails
    return (
      ratesCache?.rates || {
        USD: 1,
        INR: 83, // Fallback rates as of last update
        EUR: 0.92,
        GBP: 0.79,
      }
    );
  }
}

/**
 * Converts an amount from one currency to another
 * Uses USD as an intermediate currency for conversion
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @returns Promise resolving to converted amount
 */
export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> {
  // Return original amount if currencies are the same
  if (from === to) return amount;

  const rates = await getExchangeRates();
  // Convert to USD first (base currency), then to target currency
  const amountInUSD = amount / rates[from];
  return amountInUSD * rates[to];
}

/**
 * Formats a currency amount according to locale settings
 * Currently converts all amounts to INR for display
 * @param amount - Amount to format
 * @param currency - Source currency of the amount
 * @param locale - Locale for formatting (defaults to en-IN)
 * @returns Promise resolving to formatted currency string
 */
export async function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = "en-IN"
): Promise<string> {
  // Convert amount to INR for consistent display
  const convertedAmount = await convertCurrency(amount, currency, "INR");

  // Format using Intl API with INR currency
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}

/**
 * Returns the currency symbol for a given currency
 * @param currency - Currency to get symbol for
 * @returns Currency symbol as string
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency];
}
