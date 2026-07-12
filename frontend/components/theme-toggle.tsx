"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === "dark" ? <SunMedium className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
