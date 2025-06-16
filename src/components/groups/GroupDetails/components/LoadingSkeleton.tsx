// Import UI components for skeleton loading states
import { Skeleton } from "../../../ui/skeleton";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Tabs, TabsList, TabsContent } from "../../../ui/tabs";

/**
 * LoadingSkeleton component displays a placeholder UI while the main content is loading
 * Mimics the structure of the actual content with skeleton elements
 */
export function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Group header with avatar, name and action button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar placeholder */}
          <Skeleton className="h-10 w-10 rounded-full" />
          {/* Group name and description placeholders */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Action button placeholder */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Overview statistics cards - responsive grid layout */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {/* Card title placeholder */}
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              {/* Card value placeholder */}
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content tabs with loading states */}
      <Tabs defaultValue="expenses" className="space-y-4">
        {/* Tab navigation placeholders */}
        <TabsList className="w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </TabsList>

        {/* Expenses tab content */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Filter controls placeholders */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>

          {/* Expense list items placeholders */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Expense details placeholders */}
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    {/* Action buttons placeholders */}
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
