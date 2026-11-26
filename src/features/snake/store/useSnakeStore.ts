import { create } from 'zustand'
import {
  canChangeDirection,
  createInitialState,
  step,
} from '../model/logic'
import type { Direction, Rng } from '../model/types'

export interface SnakeStore extends ReturnType<typeof createInitialState> {
  start: () => void
  restart: () => void
  changeDirection: (direction: Direction) => void
  tick: (rng?: Rng) => void
}

export const useSnakeStore = create<SnakeStore>((set, get) => ({
  ...createInitialState(),

  start: () => {
    if (get().status === 'idle') {
      set({ status: 'playing' })
    }
  },

  restart: () => {
    set({ ...createInitialState(), status: 'playing' })
  },

  changeDirection: (direction: Direction) => {
    const { direction: current, status } = get()
    if (status === 'gameover') {
      return
    }
    if (!canChangeDirection(current, direction)) {
      return
    }
    set({ direction })
  },

  tick: (rng?: Rng) => {
    set((state) => step(state, rng ?? Math.random))
  },
}))
