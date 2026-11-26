export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Point {
  x: number
  y: number
}

export type GameStatus = 'idle' | 'playing' | 'gameover'

/** Тип генератора случайных чисел: детерминированный rng подаётся в тестах. */
export type Rng = () => number

export interface GameState {
  snake: Point[]
  direction: Direction
  food: Point
  score: number
  status: GameStatus
}
