"use client";
 
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BsMoon, BsSun } from "react-icons/bs";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-input hover:bg-muted text-foreground transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <BsSun className="text-yellow-400" /> : <BsMoon className="text-slate-700" />}
    </button>
  );
}
