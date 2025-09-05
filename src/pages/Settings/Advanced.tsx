import React from "react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/useTheme";

const Advanced: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Advanced Settings</h2>
      
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Theme</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Choose your preferred theme for the application
          </p>
          <RadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")} className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-medium">Other Settings</h3>
        <ul className="list-disc pl-4 space-y-2">
          <li>
            <Link to="/defects-admin" className="text-primary underline">
              Defects Admin
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Advanced;
