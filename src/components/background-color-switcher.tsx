
"use client";

import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'Slate', value: 'hsl(220 40% 5%)' },
  { name: 'Sky', value: 'hsl(210 80% 35%)' },
  { name: 'Indigo', value: 'hsl(260 70% 30%)' },
  { name: 'Sunset', value: 'hsl(25 80% 40%)' },
  { name: 'Teal', value: 'hsl(180 70% 25%)' },
];

const LOCAL_STORAGE_KEY_BG = 'planrBackgroundColor';

export function BackgroundColorSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [activeColor, setActiveColor] = useState(colors[0].value);

  useEffect(() => {
    setMounted(true);
    const savedColor = localStorage.getItem(LOCAL_STORAGE_KEY_BG);
    if (savedColor) {
      document.documentElement.style.backgroundColor = savedColor;
      setActiveColor(savedColor);
    }
  }, []);

  const handleColorChange = (colorValue: string) => {
    document.documentElement.style.backgroundColor = colorValue;
    localStorage.setItem(LOCAL_STORAGE_KEY_BG, colorValue);
    setActiveColor(colorValue);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change background color">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              aria-label={`Change background to ${color.name}`}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                activeColor === color.value ? 'border-primary' : 'border-border'
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorChange(color.value)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
