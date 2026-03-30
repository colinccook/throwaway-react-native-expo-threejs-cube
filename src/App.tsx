import { useState, useRef, useCallback, useEffect } from "react";
import type * as React from "react";
import ThreeScene from "./components/ThreeScene";
import "./styles/app.scss";

/** Easing factor for the snap-to-page animation (per requestAnimationFrame tick) */
const SNAP_EASING_FACTOR = 0.13;

const TOTAL_PAGES = 3; // 0=side, 1=top, 2=cube-focus
const TOTAL_CUBES = 3;
const CUBE_FOCUS_PAGE = TOTAL_PAGES - 1; // 2

/** Titles for vertical pages (non-cube) */
const PAGE_TITLES = ["Side view", "Top view"];
/** Titles for horizontal cube sub-pages */
const CUBE_TITLES = ["Cube 1 view", "Cube 2 view", "Cube 3 view"];

export default function App() {
  const [fps, setFps] = useState(0);
  const [pageY, setPageY] = useState(0);   // settled vertical page index (0-2)
  const [subX, setSubX] = useState(0);     // settled cube index (0-2) for page 2

  // Live smooth values read by the Three.js render loop every frame
  const verticalTRef = useRef<number>(0);
  const horizontalTRef = useRef<number>(0);

  // Target values that the snap animation drives toward
  const targetVRef = useRef<number>(0);
  const targetHRef = useRef<number>(0);

  const snapAnimRef = useRef<number | null>(null);

  // ── Snap animation ─────────────────────────────────────────────────────
  const runSnapAnimation = useCallback(() => {
    if (snapAnimRef.current !== null) cancelAnimationFrame(snapAnimRef.current);

    const tick = () => {
      const vDiff = targetVRef.current - verticalTRef.current;
      const hDiff = targetHRef.current - horizontalTRef.current;

      if (Math.abs(vDiff) < 0.001 && Math.abs(hDiff) < 0.001) {
        verticalTRef.current = targetVRef.current;
        horizontalTRef.current = targetHRef.current;
        snapAnimRef.current = null;
        return;
      }

      verticalTRef.current += vDiff * SNAP_EASING_FACTOR;
      horizontalTRef.current += hDiff * SNAP_EASING_FACTOR;
      snapAnimRef.current = requestAnimationFrame(tick);
    };

    snapAnimRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Gesture tracking refs ──────────────────────────────────────────────
  const gestureRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    axis: null as "vertical" | "horizontal" | null,
    startPageY: 0,
    startSubX: 0,
  });

  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (snapAnimRef.current !== null) {
        cancelAnimationFrame(snapAnimRef.current);
        snapAnimRef.current = null;
      }
      gestureRef.current = {
        active: true,
        startX: clientX,
        startY: clientY,
        axis: null,
        startPageY: pageY,
        startSubX: subX,
      };
    },
    [pageY, subX]
  );

  const onDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const g = gestureRef.current;
      if (!g.active) return;

      const dx = clientX - g.startX;
      const dy = clientY - g.startY;

      // Determine axis after a small dead-zone
      if (!g.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        g.axis = Math.abs(dy) >= Math.abs(dx) ? "vertical" : "horizontal";
      }

      if (g.axis === "vertical") {
        // Swiping up (dy < 0) advances pages (TikTok-style: 0 → 1 → 2)
        const ratio = -dy / window.innerHeight;
        const raw = g.startPageY + ratio;
        const clamped = Math.max(0, Math.min(TOTAL_PAGES - 1, raw));
        verticalTRef.current = clamped;
        targetVRef.current = clamped;
      } else if (g.axis === "horizontal" && pageY === CUBE_FOCUS_PAGE) {
        // Horizontal only on cube-focus page; swiping left (dx < 0) advances
        const ratio = -dx / window.innerWidth;
        const raw = g.startSubX + ratio;
        const clamped = Math.max(0, Math.min(TOTAL_CUBES - 1, raw));
        horizontalTRef.current = clamped;
        targetHRef.current = clamped;
      }
    },
    [pageY]
  );

  const onDragEnd = useCallback(() => {
    const g = gestureRef.current;
    if (!g.active) return;
    g.active = false;

    if (g.axis === "vertical") {
      const snapped = Math.round(
        Math.max(0, Math.min(TOTAL_PAGES - 1, verticalTRef.current))
      );
      targetVRef.current = snapped;
      setPageY(snapped);
    } else if (g.axis === "horizontal") {
      const snapped = Math.round(
        Math.max(0, Math.min(TOTAL_CUBES - 1, horizontalTRef.current))
      );
      targetHRef.current = snapped;
      setSubX(snapped);
    }

    runSnapAnimation();
  }, [runSnapAnimation]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    [onDragStart]
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    [onDragMove]
  );
  const handleTouchEnd = useCallback(() => onDragEnd(), [onDragEnd]);

  // Mouse handlers (desktop testing)
  const mouseDownRef = useRef(false);
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      mouseDownRef.current = true;
      onDragStart(e.clientX, e.clientY);
    },
    [onDragStart]
  );
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!mouseDownRef.current) return;
      onDragMove(e.clientX, e.clientY);
    },
    [onDragMove]
  );
  const handleMouseUp = useCallback(() => {
    mouseDownRef.current = false;
    onDragEnd();
  }, [onDragEnd]);

  // Prevent context menu during mouse drag
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", prevent);
    return () => window.removeEventListener("contextmenu", prevent);
  }, []);

  // Cancel any in-flight snap animation on unmount
  useEffect(() => {
    return () => {
      if (snapAnimRef.current !== null) {
        cancelAnimationFrame(snapAnimRef.current);
        snapAnimRef.current = null;
      }
    };
  }, []);

  // ── Title overlay animation loop ──────────────────────────────────────
  const titleSlideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animId: number;

    const update = () => {
      animId = requestAnimationFrame(update);
      const vT = verticalTRef.current;
      const hT = horizontalTRef.current;

      // Page titles (Side view, Top view)
      for (let i = 0; i < PAGE_TITLES.length; i++) {
        const el = titleSlideRefs.current[i];
        if (el) el.style.transform = `translateY(${(i - vT) * 100}%)`;
      }

      // Cube titles (Cube 1/2/3 view) — at vertical position CUBE_FOCUS_PAGE
      for (let j = 0; j < CUBE_TITLES.length; j++) {
        const el = titleSlideRefs.current[PAGE_TITLES.length + j];
        if (el) {
          el.style.transform = `translate(${(j - hT) * 100}%, ${(CUBE_FOCUS_PAGE - vT) * 100}%)`;
        }
      }
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [verticalTRef, horizontalTRef]);

  // ── Render ──────────────────────────────────────────────────────────────
  const isOnCubeFocusPage = pageY === CUBE_FOCUS_PAGE;

  return (
    <div
      data-testid="app"
      className="app"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ThreeScene
        verticalTRef={verticalTRef}
        horizontalTRef={horizontalTRef}
        onFpsUpdate={setFps}
      />

      {/* FPS counter */}
      <div data-testid="fps-counter" className="fps-counter" aria-hidden="true">
        {fps}
      </div>

      {/* Page title overlay */}
      <div data-testid="page-title" className="page-title">
        {PAGE_TITLES.map((title, i) => (
          <div
            key={title}
            ref={el => { titleSlideRefs.current[i] = el; }}
            className="page-title__slide"
            data-testid={`page-title-${i}`}
          >
            {title}
          </div>
        ))}
        {CUBE_TITLES.map((title, j) => (
          <div
            key={title}
            ref={el => { titleSlideRefs.current[PAGE_TITLES.length + j] = el; }}
            className="page-title__slide"
            data-testid={`page-title-${PAGE_TITLES.length + j}`}
          >
            {title}
          </div>
        ))}
      </div>

      {/* Navigation dots — 3 vertical dots, bottom dot has horizontal sub-dots */}
      <nav
        data-testid="nav-dots"
        className="nav-dots"
        aria-label="Page navigation"
      >
        {PAGE_TITLES.map((title, i) => (
          <div key={i} className="nav-dots__item">
            <div
              className={`nav-dots__dot${pageY === i ? " nav-dots__dot--active" : ""}`}
              aria-label={title}
            />
          </div>
        ))}

        {/* Bottom dot — cube focus — with horizontal sub-dots */}
        <div className="nav-dots__item">
          <div
            className={`nav-dots__dot${isOnCubeFocusPage ? " nav-dots__dot--active" : ""}`}
            aria-label="Cube focus"
          />
          <div data-testid="horizontal-sub-dots" className="nav-dots__horizontal">
            {Array.from({ length: TOTAL_CUBES }, (_, i) => {
              const reversedCubeIndex = TOTAL_CUBES - 1 - i;
              return (
                <div
                  key={reversedCubeIndex}
                  className={`nav-dots__dot${isOnCubeFocusPage && subX === reversedCubeIndex ? " nav-dots__dot--active" : ""}`}
                  aria-label={`Cube ${reversedCubeIndex + 1}`}
                />
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
