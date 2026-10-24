'use client'

import React from 'react'
import { Home, Save, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'

interface TopBarProps {
  sceneTitle: string
  chapterTitle: string
  onHome: () => void
  onSave: () => void
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  isMuted: boolean
  onToggleMute: () => void
  variant?: 'default' | 'minimal'
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
  variant = 'default',
}) => {
  if (variant === 'minimal') {
    return (
      <header className="absolute top-0 left-0 right-0 z-40 h-16 bg-transparent px-6 md:px-12 flex items-center justify-between text-sm select-none text-white/90 pointer-events-auto">
        <div>
          <button
            onClick={onHome}
            className="hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
            title="Menú Principal"
          >
            <Home className="w-5 h-5 text-white/90 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm tracking-wide">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`transition-colors ${
              canGoBack ? 'text-white/80 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            Volver
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`transition-colors ${
              canGoNext ? 'text-white/80 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-40 h-12 bg-black/85 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between text-xs md:text-sm tracking-wider uppercase font-medium select-none text-neutral-300">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onHome}
          className="hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 flex items-center gap-1.5"
          title="Menú Principal"
        >
          <Home className="w-4 h-4" />
        </button>
        <button
          onClick={onSave}
          className="hover:text-white transition-colors px-2.5 py-1 rounded hover:bg-white/10 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar</span>
        </button>
      </div>

      {/* Center scene / chapter indicator */}
      <div className="text-center font-semibold text-white/95 truncate max-w-[45%] text-[11px] md:text-xs tracking-widest">
        {sceneTitle} {chapterTitle ? `— ${chapterTitle}` : ''}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onToggleMute}
          className="hover:text-white transition-colors p-1.5 rounded hover:bg-white/10"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
            canGoBack ? 'hover:text-white hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Volver</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
            canGoNext ? 'hover:text-white hover:bg-white/10 cursor-pointer font-bold text-white' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
