
"use client"

import * as React from "react"
import { Moon, Sun, Palette, Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const colorThemes = [
    { name: 'orange', label: 'Burnt Orange', color: "hsl(18 81% 42%)" },
    { name: 'purple', label: 'Purple', color: "hsl(259 84% 71%)" },
    { name: 'blue', label: 'Blue', color: "hsl(217.2 91.2% 59.8%)" },
    { name: 'red', label: 'Red', color: "hsl(0 84% 60%)" },
    { name: 'yellow', label: 'Yellow', color: "hsl(48 96% 53%)" },
    { name: 'black', label: 'Black', color: "hsl(0 0% 13%)" },
    { name: 'white', label: 'White', color: "hsl(0 0% 98%)" },
];

export function ThemeSwitcher() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme and appearance</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Appearance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <div className="w-4 h-4 rounded-full mr-2 border" style={{backgroundColor: `hsl(var(--primary))`}} />
                <span>Color Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                     {colorThemes.map((ct) => (
                        <DropdownMenuItem key={ct.name} onClick={() => setColorTheme(ct.name as any)}>
                            <div className="w-4 h-4 rounded-full mr-2 border" style={{backgroundColor: ct.color}} />
                            <span>{ct.label}</span>
                             {colorTheme === ct.name && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
