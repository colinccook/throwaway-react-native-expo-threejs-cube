import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../src/App";

const feature = loadFeature("./features/spinning-cube.feature");

// ── Audio mock ──────────────────────────────────────────────────────────────
jest.mock("../src/audio/sfx", () => ({
  ensureAudioContext: jest.fn(),
  playBeep: jest.fn(),
  playSwish: jest.fn(),
  startSwipeSound: jest.fn(),
  updateSwipeSound: jest.fn(),
  stopSwipeSound: jest.fn(),
}));

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

  test("There are exactly 3 vertical navigation dots", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see 3 vertical navigation dots", () => {
      const navDots = screen.getByTestId("nav-dots");
      const items = navDots.querySelectorAll(".nav-dots__item");
      expect(items.length).toBe(3);
    });
  });

  test("The default view is the side view", ({ given, then, and }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the vertical scroll position should be 0", () => {
      // The app starts on page 0 — nav-dots aria-label for page 0 dot is "Side view"
      const dot = screen.getByLabelText("Side view");
      expect(dot.classList.contains("nav-dots__dot--active")).toBe(true);
    });

    and(/^the page title should show "(.+)"$/, (expectedTitle: string) => {
      const titleEl = screen.getByTestId("page-title-0");
      expect(titleEl.textContent).toBe(expectedTitle);
    });
  });

  test("Swiping up advances to the top view", ({ given, when, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    when("I swipe up", () => {
      const app = screen.getByTestId("app");
      // Swipe up: from y=600 to y=100 (delta=-500px, negated ratio = 500/768 ≈ 0.65)
      // Math.round(0.65) = 1 → snaps to page 1 "Top view"
      fireEvent.touchStart(app, { touches: [{ clientX: 200, clientY: 600 }] });
      fireEvent.touchMove(app, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchEnd(app);
    });

    then("the vertical scroll position should be greater than 0", () => {
      // The "Side view" dot (page 0) should no longer be active
      // and the "Top view" dot (page 1) should now be active.
      const sideDot = screen.getByLabelText("Side view");
      const topDot = screen.getByLabelText("Top view");
      expect(sideDot.classList.contains("nav-dots__dot--active")).toBe(false);
      expect(topDot.classList.contains("nav-dots__dot--active")).toBe(true);
    });
  });

  test("The horizontal sub-dots are visible after the app loads", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see the horizontal sub-dots", () => {
      const horizontalDots = screen.getByTestId("horizontal-sub-dots");
      expect(horizontalDots).toBeTruthy();
    });
  });

  test("The page title overlay is visible", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("I should see the page title overlay", () => {
      const titleOverlay = screen.getByTestId("page-title");
      expect(titleOverlay).toBeTruthy();
      // All 5 title slides should be present
      expect(screen.getByTestId("page-title-0").textContent).toBe("Side view");
      expect(screen.getByTestId("page-title-1").textContent).toBe("Top view");
      expect(screen.getByTestId("page-title-2").textContent).toBe("Cube 1 view");
      expect(screen.getByTestId("page-title-3").textContent).toBe("Cube 2 view");
      expect(screen.getByTestId("page-title-4").textContent).toBe("Cube 3 view");
    });
  });

  test("The horizontal sub-dots are rendered in normal order", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the horizontal sub-dots should be in normal cube order", () => {
      const horizontalDots = screen.getByTestId("horizontal-sub-dots");
      const dots = horizontalDots.querySelectorAll(".nav-dots__dot");
      // Dots are rendered in normal order: Cube 1, Cube 2, Cube 3 (left to right)
      expect(dots.length).toBe(3);
      expect(dots[0].getAttribute("aria-label")).toBe("Cube 1");
      expect(dots[1].getAttribute("aria-label")).toBe("Cube 2");
      expect(dots[2].getAttribute("aria-label")).toBe("Cube 3");
    });
  });

  test("The page title uses a sci-fi font class", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the page title slides should exist for sci-fi styling", () => {
      const slide = screen.getByTestId("page-title-0");
      expect(slide.classList.contains("page-title__slide")).toBe(true);
    });
  });

  test("The active navigation dot has the strobing class", ({ given, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then("the active dot should have the active modifier class", () => {
      const dot = screen.getByLabelText("Side view");
      expect(dot.classList.contains("nav-dots__dot--active")).toBe(true);
    });
  });

  test("Swipe sounds are triggered during drag gestures", ({ given, when, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    when("I begin a swipe gesture", () => {
      const app = screen.getByTestId("app");
      fireEvent.touchStart(app, { touches: [{ clientX: 200, clientY: 600 }] });
      fireEvent.touchMove(app, { touches: [{ clientX: 200, clientY: 400 }] });
      fireEvent.touchEnd(app);
    });

    then("the swipe sound functions should have been called", () => {
      const sfx = require("../src/audio/sfx");
      expect(sfx.ensureAudioContext).toHaveBeenCalled();
      expect(sfx.startSwipeSound).toHaveBeenCalled();
      expect(sfx.stopSwipeSound).toHaveBeenCalled();
    });
  });

  test("A quick fling gesture advances the page without large movement", ({ given, when, then }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    when("I perform a quick fling upward", () => {
      // Simulate a fast fling: small finger movement (50px) in a short time (50ms).
      // Without fling detection this would NOT advance the page (50/768 ≈ 0.065 rounds to 0).
      // With fling detection: velY = α*(−50/50) + (1−α)*0 = 0.5*(−1) = −0.5 px/ms,
      // |velY| = 0.5 ≥ 0.3 threshold → page transition triggered.
      const dateSpy = jest.spyOn(Date, "now");
      dateSpy.mockReturnValueOnce(1000); // onDragStart: initialise lastTime
      dateSpy.mockReturnValueOnce(1050); // onDragMove: compute dt (50 ms)
      dateSpy.mockReturnValue(1050);     // any subsequent calls

      const app = screen.getByTestId("app");
      fireEvent.touchStart(app, { touches: [{ clientX: 200, clientY: 600 }] });
      fireEvent.touchMove(app, { touches: [{ clientX: 200, clientY: 550 }] }); // only 50px up
      fireEvent.touchEnd(app);

      dateSpy.mockRestore();
    });

    then("the vertical scroll position should be greater than 0", () => {
      const sideDot = screen.getByLabelText("Side view");
      const topDot = screen.getByLabelText("Top view");
      expect(sideDot.classList.contains("nav-dots__dot--active")).toBe(false);
      expect(topDot.classList.contains("nav-dots__dot--active")).toBe(true);
    });
  });
});

