'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCw, Smartphone } from 'lucide-react'

export const OrientationGuard: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width < height and is a mobile/small screen
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 850
      setIsPortrait(portrait)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isPortrait) return null

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-white select-none">
      <motion.div
        animate={{ rotate: [0, 90, 90, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <Smartphone className="w-16 h-16 text-amber-300" />
        <RotateCw className="w-6 h-6 text-white absolute -top-1 -right-1" />
      </motion.div>

      <h2 className="text-xl font-bold tracking-wide uppercase mb-2">
        Gira tu dispositivo
      </h2>
      <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
        <span className="text-amber-200 font-medium">El Mundo de Armonía</span> está diseñado para vivirse en pantalla horizontal.
      </p>
    </div>
  )
}
