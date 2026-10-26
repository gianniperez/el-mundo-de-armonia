"use client";

import React from "react";
import { Home, Volume2, VolumeX } from "lucide-react";
import { Button } from "../ui/Button";

interface TopBarProps {
  sceneTitle: string;
  chapterTitle: string;
  onHome: () => void;
  onSave: () => void;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  variant?: "default" | "minimal";
}

export const TopBar: React.FC<TopBarProps> = ({
  sceneTitle,
  chapterTitle,
  onHome,
  onSave,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isMuted,
  onToggleMute,
  variant = "default",
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-12 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between text-xs md:text-sm tracking-wider uppercase font-medium select-none text-neutral-300">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onHome}
          className="hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
          title="Menú Principal"
        >
          <Home className="w-4 h-4" />
        </button>
        {variant !== "minimal" && (
          <button
            onClick={onSave}
            className="hover:text-white transition-colors px-2.5 py-1 rounded hover:bg-white/10 flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Guardar partida"
          >
            <span>Guardar</span>
          </button>
        )}
      </div>

      {/* Center scene / chapter indicator */}
      {variant !== "minimal" && (
        <div className="text-center font-title-serif font-medium text-white/95 truncate max-w-[48%] text-xs md:text-sm tracking-widest uppercase">
          {sceneTitle} {chapterTitle ? `— ${chapterTitle}` : ""}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onToggleMute}
          className="hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 cursor-pointer"
          title={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        <Button
          onClick={onBack}
          disabled={!canGoBack}
          size="sm"
          variant="ghost"
        >
          <span className="hidden sm:inline">Volver</span>
        </Button>

        <Button
          onClick={onNext}
          disabled={!canGoNext}
          size="sm"
          variant="ghost"
        >
          <span className="hidden sm:inline">Siguiente</span>
        </Button>
      </div>
    </header>
  );
};
