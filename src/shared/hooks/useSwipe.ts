import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** Свайпы короче порога (px) считаются случайными касаниями и игнорируются. */
export const SWIPE_THRESHOLD = 30

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

interface Point {
  x: number
  y: number
}

/**
 * Свайп-управление: touchstart/touchend на элементе ref.
 * Определяет доминирующую ось жеста и вызывает onSwipe при проходе порога.
 * Скролл отключается на уровне CSS (touch-action на доске) + preventDefault.
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (direction: SwipeDirection) => void,
): void {
  const startRef = useRef<Point | null>(null)
  const callbackRef = useRef(onSwipe)

  useEffect(() => {
    callbackRef.current = onSwipe
  }, [onSwipe])

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      startRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start) {
        return
      }
      const touch = event.changedTouches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) {
        return
      }
      event.preventDefault()
      const direction: SwipeDirection =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')
      callbackRef.current(direction)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref])
}
