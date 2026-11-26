import { fireEvent, render } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SWIPE_THRESHOLD, useSwipe } from './useSwipe'
import type { SwipeDirection } from './useSwipe'

function Probe({ onSwipe }: { onSwipe: (direction: SwipeDirection) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useSwipe(ref, onSwipe)
  return <div ref={ref} data-testid="pad" />
}

function swipe(pad: HTMLElement, dx: number, dy: number) {
  fireEvent.touchStart(pad, { changedTouches: [{ clientX: 100, clientY: 100 }] })
  return fireEvent.touchEnd(pad, {
    changedTouches: [{ clientX: 100 + dx, clientY: 100 + dy }],
  })
}

describe('useSwipe', () => {
  it('игнорирует жест короче порога', () => {
    const onSwipe = vi.fn()
    const { getByTestId } = render(<Probe onSwipe={onSwipe} />)
    swipe(getByTestId('pad'), SWIPE_THRESHOLD - 1, 0)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it.each([
    [40, 0, 'right'],
    [-40, 0, 'left'],
    [0, 40, 'down'],
    [0, -40, 'up'],
  ] as const)('определяет направление жеста (%d, %d) → %s', (dx, dy, expected) => {
    const onSwipe = vi.fn()
    const { getByTestId } = render(<Probe onSwipe={onSwipe} />)
    swipe(getByTestId('pad'), dx, dy)
    expect(onSwipe).toHaveBeenCalledTimes(1)
    expect(onSwipe).toHaveBeenCalledWith(expected)
  })

  it('выбирает доминирующую ось при диагональном жесте', () => {
    const onSwipe = vi.fn()
    const { getByTestId } = render(<Probe onSwipe={onSwipe} />)
    swipe(getByTestId('pad'), 50, -20)
    expect(onSwipe).toHaveBeenCalledWith('right')
  })
})
