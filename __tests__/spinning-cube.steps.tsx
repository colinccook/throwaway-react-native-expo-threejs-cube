import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../src/App";

const feature = loadFeature("./features/spinning-cube.feature");

// ── Three.js mock ──────────────────────────────────────────────────────────
jest.mock("three", () => {
  const mockVector3 = {
    copy: jest.fn(),
    lerp: jest.fn(),
    set: jest.fn(),
  };
  return {
    Scene: jest.fn(() => ({ add: jest.fn(), background: null })),
    PerspectiveCamera: jest.fn(() => ({
      position: { ...mockVector3, set: jest.fn() },
      lookAt: jest.fn(),
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
    })),
    WebGLRenderer: jest.fn(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: document.createElement("canvas"),
    })),
    BoxGeometry: jest.fn(() => ({ dispose: jest.fn() })),
    MeshStandardMaterial: jest.fn(() => ({ dispose: jest.fn() })),
    Mesh: jest.fn(() => ({
      rotation: { x: 0, y: 0 },
      position: { set: jest.fn() },
      material: { dispose: jest.fn() },
    })),
    DirectionalLight: jest.fn(() => ({ position: { set: jest.fn() } })),
    AmbientLight: jest.fn(),
    Color: jest.fn(),
    Vector3: jest.fn(() => mockVector3),
  };
});

defineFeature(feature, (test) => {
  test("The three-scene canvas fills the entire screen", ({ given, then, and }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the app container should fill the full screen", () => {
      const app = screen.getByTestId("app");
      expect(app).toBeTruthy();
    });

    and("I should see the three-scene canvas", () => {
      expect(screen.getByTestId("three-scene")).toBeTruthy();
    });
  });

  test("An FPS counter is visible in the top-left corner", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see the FPS counter", () => {
      expect(screen.getByTestId("fps-counter")).toBeTruthy();
    });
  });

  test("Navigation dots are visible on the right", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see the navigation dots", () => {
      expect(screen.getByTestId("nav-dots")).toBeTruthy();
    });
  });

  test("The default view is the perspective view", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the vertical scroll position should be 0", () => {
      // The app starts on page 0 — nav-dots aria-label for page 0 dot is "Perspective"
      const dot = screen.getByLabelText("Perspective");
      expect(dot.classList.contains("nav-dots__dot--active")).toBe(true);
    });
  });

  test("Swiping down advances to the top-down view", ({ given, when, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    when("I swipe down", () => {
      const app = screen.getByTestId("app");
      // Swipe from y=100 to y=600 (delta=500px > 50% of jsdom default innerHeight=768)
      // ratio = 500/768 ≈ 0.65, Math.round(0.65) = 1 → snaps to page 1 "Top-down"
      fireEvent.touchStart(app, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(app, { touches: [{ clientX: 200, clientY: 600 }] });
      fireEvent.touchEnd(app);
    });

    then("the vertical scroll position should be greater than 0", () => {
      // The "Perspective" dot (page 0) should no longer be active
      // and the "Top-down" dot (page 1) should now be active.
      const perspectiveDot = screen.getByLabelText("Perspective");
      const topDownDot = screen.getByLabelText("Top-down");
      expect(perspectiveDot.classList.contains("nav-dots__dot--active")).toBe(false);
      expect(topDownDot.classList.contains("nav-dots__dot--active")).toBe(true);
    });
  });

  test("The horizontal sub-dots are visible after the app loads", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see the horizontal sub-dots", () => {
      // The horizontal sub-dots container is always rendered (visible as a hint)
      const horizontalDots = document.querySelector(".nav-dots__horizontal");
      expect(horizontalDots).toBeTruthy();
    });
  });
});

