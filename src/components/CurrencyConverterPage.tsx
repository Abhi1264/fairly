// Import required components and icons
import { CurrencyConverter } from "../components/CurrencyConverter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowRightLeft } from "lucide-react";

/**
 * CurrencyConverterPage component
 * Renders the main currency converter page with a full-page converter
 * and helpful tips card
 */
export function CurrencyConverterPage() {
  return (
    // Main container with responsive padding and max width
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* Page header with title and description */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Currency Converter</h1>
        <p className="text-muted-foreground">
          Convert between different currencies using real-time exchange rates.
        </p>
      </div>

      {/* Two-column grid layout for converter and tips */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Full-page currency converter component */}
        <CurrencyConverter isFullPage />

        {/* Tips card with helpful information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Real-time rates information */}
            <div className="space-y-2">
              <h3 className="font-medium">Real-time Rates</h3>
              <p className="text-sm text-muted-foreground">
                Exchange rates are updated in real-time using reliable sources.
                If the API is unavailable, we'll use fallback rates.
              </p>
            </div>

            {/* Supported currencies information */}
            <div className="space-y-2">
              <h3 className="font-medium">Supported Currencies</h3>
              <p className="text-sm text-muted-foreground">
                We support 20 major currencies including INR, USD, EUR, GBP,
                JPY, and more. The converter shows both currency codes and full
                names for clarity.
              </p>
            </div>

            {/* Quick conversion tips */}
            <div className="space-y-2">
              <h3 className="font-medium">Quick Conversion</h3>
              <p className="text-sm text-muted-foreground">
                Use the swap button to quickly switch between currencies. The
                converter also shows the current exchange rate between the
                selected currencies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
