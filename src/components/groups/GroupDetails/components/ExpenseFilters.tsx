// Import UI components for card layout and form controls
import { Card, CardContent } from "../../../ui/card";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { DatePicker } from "../../../ui/date-picker";
// Import type definitions
import type { ExpenseFilters as ExpenseFiltersType } from "../types/expense";
import type { Currency } from "../../../../lib/groupUtils";

// Props interface for the ExpenseFilters component
interface ExpenseFiltersProps {
  filters: ExpenseFiltersType; // Current filter values
  onFilterChange: (filters: ExpenseFiltersType) => void; // Callback for filter changes
}

export function ExpenseFilters({
  filters,
  onFilterChange,
}: ExpenseFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Grid layout for filter controls - responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category filter dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFilterChange({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency filter dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={filters.currency}
              onValueChange={(value: Currency | "") =>
                onFilterChange({ ...filters, currency: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All currencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All currencies</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range filter with start and end date pickers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <DatePicker
                date={
                  filters.startDate ? new Date(filters.startDate) : undefined
                }
                onSelect={(date) =>
                  onFilterChange({
                    ...filters,
                    startDate: date.toISOString(),
                  })
                }
                placeholder="Start date"
              />
              <DatePicker
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) =>
                  onFilterChange({
                    ...filters,
                    endDate: date.toISOString(),
                  })
                }
                placeholder="End date"
              />
            </div>
          </div>

          {/* Amount range filter with min and max inputs */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Range</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    minAmount: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    maxAmount: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
