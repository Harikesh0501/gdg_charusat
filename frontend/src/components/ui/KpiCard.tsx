'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  delta?: {
    value: string | number
    isPositive?: boolean
    isNeutral?: boolean
  }
  icon?: React.ReactNode
  iconBg?: string
  progress?: number
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  delta,
  icon,
  iconBg = 'bg-indigo-50 text-indigo-600',
  progress,
  className,
}: KpiCardProps) {
  return (
    <div
      className={twMerge(
        'relative p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.08)] hover:border-indigo-200/80 transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">
              {value}
            </span>
            {delta && (
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                  delta.isNeutral
                    ? 'bg-slate-100 text-slate-600'
                    : delta.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                )}
              >
                {delta.isNeutral ? (
                  <Minus className="w-3 h-3" />
                ) : delta.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {delta.value}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div className={clsx('p-3 rounded-xl shrink-0 flex items-center justify-center shadow-2xs', iconBg)}>
            {icon}
          </div>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-4">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500 font-medium">{subtitle}</p>
      )}
    </div>
  )
}
