'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-widest uppercase transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 rounded-xl gap-1.5',
    md: 'text-xs md:text-sm px-7 py-3 rounded-2xl gap-2 font-semibold',
    lg: 'text-sm md:text-base px-9 py-4 rounded-2xl gap-2.5 font-bold',
  }

  const variantStyles = {
    // Estilo idéntico al botón negro con borde suave de los bocetos originales
    primary:
      'bg-black/95 text-white border border-white/30 hover:border-amber-300 hover:bg-neutral-900 shadow-xl hover:shadow-amber-500/10 active:bg-neutral-950',
    // Estilo translúcido glassmorphism
    glass:
      'bg-black/60 backdrop-blur-md text-white border border-white/20 hover:border-white/50 hover:bg-black/80 shadow-lg',
    // Estilo secundario ámbar
    secondary:
      'bg-amber-400 text-black hover:bg-amber-300 border border-amber-300 shadow-lg font-bold',
    // Estilo transparente solo borde
    ghost:
      'bg-transparent text-neutral-300 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5',
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </motion.button>
  )
}
