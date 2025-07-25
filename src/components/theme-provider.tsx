
"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"

export type Theme = "light" | "dark";
export type ColorTheme = "purple" | "blue" | "red" | "yellow" | "black" | "white";
export type DoodleTheme = "none" | "circles" | "squares" | "triangles" | "crosses";

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
  doodleTheme: DoodleTheme
  setDoodleTheme: (doodleTheme: DoodleTheme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const LOCAL_STORAGE_KEY_THEME = "planrTheme";

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorTheme = "purple",
  defaultDoodleTheme = "none",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  defaultDoodleTheme?: DoodleTheme
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(defaultColorTheme);
  const [doodleTheme, setDoodleTheme] = useState<DoodleTheme>(defaultDoodleTheme);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (savedTheme) {
        const { theme, colorTheme, doodleTheme } = JSON.parse(savedTheme);
        if (theme) setTheme(theme);
        if (colorTheme) setColorTheme(colorTheme);
        if (doodleTheme) setDoodleTheme(doodleTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    const newPrimaryColor = getComputedStyle(root).getPropertyValue(`--theme-${colorTheme}`).trim();
    if (newPrimaryColor) {
      root.style.setProperty('--primary', newPrimaryColor);
      
      const isBlackOrWhite = colorTheme === 'black' || colorTheme === 'white';
      if (isBlackOrWhite) {
        root.style.setProperty('--primary-foreground', theme === 'dark' ? 'hsl(0 0% 13%)' : 'hsl(0 0% 98%)');
      } else {
         root.style.setProperty('--primary-foreground', `${colorTheme} 80% 15%`);
      }
    }

    const doodleClasses = ["doodle-circles", "doodle-squares", "doodle-triangles", "doodle-crosses"];
    root.classList.remove(...doodleClasses);
    if (doodleTheme !== "none") {
      root.classList.add(`doodle-${doodleTheme}`);
    }

    try {
      const themeState = JSON.stringify({ theme, colorTheme, doodleTheme });
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, themeState);
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
  }, [theme, colorTheme, doodleTheme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (t) => setTheme(t),
    colorTheme,
    setColorTheme: (c) => setColorTheme(c),
    doodleTheme,
    setDoodleTheme: (d) => setDoodleTheme(d),
  }), [theme, colorTheme, doodleTheme]);

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
