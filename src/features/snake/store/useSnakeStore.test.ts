import { beforeEach, describe, expect, it } from 'vitest'
import { useSnakeStore } from './useSnakeStore'
import { createInitialState } from '../model/logic'

const rng = () => 0.42

describe('useSnakeStore', () => {
  beforeEach(() => {
    useSnakeStore.setState(createInitialState(rng))
  })

  it('start переводит игру из idle в playing', () => {
    expect(useSnakeStore.getState().status).toBe('idle')
    useSnakeStore.getState().start()
    expect(useSnakeStore.getState().status).toBe('playing')
  })

  it('поедание еды увеличивает счёт и длину змейки', () => {
    const before = useSnakeStore.getState()
    const lengthBefore = before.snake.length
    // Кладём еду прямо перед головой (движение вправо).
    useSnakeStore.setState({
      status: 'playing',
      food: { x: before.snake[0].x + 1, y: before.snake[0].y },
    })
    useSnakeStore.getState().tick(rng)
    const after = useSnakeStore.getState()
    expect(after.score).toBe(1)
    expect(after.snake).toHaveLength(lengthBefore + 1)
  })

  it('changeDirection запрещает разворот на 180°', () => {
    useSnakeStore.getState().changeDirection('left')
    expect(useSnakeStore.getState().direction).toBe('right')
    useSnakeStore.getState().changeDirection('up')
    expect(useSnakeStore.getState().direction).toBe('up')
  })

  it('restart сбрасывает счёт и запускает игру заново', () => {
    useSnakeStore.setState({ score: 5, status: 'gameover' })
    useSnakeStore.getState().restart()
    const state = useSnakeStore.getState()
    expect(state.status).toBe('playing')
    expect(state.score).toBe(0)
    expect(state.snake).toHaveLength(3)
  })

  it('togglePause переключает playing <-> paused', () => {
    useSnakeStore.getState().start()
    useSnakeStore.getState().togglePause()
    expect(useSnakeStore.getState().status).toBe('paused')
    useSnakeStore.getState().togglePause()
    expect(useSnakeStore.getState().status).toBe('playing')
  })

  it('togglePause игнорируется в idle и gameover', () => {
    expect(useSnakeStore.getState().status).toBe('idle')
    useSnakeStore.getState().togglePause()
    expect(useSnakeStore.getState().status).toBe('idle')
    useSnakeStore.setState({ status: 'gameover' })
    useSnakeStore.getState().togglePause()
    expect(useSnakeStore.getState().status).toBe('gameover')
  })

  it('tick в паузе не двигает змейку и не меняет счёт', () => {
    useSnakeStore.getState().start()
    useSnakeStore.getState().togglePause()
    const snakeBefore = useSnakeStore.getState().snake.map((s) => ({ ...s }))
    const scoreBefore = useSnakeStore.getState().score
    useSnakeStore.getState().tick(rng)
    const after = useSnakeStore.getState()
    expect(after.status).toBe('paused')
    expect(after.snake).toEqual(snakeBefore)
    expect(after.score).toBe(scoreBefore)
  })
})
