# Змейка (snake-arcade)

Классическая браузерная «Змейка»: поле 20×20, рост за съеденную еду, столкновение со стеной или с собой завершает игру.

## Управление

- **Стрелки** или **WASD** — движение
- Первая клавиша запускает игру
- **«Начать заново»** — рестарт после Game Over

## Стек

- **React 19 + Vite + TypeScript (strict)**
- Состояние — **Zustand**: лёгкий стор без бойлерплейта, удобный доступ вне React (полезно для тестов и чистых тиков), нет провайдеров-обёрток.

## Архитектура (FSD)

- `src/app/` — bootstrap (`main.tsx`), композиция `App`, глобальные стили
- `src/widgets/game-board/` — виджет игры: рендер доски, клавиатура, Game Over, счёт
- `src/features/snake/model/` — чистая игровая логика (без React): `step`, `checkCollision`, `spawnFood` (детерминированный rng), константы
- `src/features/snake/store/` — zustand-стор и actions (`start`, `restart`, `changeDirection`, `tick`)
- `src/shared/` — `useInterval`, тестовый setup

Игровой тик (≈120 мс) — через `useInterval` в компоненте, не в сторе.

## Команды

```bash
npm install
npm run dev        # dev-сервер
npm run typecheck  # проверка типов (strict)
npm test           # тесты (Vitest + Testing Library, jsdom)
npm run build      # сборка
```

## Демо

GitHub Pages: https://vladislav-cheremisin.github.io/snake-arcade/

---

**Разработано и дорабатывается автоматически с помощью Kimi Work**
