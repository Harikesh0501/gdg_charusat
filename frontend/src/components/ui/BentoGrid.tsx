'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={twMerge(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  badge,
  action,
  shimmer = false,
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
  shimmer?: boolean
}) {
  return (
    <div
      className={twMerge(
        'group relative row-span-1 rounded-2xl p-6 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.09)] hover:border-indigo-300/80 transition-all duration-300 flex flex-col justify-between overflow-hidden',
        shimmer && 'ring-1 ring-indigo-500/20 shadow-indigo-500/10',
        className
      )}
    >
      {shimmer && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse" />
      )}

      {header && <div className="mb-4">{header}</div>}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            {icon && (
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                {icon}
              </div>
            )}
            {badge && <div>{badge}</div>}
          </div>

          {title && (
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              {title}
            </h4>
          )}

          {description && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {action && <div className="mt-5 pt-3 border-t border-slate-100">{action}</div>}
      </div>
    </div>
  )
}
