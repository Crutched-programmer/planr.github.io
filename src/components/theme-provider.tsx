
"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"

export type Theme = "light" | "dark";
export type ColorTheme = "orange" | "purple" | "blue" | "red" | "yellow" | "black" | "white";

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const LOCAL_STORAGE_KEY_THEME = "studyZenTheme";

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorTheme = "purple",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(defaultColorTheme);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (savedTheme) {
        const { theme, colorTheme } = JSON.parse(savedTheme);
        if (theme) setTheme(theme);
        if (colorTheme) setColorTheme(colorTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    // Handle light/dark mode
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Handle color theme
    const colorThemes = ["theme-orange", "theme-purple", "theme-blue", "theme-red", "theme-yellow", "theme-black", "theme-white"];
    root.classList.remove(...colorThemes);
    root.classList.add(`theme-${colorTheme}`);

    try {
      const themeState = JSON.stringify({ theme, colorTheme });
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, themeState);
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
  }, [theme, colorTheme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (t) => setTheme(t),
    colorTheme,
    setColorTheme: (c) => setColorTheme(c),
  }), [theme, colorTheme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
