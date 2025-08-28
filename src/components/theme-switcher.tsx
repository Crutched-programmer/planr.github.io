
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

const colorThemes = [
    { name: 'red', label: 'Vibrant Red', lightColor: "hsl(0 0% 98%)", darkColor: "hsl(0 0% 12%)" },
];

export function ThemeSwitcher() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme and appearance</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                     {colorThemes.map((ct) => (
                        <DropdownMenuItem key={ct.name} onClick={() => { setColorTheme(ct.name as any); setTheme('light'); }}>
                            <div className="w-4 h-4 rounded-full mr-2 border" style={{backgroundColor: ct.lightColor}} />
                            <span>{ct.label}</span>
                             {colorTheme === ct.name && theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                     {colorThemes.map((ct) => (
                        <DropdownMenuItem key={ct.name} onClick={() => { setColorTheme(ct.name as any); setTheme('dark'); }}>
                            <div className="w-4 h-4 rounded-full mr-2 border" style={{backgroundColor: ct.darkColor}} />
                            <span>{ct.label}</span>
                             {colorTheme === ct.name && theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
