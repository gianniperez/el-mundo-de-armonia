"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterOnStage } from "@/types/vn";

interface CharacterStageProps {
  characters?: CharacterOnStage[];
}

const positionClasses = {
  left: "left-[5%] md:left-[8%]",
  center: "left-1/2 -translate-x-1/2",
  right: "right-[3%] sm:right-[6%] md:right-[4%]",
};

export const CharacterStage: React.FC<CharacterStageProps> = ({
  characters = [],
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-35">
      <AnimatePresence>
        {characters.map((char) => (
          <motion.div
            key={`${char.id}-${char.position}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`absolute bottom-0 ${positionClasses[char.position]} flex flex-col items-center select-none`}
          >
            {/* Character Sprite - Escala y alineación exacta (+10px según feedback) */}
            <div className="relative w-[320px] sm:w-[390px] md:w-[450px] lg:w-[500px] h-[510px] sm:h-[610px] md:h-[690px] lg:h-[760px] flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={char.spriteUrl}
                alt={char.name}
                className="w-full h-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
