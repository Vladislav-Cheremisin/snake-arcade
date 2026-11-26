import { useCallback, useEffect, useRef } from 'react'
import { useSnakeStore } from '../../features/snake/store/useSnakeStore'
import type { Direction } from '../../features/snake/model/types'
import { BOARD_SIZE } from '../../features/snake/model/constants'
import { useInterval } from '../../shared/hooks/useInterval'
import { useSwipe } from '../../shared/hooks/useSwipe'
import './GameBoard.css'

const TICK_MS = 120

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

function cellIndex(x: number, y: number): number {
  return y * BOARD_SIZE + x
}

export function GameBoard() {
  const snake = useSnakeStore((state) => state.snake)
  const food = useSnakeStore((state) => state.food)
  const score = useSnakeStore((state) => state.score)
  const status = useSnakeStore((state) => state.status)
  const start = useSnakeStore((state) => state.start)
  const restart = useSnakeStore((state) => state.restart)
  const changeDirection = useSnakeStore((state) => state.changeDirection)
  const tick = useSnakeStore((state) => state.tick)
  const boardRef = useRef<HTMLDivElement>(null)

  const applyDirection = useCallback(
    (direction: Direction) => {
      start()
      changeDirection(direction)
    },
    [start, changeDirection],
  )

  useSwipe(boardRef, applyDirection)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key]
      if (!direction) {
        return
      }
      event.preventDefault()
      applyDirection(direction)
    },
    [applyDirection],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useInterval(tick, status === 'playing' ? TICK_MS : null)

  const snakeCells = new Set(snake.map((segment) => cellIndex(segment.x, segment.y)))
  const headCell = cellIndex(snake[0].x, snake[0].y)
  const foodCell = cellIndex(food.x, food.y)

  const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
    let className = 'cell'
    if (index === foodCell) {
      className += ' cell--food'
    }
    if (snakeCells.has(index)) {
      className += index === headCell ? ' cell--head' : ' cell--snake'
    }
    return <div key={index} className={className} />
  })

  return (
    <section className="game">
      <header className="game__hud">
        <span className="game__score">Счёт: {score}</span>
        {status === 'idle' && (
          <span className="game__hint">Нажмите стрелку, WASD или свайпните, чтобы начать</span>
        )}
      </header>
      <div
        className="game__board"
        role="grid"
        aria-label="Игровое поле змейки"
        ref={boardRef}
      >
        {cells}
        {status === 'gameover' && (
          <div className="game__overlay" role="alert">
            <h2 className="game__over-title">Игра окончена</h2>
            <p className="game__over-score">Счёт: {score}</p>
            <button type="button" className="game__restart" onClick={restart}>
              Начать заново
            </button>
          </div>
        )}
      </div>
      <div className="game__controls" aria-label="Экранные кнопки направления">
        <button type="button" className="game__pad-btn game__pad-btn--up" aria-label="Вверх" onClick={() => applyDirection('up')}>
          ↑
        </button>
        <button type="button" className="game__pad-btn game__pad-btn--left" aria-label="Влево" onClick={() => applyDirection('left')}>
          ←
        </button>
        <button type="button" className="game__pad-btn game__pad-btn--right" aria-label="Вправо" onClick={() => applyDirection('right')}>
          →
        </button>
        <button type="button" className="game__pad-btn game__pad-btn--down" aria-label="Вниз" onClick={() => applyDirection('down')}>
          ↓
        </button>
      </div>
    </section>
  )
}
