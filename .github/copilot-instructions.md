# Copilot Instructions

## Always Update Documentation and Tests

**With every prompt, you must:**

1. Update `README.md` to reflect any new features, UI changes, or architecture decisions.
2. Update (or add) BDD feature files in `features/` using Gherkin syntax.
3. Update (or add) step definitions in `__tests__/` matching the feature files.
4. Add screenshots to `docs/` (e.g. `docs/web-preview.png`) whenever the visual appearance changes.

---

## Project Overview

This is a React + Three.js PWA built with Vite and TypeScript. It renders three rotating 3D cubes with a TikTok/Shorts-style swipable interface.

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Gesture handling, page state, FPS overlay, nav dots |
| `src/components/ThreeScene.tsx` | Three.js scene: 3 cubes, camera views, FPS tracking |
| `src/styles/global.scss` | Full-screen reset, no-scroll, touch-action:none |
| `src/styles/app.scss` | Nav dots, FPS counter, app chrome styles |
| `features/spinning-cube.feature` | BDD scenarios (Gherkin) |
| `__tests__/spinning-cube.steps.tsx` | Jest-cucumber step definitions |

### Camera Views

`ThreeScene` reads `verticalTRef` (0–3) and `horizontalTRef` (0–2) from `MutableRefObject<number>` every animation frame:

| `verticalTRef` value | Camera |
|---|---|
| 0 | Perspective (default) |
| 1 | Top-down |
| 2 | Side |
| 3 + `horizontalTRef` 0/1/2 | Focus on cube 0/1/2 |

---

## Tech Stack

- React 19, Vite, TypeScript
- Three.js (WebGLRenderer directly)
- SCSS via `sass`
- Jest + jest-cucumber (BDD)
- GitHub Actions CI/CD → GitHub Pages

## Coding Conventions

- SCSS for all styles (no inline `CSSProperties` for layout)
- `data-testid` on every interactive/visible component for testability
- Mock `three` and SCSS in Jest tests (`__mocks__/styleMock.js` + `jest.config.cjs` `moduleNameMapper`)
- Gesture state uses `useRef` (not `useState`) to avoid re-renders in the animation loop
- Camera tweening: refs read by `requestAnimationFrame` loop, lerp factor ≈ 0.12–0.13

## Running Locally

```bash
npm install
npm run dev      # dev server
npm test         # BDD tests
npm run build    # production build
```
