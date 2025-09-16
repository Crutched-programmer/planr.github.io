'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface PressableProps {
  children: React.ReactNode;
  className?: string;
}

export function Pressable({ children, className }: PressableProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
