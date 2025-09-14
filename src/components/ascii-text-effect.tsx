"use client";

import React, { useState, useEffect, useRef } from 'react';

const chars = "!<>-_\\/[]{}—=+*^?#________";

interface AsciiTextEffectProps {
  text: string;
  className?: string;
}

const AsciiTextEffect: React.FC<AsciiTextEffectProps> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const frameRequestRef = useRef<number>();

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      const textArray = text.split('');
      const newText = textArray.map((char, i) => {
        if (char === ' ' || frame / 3 > i) {
          return char;
        }

        const randomCharIndex = Math.floor(Math.random() * chars.length);
        const randomChar = chars[randomCharIndex];
        return randomChar;
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
        setDisplayText('');
        frame = 0;
        if(frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
        animate();
    };

    startAnimation();

    // Clean up on component unmount
    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [text]);

  return (
    <span className={`${className} font-code`}>
      {displayText}
    </span>
  );
};

export default AsciiTextEffect;
