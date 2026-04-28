'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface BlockProps {
  ownerColor?: string;
  ownerName?: string;
  isOwn?: boolean;      // true if this block belongs to the current user
  onClick: () => void;
}

/**
 * Block - a single cell in the shared grid.
 * 
 * - Empty blocks appear as a very dark navy square.
 * - Captured blocks display the owner's color with a glow effect.
 * - Your own blocks have a brighter inner shine.
 * - Hovering shows a tooltip with the owner's username.
 */
export const Block = ({ ownerColor, ownerName, isOwn, onClick }: BlockProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isCaptured = !!ownerColor;

  return (
    <div className="relative w-full h-full group" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <motion.div
        onClick={onClick}
        initial={false}
        animate={{
          backgroundColor: isCaptured ? ownerColor! : '#0b1120',
          boxShadow: isCaptured
            ? isOwn
              ? `0 0 8px 2px ${ownerColor}99, inset 0 0 6px rgba(255,255,255,0.15)`
              : `0 0 4px 1px ${ownerColor}55, inset 0 0 4px rgba(0,0,0,0.3)`
            : 'none',
        }}
        transition={{ duration: 0.18 }}
        whileHover={{
          backgroundColor: isCaptured ? ownerColor : '#1e2d45',
          scale: 0.88,
          zIndex: 20,
        }}
        whileTap={{ scale: 0.75 }}
        className="w-full h-full cursor-pointer rounded-[1px]"
      />
      {/* Tooltip - shows owner name on hover */}
      {showTooltip && ownerName && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none 
                     px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-xl"
          style={{ backgroundColor: ownerColor, color: '#000' }}
        >
          {ownerName}
        </div>
      )}
    </div>
  );
};