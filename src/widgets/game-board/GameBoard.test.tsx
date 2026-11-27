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

  it('свайп по доске запускает игру и меняет направление', () => {
    render(<GameBoard />)
    const board = screen.getByRole('grid')
    fireEvent.touchStart(board, { changedTouches: [{ clientX: 200, clientY: 200 }] })
    fireEvent.touchEnd(board, { changedTouches: [{ clientX: 200, clientY: 260 }] })
    expect(useSnakeStore.getState().status).toBe('playing')
    expect(useSnakeStore.getState().direction).toBe('down')
  })

  it('тап по экранной кнопке запускает игру и меняет направление в сторе', () => {
    render(<GameBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Вверх' }))
    expect(useSnakeStore.getState().status).toBe('playing')
    expect(useSnakeStore.getState().direction).toBe('up')
    fireEvent.click(screen.getByRole('button', { name: 'Влево' }))
    expect(useSnakeStore.getState().direction).toBe('left')
  })

  it('кнопка паузы в HUD переключает паузу по клику', () => {
    render(<GameBoard />)
    act(() => {
      useSnakeStore.setState({ status: 'playing' })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
    expect(useSnakeStore.getState().status).toBe('paused')
    expect(screen.getByRole('status')).toHaveTextContent('Пауза')
    fireEvent.click(screen.getAllByRole('button', { name: 'Продолжить' })[0])
    expect(useSnakeStore.getState().status).toBe('playing')
  })

  it('Space переключает паузу во время игры', () => {
    render(<GameBoard />)
    act(() => {
      useSnakeStore.setState({ status: 'playing' })
    })
    fireEvent.keyDown(window, { key: ' ' })
    expect(useSnakeStore.getState().status).toBe('paused')
    fireEvent.keyDown(window, { key: ' ' })
    expect(useSnakeStore.getState().status).toBe('playing')
  })
})
