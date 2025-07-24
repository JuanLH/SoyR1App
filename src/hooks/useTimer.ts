import { useState, useEffect, useRef } from 'react'

interface UseTimerProps {
  initialTime: number // in seconds
  onTimeUp?: () => void
  autoStart?: boolean
}

export const useTimer = ({ initialTime, onTimeUp, autoStart = false }: UseTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            onTimeUp?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining, onTimeUp])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = () => {
    setTimeRemaining(initialTime)
    setIsRunning(false)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    reset,
    formatTime: formatTime(timeRemaining),
    isTimeUp: timeRemaining === 0
  }
}