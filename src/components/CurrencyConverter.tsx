// React imports for state management and effects
import { useState, useEffect, useCallback, useMemo } from "react";
// UI component imports
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowRightLeft, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

// Comprehensive currency data with symbols and names
const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  CHF: { symbol: "Fr", name: "Swiss Franc" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
  SGD: { symbol: "S$", name: "Singapore Dollar" },
  AED: { symbol: "د.إ", name: "UAE Dirham" },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar" },
  SEK: { symbol: "kr", name: "Swedish Krona" },
  NOK: { symbol: "kr", name: "Norwegian Krone" },
  DKK: { symbol: "kr", name: "Danish Krone" },
  ZAR: { symbol: "R", name: "South African Rand" },
  BRL: { symbol: "R$", name: "Brazilian Real" },
  MXN: { symbol: "$", name: "Mexican Peso" },
  RUB: { symbol: "₽", name: "Russian Ruble" },
  KRW: { symbol: "₩", name: "South Korean Won" },
} as const;

// Type definition for currency codes
type Currency = keyof typeof CURRENCIES;

// Component props interface
interface CurrencyConverterProps {
  className?: string;
  compact?: boolean;
  isFullPage?: boolean;
  defaultTargetCurrencies?: Currency[];
}

// Cache configuration for exchange rates
const RATES_CACHE_KEY = "exchange_rates_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Interface for cached exchange rates
interface CachedRates {
  rates: Record<Currency, number>;
  timestamp: number;
}

export function CurrencyConverter({
  className = "",
  compact = false,
  isFullPage = false,
  defaultTargetCurrencies = ["USD", "EUR", "GBP"],
}: CurrencyConverterProps) {
  // State management for currency conversion
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<Currency>("INR");
  const [toCurrency, setToCurrency] = useState<Currency>(
    defaultTargetCurrencies[0]
  );
  const [additionalCurrencies, setAdditionalCurrencies] = useState<Currency[]>(
    isFullPage ? defaultTargetCurrencies.slice(1) : []
  );

  // Initialize rates from cache or empty object
  const [rates, setRates] = useState<Record<Currency, number>>(() => {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const { rates, timestamp }: CachedRates = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return rates;
      }
    }
    return {} as Record<Currency, number>;
  });

  const [loading, setLoading] = useState(false);
  const [allConversions, setAllConversions] = useState<Record<
    Currency,
    number
  > | null>(null);

  // Memoized currency options for dropdown menus
  const currencyOptions = useMemo(
    () =>
      Object.entries(CURRENCIES).map(([code, { name }]) => ({
        code,
        name,
        label: `${code} - ${name}`,
      })),
    []
  );

  // Fetch exchange rates from API with caching
  const fetchRates = useCallback(async () => {
    // Check cache first
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const { rates: cachedRates, timestamp }: CachedRates = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setRates(cachedRates);
        return;
      }
    }

    setLoading(true);
    try {
      // Fetch latest rates from API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      // Initialize rates with USD as base currency
      const newRates: Record<Currency, number> = {
        USD: 1,
      } as Record<Currency, number>;

      // Process and store rates for all currencies
      Object.entries(CURRENCIES).forEach(([code]) => {
        if (code !== "USD" && data.rates[code]) {
          newRates[code as Currency] = data.rates[code];
        }
      });

      // Cache the new rates
      localStorage.setItem(
        RATES_CACHE_KEY,
        JSON.stringify({
          rates: newRates,
          timestamp: Date.now(),
        })
      );

      setRates(newRates);
    } catch (error) {
      // Fallback to static rates if API fails
      console.error("Error fetching exchange rates:", error);
      toast.error("Failed to fetch exchange rates. Using fallback rates.");

      const fallbackRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83,
        JPY: 151.62,
        AUD: 1.52,
        CAD: 1.35,
        CHF: 0.9,
        CNY: 7.23,
        SGD: 1.35,
        AED: 3.67,
        NZD: 1.67,
        SEK: 10.71,
        NOK: 10.71,
        DKK: 6.89,
        ZAR: 18.92,
        BRL: 5.05,
        MXN: 16.7,
        RUB: 92.58,
        KRW: 1351.62,
      } as Record<Currency, number>;

      // Cache fallback rates
      localStorage.setItem(
        RATES_CACHE_KEY,
        JSON.stringify({
          rates: fallbackRates,
          timestamp: Date.now(),
        })
      );

      setRates(fallbackRates);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch rates on component mount if not cached
  useEffect(() => {
    if (Object.keys(rates).length === 0) {
      fetchRates();
    }
  }, [fetchRates, rates]);

  // Calculate currency conversions
  const calculateConversions = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      toast.error("Please enter a valid amount");
      return null;
    }

    // Convert to USD first, then to target currencies
    const amountInUSD = numAmount / rates[fromCurrency];
    const conversions: Record<Currency, number> = {} as Record<
      Currency,
      number
    >;

    // Calculate for main target currency
    conversions[toCurrency] = amountInUSD * rates[toCurrency];

    // Calculate for additional currencies in full page mode
    if (isFullPage) {
      additionalCurrencies.forEach((currency) => {
        conversions[currency] = amountInUSD * rates[currency];
      });
    }

    return conversions;
  }, [
    amount,
    fromCurrency,
    toCurrency,
    rates,
    additionalCurrencies,
    isFullPage,
  ]);

  // Add a new target currency with validation
  const addTargetCurrency = useCallback(
    (currency: Currency) => {
      if (currency === fromCurrency) {
        toast.error("Cannot convert to the same currency");
        return;
      }
      if (currency === toCurrency || additionalCurrencies.includes(currency)) {
        toast.error("This currency is already selected");
        return;
      }
      setAdditionalCurrencies((prev) => [...prev, currency]);
    },
    [fromCurrency, toCurrency, additionalCurrencies]
  );

  // Remove a target currency
  const removeTargetCurrency = useCallback((currency: Currency) => {
    setAdditionalCurrencies((prev) => prev.filter((c) => c !== currency));
  }, []);

  // Update conversions when relevant values change
  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      const conversions = calculateConversions();
      if (conversions) {
        setAllConversions(conversions);
      }
    }
  }, [
    amount,
    fromCurrency,
    toCurrency,
    rates,
    calculateConversions,
    additionalCurrencies,
  ]);

  // Memoize swap function
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  // Memoize amount formatter
  const formatAmount = useCallback((amount: number, currency: Currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  if (loading && Object.keys(rates).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={compact ? "text-base" : ""}>
          {compact ? "Quick Convert" : "Currency Converter"}
          {loading && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Updating rates...)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCIES[fromCurrency].symbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
            <Select
              value={fromCurrency}
              onValueChange={(value: Currency) => setFromCurrency(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map(({ code, label }) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={swapCurrencies}
              className="h-8 w-8"
              title="Swap currencies"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <Select
              value={toCurrency}
              onValueChange={(value: Currency) => setToCurrency(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map(({ code, label }) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isFullPage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Target Currencies</label>
                <Select
                  onValueChange={(value: Currency) => addTargetCurrency(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Add currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions
                      .filter(
                        ({ code }) =>
                          code !== fromCurrency &&
                          code !== toCurrency &&
                          !additionalCurrencies.includes(code as Currency)
                      )
                      .map(({ code, label }) => (
                        <SelectItem key={code} value={code}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {[toCurrency, ...additionalCurrencies].map((currency) => (
                  <Badge
                    key={currency}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {currency}
                    {currency !== toCurrency && (
                      <button
                        onClick={() => removeTargetCurrency(currency)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allConversions && (
            <div className="space-y-4">
              {isFullPage ? (
                <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
                  {[toCurrency, ...additionalCurrencies].map((currency) => (
                    <div
                      key={currency}
                      className="flex flex-col justify-between rounded-lg border p-4 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                          {currency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          1 {fromCurrency} ={" "}
                          {(rates[currency] / rates[fromCurrency]).toFixed(4)}
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-semibold">
                        {formatAmount(allConversions[currency], currency)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      {toCurrency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      1 {fromCurrency} ={" "}
                      {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)}
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {formatAmount(allConversions[toCurrency], toCurrency)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
