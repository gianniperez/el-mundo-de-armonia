"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChoiceOption } from "@/types/vn";

interface ChoiceOverlayProps {
  choices: ChoiceOption[];
  onSelectChoice: (targetSceneKey: string) => void;
}

export const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({
  choices,
  onSelectChoice,
}) => {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute top-[26%] sm:top-[28%] md:top-[28%] left-[8%] sm:left-[10%] md:left-[14%] w-[75%] sm:w-[50%] md:w-[42%] max-w-md pointer-events-auto flex flex-col gap-2.5 sm:gap-3"
      >
        {choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelectChoice(choice.targetSceneKey)}
            className="w-full group bg-black/90 hover:bg-black border border-white/35 hover:border-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 transition-all duration-200 shadow-2xl cursor-pointer text-center"
          >
            <p className="text-white text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-sans font-normal tracking-wide text-center leading-relaxed whitespace-pre-line">
              {choice.text}
            </p>
            {choice.hint && (
              <p className="text-[11px] text-neutral-400 mt-1 font-serif italic text-center">
                {choice.hint}
              </p>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
