"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface DialogueBoxProps {
  speakerName?: string;
  speakerStatus?: string;
  dialogueText?: string;
  onAdvance: () => void;
  disabled?: boolean;
  hasCharacter?: boolean;
}

// Subcomponente interno con su propio estado: al cambiar `dialogueText`,
// la `key` en AnimatePresence destruye y recrea esta instancia desde cero con displayedLength = 0.
// Esto elimina completamente la necesidad de reiniciar estado síncronamente dentro de un useEffect.
const DialogueContent: React.FC<DialogueBoxProps> = ({
  speakerName,
  speakerStatus,
  dialogueText = "",
  onAdvance,
  disabled = false,
  hasCharacter = false,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const isFinished = displayedLength >= dialogueText.length;

  // Efecto máquina de escribir progresivo (solo depende del texto de este diálogo)
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= dialogueText.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(timer);
  }, [dialogueText]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (!isFinished) {
      // Si aún está escribiendo, completa el texto de inmediato
      setDisplayedLength(dialogueText.length);
    } else {
      // Si ya terminó de escribir, avanza a la siguiente escena
      onAdvance();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      onClick={handleClick}
      className="relative cursor-pointer"
    >
      {/* Speaker Badge */}
      {speakerName && (
        <div className="absolute -top-4 left-6 z-10">
          <div className="bg-black/95 text-white text-[11px] md:text-xs font-bold tracking-widest uppercase px-5 py-1.5 rounded-full border border-white/20 shadow-lg">
            {speakerName}
          </div>
        </div>
      )}

      {/* Main Dialogue Card */}
      <div className="bg-black/75 backdrop-blur-xl border border-white/25 rounded-2xl px-6 md:px-8 pt-7 pb-6 text-white shadow-2xl min-h-[120px] md:min-h-[140px] flex flex-col justify-between hover:border-white/40 transition-colors">
        <div className={hasCharacter ? "max-w-[90%] md:max-w-xl" : "w-full"}>
          {/* Speaker Status / Stage Directions */}
          {speakerStatus && (
            <p className="text-xs md:text-sm italic text-neutral-300 mb-2 font-sans whitespace-pre-line leading-relaxed">
              {speakerStatus}
            </p>
          )}

          {/* Dialogue text */}
          <p className="text-sm md:text-base leading-relaxed tracking-wide font-normal font-sans text-neutral-100 whitespace-pre-line">
            <span>{dialogueText.slice(0, displayedLength)}</span>
          </p>
        </div>

        {/* Advance indicator */}
        <div className="self-end pt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="text-[10px] tracking-wider opacity-60">
            {!isFinished ? "Clic para completar" : "Clic para continuar"}
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4 text-white/80" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const DialogueBox: React.FC<DialogueBoxProps> = (props) => {
  if (!props.dialogueText && !props.speakerName) return null;

  return (
    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[84%] lg:w-[78%] max-w-4xl z-30 select-none">
      <AnimatePresence mode="wait">
        <DialogueContent key={props.dialogueText || "dialogue"} {...props} />
      </AnimatePresence>
    </div>
  );
};
