# React Three.js Spinning Cube PWA

A Progressive Web App that renders a spinning 3D cube using React, Three.js, TypeScript, and Vite. Statically hosted on GitHub Pages.

## Screenshot

![Spinning Cube - Web](docs/web-preview.png)

## Live Demo

👉 [View on GitHub Pages](https://colinccook.github.io/throwaway-react-native-expo-threejs-cube/)

## Tech Stack

- **React 19** with [Vite](https://vite.dev/) for fast development and optimized builds
- **Three.js** for WebGL 3D rendering
- **TypeScript** for type safety
- **PWA** with web app manifest for installability
- **Jest** + [jest-cucumber](https://github.com/bencompton/jest-cucumber) for BDD testing
- **GitHub Actions** for CI/CD (test, build, deploy)
- **GitHub Pages** for static web hosting

## Project Structure

```
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Main app with title and cube container
│   ├── components/
│   │   └── SpinningCube.tsx    # Three.js spinning cube component
│   └── vite-env.d.ts          # Vite type declarations
├── public/
│   ├── favicon.png             # App icon
│   └── manifest.json           # PWA manifest
├── features/
│   └── spinning-cube.feature   # BDD feature file (Gherkin)
├── __tests__/
│   └── spinning-cube.steps.tsx  # BDD step definitions
├── .github/workflows/
│   ├── test.yml                # Run BDD tests on PRs
│   ├── build.yml               # Build web artifact
│   └── deploy-pages.yml        # Deploy web build to GitHub Pages
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── jest.config.cjs             # Jest configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

The output is written to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## CI/CD Pipelines

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Test** | Pull requests to `main` | Runs BDD tests |
| **Build** | Push to `main` + PRs | Builds web bundle |
| **Deploy Pages** | Push to `main` | Deploys web build to GitHub Pages |

## BDD Tests

Tests are written in Gherkin syntax (`features/spinning-cube.feature`) with step definitions in `__tests__/spinning-cube.steps.tsx`.

```gherkin
Feature: Spinning Cube Display

  Scenario: The spinning cube is displayed on the main screen
    Given the app has loaded
    Then I should see the title "Three.js Spinning Cube"
    And I should see the spinning cube
```

## Instructions for Future Prompting

When extending this project, keep the following in mind:

### Adding New 3D Objects
- Create new components in `src/components/` following the pattern in `SpinningCube.tsx`
- Use Three.js `WebGLRenderer` directly — no wrapper libraries needed
- Add a `data-testid` attribute to the container `<div>` for testability

### Adding New BDD Tests
- Write `.feature` files in the `features/` directory using Gherkin syntax
- Write corresponding `.steps.tsx` files in `__tests__/`
- Mock `three` in tests since WebGL is not available in the jsdom test environment
- Use `@testing-library/react` with `jest-environment-jsdom` for DOM-based testing

### Modifying the App Layout
- `src/App.tsx` is the root component; it provides the dark background, title, and cube container
- Styles use standard React inline `CSSProperties`

### Dependency Notes
- No `--legacy-peer-deps` needed; all dependencies resolve cleanly
- Use `npm install <package>` to add new dependencies

### GitHub Pages
- The web build is deployed from the `dist/` directory
- Vite's `base` option is set to the repository name for correct asset paths
- The deployment workflow runs on push to `main`
- Ensure GitHub Pages is enabled in repository settings (Settings → Pages → Source: GitHub Actions)
