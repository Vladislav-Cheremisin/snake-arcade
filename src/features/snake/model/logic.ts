import {
  BOARD_SIZE,
  DIRECTION_VECTORS,
  INITIAL_DIRECTION,
  INITIAL_SNAKE,
  OPPOSITE_DIRECTION,
  SCORE_PER_FOOD,
} from './constants'
import type { Direction, GameState, Point, Rng } from './types'

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y
}

function isOnSnake(snake: Point[], point: Point): boolean {
  return snake.some((segment) => samePoint(segment, point))
}

/**
 * Детерминированный (при передаче rng) спавн еды на свободной клетке.
 * Перебор клеток со сдвигом, зависящим от rng — гарантирует завершение,
 * пока есть хотя бы одна свободная клетка.
 */
export function spawnFood(snake: Point[], rng: Rng): Point {
  const total = BOARD_SIZE * BOARD_SIZE
  const offset = Math.floor(rng() * total)
  for (let i = 0; i < total; i += 1) {
    const index = (offset + i) % total
    const candidate: Point = {
      x: index % BOARD_SIZE,
      y: Math.floor(index / BOARD_SIZE),
    }
    if (!isOnSnake(snake, candidate)) {
      return candidate
    }
  }
  // Поле заполнено — возвращаем заведомо недостижимую клетку.
  return { x: -1, y: -1 }
}

export function createInitialState(rng: Rng = Math.random): GameState {
  return {
    snake: INITIAL_SNAKE.map((segment) => ({ ...segment })),
    direction: INITIAL_DIRECTION,
    food: spawnFood(INITIAL_SNAKE, rng),
    score: 0,
    status: 'idle',
  }
}

export function nextHead(head: Point, direction: Direction): Point {
  const vector = DIRECTION_VECTORS[direction]
  return { x: head.x + vector.x, y: head.y + vector.y }
}

/** Разворот на 180° запрещён. */
export function canChangeDirection(
  current: Direction,
  next: Direction,
): boolean {
  return next !== OPPOSITE_DIRECTION[current]
}

/** Столкновение головы со стеной или с собственным телом. */
export function checkCollision(snake: Point[]): boolean {
  const [head, ...body] = snake
  const hitWall =
    head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE
  if (hitWall) {
    return true
  }
  return body.some((segment) => samePoint(segment, head))
}

/**
 * Один игровой тик: движение головы, рост и счёт при поедании еды,
 * столкновение → gameover. Чистая функция, не мутирует state.
 */
export function step(state: GameState, rng: Rng = Math.random): GameState {
  if (state.status !== 'playing') {
    return state
  }

  const head = nextHead(state.snake[0], state.direction)
  const eatsFood = samePoint(head, state.food)

  // При поедании хвост не удаляем (змейка растёт), иначе — удаляем.
  const body = eatsFood ? state.snake : state.snake.slice(0, -1)
  const snake = [head, ...body]

  if (checkCollision(snake)) {
    return { ...state, snake, status: 'gameover' }
  }

  if (eatsFood) {
    return {
      ...state,
      snake,
      score: state.score + SCORE_PER_FOOD,
      food: spawnFood(snake, rng),
    }
  }

  return { ...state, snake }
}
