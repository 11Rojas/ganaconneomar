"use client"

import { useState, useEffect } from "react"
import { Clock, Zap } from "lucide-react"

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setIsExpired(true)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (isExpired) {
    return (
      <div className="countdown-timer text-center bg-red-900/20 border-red-500">
        <div className="flex items-center justify-center text-red-400">
          <Clock className="w-5 h-5 mr-2" />
          <span className="font-semibold">🔴 Rifa Finalizada</span>
        </div>
      </div>
    )
  }

  return (
    <div className="countdown-timer bg-gradient-to-r from-gray-900 to-gray-800 border-yellow-400/50">
      <div className="flex items-center justify-center mb-3">
        <Zap className="w-5 h-5 mr-2 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">⏰ Tiempo Restante</span>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-gray-400 font-medium">Días</div>
        </div>
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-gray-400 font-medium">Horas</div>
        </div>
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-400 font-medium">Min</div>
        </div>
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white animate-pulse">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-400 font-medium">Seg</div>
        </div>
      </div>
    </div>
  )
}
