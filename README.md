# React Native Expo Three.js Spinning Cube

A proof-of-concept React Native Expo application that renders a spinning 3D cube using Three.js and TypeScript. The web version is statically hosted on GitHub Pages.

## Screenshot

![Spinning Cube - Web](docs/web-preview.png)

## Live Demo

👉 [View on GitHub Pages](https://colinccook.github.io/throwaway-react-native-expo-threejs-cube/)

## Tech Stack

- **React Native** via [Expo](https://expo.dev/) (SDK 55)
- **Three.js** via [expo-three](https://github.com/nicktomlin/expo-three) + [expo-gl](https://docs.expo.dev/versions/latest/sdk/gl-view/)
- **TypeScript** for type safety
- **Jest** + [jest-cucumber](https://github.com/bencompton/jest-cucumber) for BDD testing
- **GitHub Actions** for CI/CD (test, build, deploy)
- **GitHub Pages** for static web hosting

## Project Structure

```
├── App.tsx                    # Main app with title and cube container
├── components/
│   └── SpinningCube.tsx       # Three.js spinning cube component
├── features/
│   └── spinning-cube.feature  # BDD feature file (Gherkin)
├── __tests__/
│   └── spinning-cube.steps.tsx # BDD step definitions
├── .github/workflows/
│   ├── test.yml               # Run BDD tests on PRs
│   ├── build.yml              # Build Android, iOS and web artifacts
│   └── deploy-pages.yml       # Deploy web build to GitHub Pages
├── babel.config.js
├── jest.config.js
├── tsconfig.json
└── app.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Run Locally

```bash
# Web
npm run web

# Android (requires Android SDK or Expo Go)
npm run android

# iOS (requires macOS + Xcode or Expo Go)
npm run ios
```

### Run Tests

```bash
npm test
```

### Build for Web

```bash
npm run build:web
```

The output is written to the `dist/` directory.

## CI/CD Pipelines

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Test** | Pull requests to `main` | Runs BDD tests |
| **Build** | Push to `main` + PRs | Builds Android APK, iOS simulator app, and web bundle |
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
- Create new components in the `components/` directory following the pattern in `SpinningCube.tsx`
- Use `expo-gl` for the GL context and `expo-three` for the Three.js renderer bridge
- Add a `testID` prop to the `GLView` for testability

### Adding New BDD Tests
- Write `.feature` files in the `features/` directory using Gherkin syntax
- Write corresponding `.steps.tsx` files in `__tests__/`
- Mock `expo-gl` and `expo-three` in tests since WebGL is not available in the test environment
- Use `@testing-library/react` (not `react-native`) with `jest-expo/web` preset for DOM-based testing

### Modifying the App Layout
- `App.tsx` is the root component; it provides the dark background, title, and cube container
- Styles use React Native `StyleSheet` (works on all platforms)

### Dependency Notes
- Use `--legacy-peer-deps` when installing packages due to `expo-three` peer dependency constraints on the `three` package version
- Run `npx expo install <package>` to ensure Expo-compatible versions

### GitHub Pages
- The web build is deployed from the `dist/` directory
- The deployment workflow runs on push to `main`
- Ensure GitHub Pages is enabled in repository settings (Settings → Pages → Source: GitHub Actions)
