"use client";

import React, { useState, useEffect, useRef } from 'react';

const chars = "!<>-_\\/[]{}—=+*^?#________";

interface AsciiTextEffectProps {
  text: string;
  className?: string;
}

const AsciiTextEffect: React.FC<AsciiTextEffectProps> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ' ').join(''));
  const [isAnimating, setIsAnimating] = useState(true);
  const frameRequestRef = useRef<number>();

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      const textArray = text.split('');
      const newText = textArray.map((char, i) => {
        if (char === ' ') return ' ';
        if (frame / 3 > i) {
          return char;
        }
        const randomCharIndex = Math.floor(Math.random() * chars.length);
        return chars[randomCharIndex];
      }).join('');

      setDisplayText(newText);
      frame++;

      if (frame < text.length * 3) {
        frameRequestRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setDisplayText(text); // Ensure final text is correct
      }
    };

    const startAnimation = () => {
        setIsAnimating(true);
        setDisplayText(text.split('').map(() => ' ').join(''));
        frame = 0;
        if(frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
        animate();
    };

    startAnimation();

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [text]);

  return (
    <span className={`${className} font-code`}>
      {displayText.split('').map((char, index) => (
        <span 
          key={index}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default AsciiTextEffect;
