import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Separator } from "../components/ui/separator";
import { Badge } from "./ui/badge";
import {
  selectDefaultCurrency,
  setDefaultCurrency,
  clearAllCache,
} from "../lib/appSlice";
import { toast } from "sonner";
import {
  Settings,
  DollarSign,
  Palette,
  Bell,
  Shield,
  Database,
  RefreshCw,
} from "lucide-react";

export function SettingsPage() {
  const dispatch = useDispatch();
  const defaultCurrency = useSelector(selectDefaultCurrency);

  const handleCurrencyChange = (currency: string) => {
    dispatch(setDefaultCurrency(currency as any));
    toast.success(`Default currency changed to ${currency}`);
  };

  const handleClearCache = () => {
    dispatch(clearAllCache());
    toast.success("Cache cleared successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>Currency Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Currency</label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred currency for displaying amounts across the
              app
            </p>
            <Select
              value={defaultCurrency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cache Management</label>
            <p className="text-sm text-muted-foreground">
              Clear cached data to free up storage space and refresh data
            </p>
            <Button
              variant="outline"
              onClick={handleClearCache}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <span>Theme Customization</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span>Notification Preferences</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Privacy & Security</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
