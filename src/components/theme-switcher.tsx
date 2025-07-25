
"use client"

import * as React from "react"
import { Moon, Sun, Palette, Check, Circle, Square, Triangle, Plus } from "lucide-react"
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
    { name: 'purple', label: 'Purple', color: "hsl(var(--theme-purple))" },
    { name: 'blue', label: 'Blue', color: "hsl(var(--theme-blue))" },
    { name: 'red', label: 'Red', color: "hsl(var(--theme-red))" },
    { name: 'yellow', label: 'Yellow', color: "hsl(var(--theme-yellow))" },
    { name: 'black', label: 'Black', color: "hsl(var(--theme-black))" },
    { name: 'white', label: 'White', color: "hsl(var(--theme-white))" },
];

const doodleThemes = [
    { name: 'none', label: 'None', icon: Plus },
    { name: 'circles', label: 'Circles', icon: Circle },
    { name: 'squares', label: 'Squares', icon: Square },
    { name: 'triangles', label: 'Triangles', icon: Triangle },
    { name: 'crosses', label: 'Crosses', icon: Plus },
];


export function ThemeSwitcher() {
  const { theme, setTheme, colorTheme, setColorTheme, doodleTheme, setDoodleTheme } = useTheme()

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
                <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: `hsl(var(--primary))`}} />
                <span>Accent Color</span>
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

        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Triangle className="mr-2 h-4 w-4" />
                <span>Background Doodle</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                     {doodleThemes.map((dt) => {
                         const Icon = dt.icon;
                         return (
                            <DropdownMenuItem key={dt.name} onClick={() => setDoodleTheme(dt.name as any)}>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{dt.label}</span>
                                {doodleTheme === dt.name && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                         )
                    })}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Minimal Tooltip components for use in this file only
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName
