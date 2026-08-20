'use client'

import React, { useEffect, useState } from 'react'

export interface ProgressRingProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
  circleColor?: string
  progressColor?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  circleColor = 'text-slate-100',
  progressColor = 'text-indigo-600',
  label,
  sublabel,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, progress)))
    }, 150)
    return () => clearTimeout(timer)
  }, [progress])

  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  // Proportionally scale typography based on circle diameter
  const numberFontSize = Math.max(12, Math.round(size * 0.22))
  const labelFontSize = Math.max(8, Math.round(size * 0.08))

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          className={circleColor}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        {/* Animated Progress Bar */}
        <circle
          className={`${progressColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-1">
        <span
          className="font-black text-slate-900 tracking-tight font-outfit leading-none"
          style={{ fontSize: `${numberFontSize}px` }}
        >
          {animatedProgress}%
        </span>
        {label && (
          <span
            className="font-bold text-slate-400 uppercase tracking-wider leading-none mt-1"
            style={{ fontSize: `${labelFontSize}px` }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="text-slate-400 font-medium leading-none mt-0.5"
            style={{ fontSize: `${Math.max(7, labelFontSize - 1)}px` }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
