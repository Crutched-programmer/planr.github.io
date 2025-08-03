
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
    { name: 'orange', label: 'Burnt Orange', lightColor: "hsl(18 81% 42%)", darkColor: "hsl(18 90% 10%)" },
    { name: 'purple', label: 'Purple', lightColor: "hsl(259 84% 71%)", darkColor: "hsl(240 6% 10%)" },
    { name: 'blue', label: 'Blue', lightColor: "hsl(217.2 91.2% 59.8%)", darkColor: "hsl(222.2 47.4% 11.2%)" },
    { name: 'red', label: 'Red', lightColor: "hsl(0 84% 60%)", darkColor: "hsl(0 50% 12%)" },
    { name: 'yellow', label: 'Yellow', lightColor: "hsl(48 96% 53%)", darkColor: "hsl(40 50% 10%)" },
    { name: 'black', label: 'Black', lightColor: "hsl(0 0% 13%)", darkColor: "hsl(0 0% 98%)" },
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
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light Themes</span>
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
                <span>Dark Themes</span>
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
