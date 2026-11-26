import { describe, expect, it } from 'vitest'
import {
  BOARD_SIZE,
  INITIAL_SNAKE,
} from './constants'
import {
  canChangeDirection,
  checkCollision,
  createInitialState,
  spawnFood,
  step,
} from './logic'
import type { GameState, Point } from './types'

const rng = () => 0.42

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    snake: INITIAL_SNAKE.map((segment) => ({ ...segment })),
    direction: 'right',
    food: { x: 15, y: 10 },
    score: 0,
    status: 'playing',
    ...overrides,
  }
}

describe('step', () => {
  it('двигает голову на одну клетку в текущем направлении', () => {
    const state = playingState()
    const next = step(state, rng)
    expect(next.snake[0]).toEqual({ x: 11, y: 10 })
    expect(next.snake).toHaveLength(3)
    expect(next.status).toBe('playing')
  })

  it('растёт и увеличивает счёт при поедании еды', () => {
    const state = playingState({ food: { x: 11, y: 10 } })
    const next = step(state, rng)
    expect(next.snake).toHaveLength(4)
    expect(next.score).toBe(1)
    expect(next.food).not.toEqual({ x: 11, y: 10 })
  })

  it('новая еда не появляется на теле змейки', () => {
    const state = playingState({ food: { x: 11, y: 10 } })
    const next = step(state, rng)
    expect(next.snake.some((segment) => segment.x === next.food.x && segment.y === next.food.y)).toBe(false)
  })

  it('не двигается, если игра не запущена', () => {
    const state = playingState({ status: 'idle' })
    expect(step(state, rng)).toBe(state)
  })

  it('столкновение со стеной → gameover', () => {
    const state = playingState({
      snake: [
        { x: BOARD_SIZE - 1, y: 5 },
        { x: BOARD_SIZE - 2, y: 5 },
      ],
      direction: 'right',
    })
    const next = step(state, rng)
    expect(next.status).toBe('gameover')
  })

  it('столкновение с собой → gameover', () => {
    // Петля: голова ползёт вверх в клетку, занятую телом (не хвостом).
    const snake: Point[] = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
    ]
    const state = playingState({ snake, direction: 'up' })
    const next = step(state, rng)
    expect(next.status).toBe('gameover')
  })
})

describe('canChangeDirection', () => {
  it('запрещает разворот на 180°', () => {
    expect(canChangeDirection('right', 'left')).toBe(false)
    expect(canChangeDirection('up', 'down')).toBe(false)
  })

  it('разрешает повороты и продолжение', () => {
    expect(canChangeDirection('right', 'up')).toBe(true)
    expect(canChangeDirection('right', 'down')).toBe(true)
    expect(canChangeDirection('right', 'right')).toBe(true)
  })
})

describe('checkCollision', () => {
  it('детектирует выход за стену', () => {
    expect(checkCollision([{ x: -1, y: 0 }, { x: 0, y: 0 }])).toBe(true)
    expect(checkCollision([{ x: 0, y: BOARD_SIZE }, { x: 0, y: 0 }])).toBe(true)
  })

  it('детектирует столкновение головы с телом', () => {
    expect(
      checkCollision([
        { x: 2, y: 2 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ]),
    ).toBe(true)
  })

  it('пропускает корректную позицию', () => {
    expect(
      checkCollision([
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ]),
    ).toBe(false)
  })
})

describe('spawnFood', () => {
  it('не помещает еду на тело змейки', () => {
    const snake = INITIAL_SNAKE.map((segment) => ({ ...segment }))
    for (const value of [0, 0.25, 0.5, 0.75, 0.99]) {
      const food = spawnFood(snake, () => value)
      expect(snake.some((segment) => segment.x === food.x && segment.y === food.y)).toBe(false)
    }
  })
})

describe('createInitialState', () => {
  it('создаёт начальное состояние со статусом idle', () => {
    const state = createInitialState(rng)
    expect(state.status).toBe('idle')
    expect(state.score).toBe(0)
    expect(state.snake).toEqual(INITIAL_SNAKE)
  })
})
