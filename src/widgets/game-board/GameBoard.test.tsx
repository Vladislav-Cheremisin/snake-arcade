import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GameBoard } from './GameBoard'
import { useSnakeStore } from '../../features/snake/store/useSnakeStore'
import { createInitialState } from '../../features/snake/model/logic'
import { BOARD_SIZE } from '../../features/snake/model/constants'

const rng = () => 0.42

describe('GameBoard', () => {
  beforeEach(() => {
    useSnakeStore.setState(createInitialState(rng))
  })

  afterEach(() => {
    cleanup()
  })

  it('рендерит доску 20x20 и начальный счёт', () => {
    render(<GameBoard />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText(`Счёт: 0`)).toBeInTheDocument()
    expect(document.querySelectorAll('.cell')).toHaveLength(BOARD_SIZE * BOARD_SIZE)
  })

  it('показывает Game Over и перезапускает игру по кнопке', () => {
    render(<GameBoard />)
    act(() => {
      useSnakeStore.setState({ status: 'gameover', score: 7 })
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Игра окончена')
    fireEvent.click(screen.getByRole('button', { name: 'Начать заново' }))
    const state = useSnakeStore.getState()
    expect(state.status).toBe('playing')
    expect(state.score).toBe(0)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('первая клавиша запускает игру', () => {
    render(<GameBoard />)
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(useSnakeStore.getState().status).toBe('playing')
    expect(useSnakeStore.getState().direction).toBe('up')
  })
})
