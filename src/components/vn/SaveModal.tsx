'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Trash2, Clock } from 'lucide-react'
import { SaveData, SceneData } from '@/types/vn'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  currentScene: SceneData
  onLoadSave: (sceneKey: string) => void
}

const STORAGE_KEY = 'armonia_saved_games'

const loadInitialSlots = (): (SaveData | null)[] => {
  if (typeof window === 'undefined') return [null, null, null]
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as (SaveData | null)[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Error loading save slots', e)
  }
  return [null, null, null]
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  currentScene,
  onLoadSave,
}) => {
  // Inicializamos el estado usando una función perezosa (lazy initializer)
  // De esta manera no se necesita ningún useEffect con setState sincronizado.
  const [slots, setSlots] = useState<(SaveData | null)[]>(loadInitialSlots)
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save')

  const handleSaveToSlot = (slotIndex: number) => {
    const newSave: SaveData = {
      slotId: slotIndex + 1,
      timestamp: new Date().toLocaleString(),
      sceneKey: currentScene.key,
      sceneTitle: currentScene.sceneTitle,
      chapterTitle: currentScene.chapterTitle,
      previewText: currentScene.dialogueText?.slice(0, 80) || currentScene.sceneTitle,
    }

    const updated = [...slots]
    updated[slotIndex] = newSave
    setSlots(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    }
  }

  const handleDeleteSlot = (e: React.MouseEvent, slotIndex: number) => {
    e.stopPropagation()
    const updated = [...slots]
    updated[slotIndex] = null
    setSlots(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    }
  }

  const handleLoadSlot = (slot: SaveData | null) => {
    if (!slot) return
    onLoadSave(slot.sceneKey)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-neutral-900 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('save')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'save'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Guardar Partida
                </button>
                <button
                  onClick={() => setActiveTab('load')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'load'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cargar Partida
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slots List */}
            <div className="flex flex-col gap-3.5">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => (activeTab === 'save' ? handleSaveToSlot(index) : handleLoadSlot(slot))}
                  className={`group border rounded-2xl p-4 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    slot
                      ? 'bg-black/60 border-white/20 hover:border-amber-400 hover:bg-black/80'
                      : 'bg-black/30 border-dashed border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-neutral-300 group-hover:bg-amber-400 group-hover:text-black transition-colors shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      {slot ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-amber-300">
                              {slot.chapterTitle}
                            </span>
                            <span className="text-xs text-neutral-500">•</span>
                            <span className="text-xs text-white font-medium">
                              {slot.sceneTitle}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-1 italic">
                            {slot.previewText}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{slot.timestamp}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-neutral-500 italic py-2">
                          {activeTab === 'save' ? 'Ranura vacía — Clic para guardar aquí' : 'Ranura vacía'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {slot && (
                      <button
                        onClick={(e) => handleDeleteSlot(e, index)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Borrar ranura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {activeTab === 'save' ? (
                      <span className="text-xs font-medium text-amber-300 group-hover:underline px-2">
                        {slot ? 'Sobrescribir' : 'Guardar'}
                      </span>
                    ) : slot ? (
                      <button className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-lg group-hover:bg-amber-400 group-hover:text-black transition-all cursor-pointer">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Cargar</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
