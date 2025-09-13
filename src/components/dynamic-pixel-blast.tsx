
"use client";

import dynamic from 'next/dynamic';

// Dynamically import the PixelBlast component only on the client side
export const DynamicPixelBlast = dynamic(() => import('@/components/pixel-blast'), {
  ssr: false,
});
