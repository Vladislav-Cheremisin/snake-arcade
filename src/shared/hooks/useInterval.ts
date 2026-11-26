import { useEffect, useRef } from 'react'

/**
 * Декларативный setInterval. delay = null останавливает тикер.
 * Callback хранится в ref, чтобы не пересоздавать интервал при его смене.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) {
      return
    }
    const id = window.setInterval(() => callbackRef.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
