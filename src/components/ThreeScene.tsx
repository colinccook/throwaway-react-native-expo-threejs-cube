import { useEffect, useRef } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  Vector3,
  Color,
} from "three";

/** Base rotation speed and per-cube increment (radians per frame) */
const BASE_ROT_X = 0.008;
const BASE_ROT_Y = 0.010;
const ROT_INCREMENT_X = 0.002;
const ROT_INCREMENT_Y = 0.003;


const CUBE_X = [-4, 0, 4];

/** Vertical page camera keyframes (position + lookAt target) */
const PAGE_CAMERAS: { pos: [number, number, number]; target: [number, number, number] }[] = [
  { pos: [6, 4, 8], target: [0, 0, 0] },    // Page 0 — perspective (default)
  { pos: [0, 15, 0.001], target: [0, 0, 0] }, // Page 1 — top-down
  { pos: [12, 2, 0], target: [0, 0, 0] },    // Page 2 — side view
  { pos: [0, 0, 6], target: [0, 0, 0] },     // Page 3 — cube focus (updated per-frame via hT)
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpV3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

interface ThreeSceneProps {
  /** Smooth vertical scroll position: 0=default, 1=top-down, 2=side, 3=cube-focus */
  verticalTRef: React.MutableRefObject<number>;
  /** Smooth horizontal scroll position: 0=cube0, 1=cube1, 2=cube2 */
  horizontalTRef: React.MutableRefObject<number>;
  /** Callback to report rendered FPS */
  onFpsUpdate: (fps: number) => void;
}

export default function ThreeScene({
  verticalTRef,
  horizontalTRef,
  onFpsUpdate,
}: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ────────────────────────────────────────────────────────────
    const scene = new Scene();
    scene.background = new Color(0x1a1a2e);

    const camera = new PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(...PAGE_CAMERAS[0].pos);
    camera.lookAt(new Vector3(...PAGE_CAMERAS[0].target));

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────────────────────────
    const dirLight = new DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const ambientLight = new AmbientLight(0x404060, 1.2);
    scene.add(ambientLight);

    // ── Three cubes ──────────────────────────────────────────────────────
    const CUBE_COLORS = [0x4a90d9, 0x50c878, 0xe05050];
    const cubeGeometry = new BoxGeometry(1.5, 1.5, 1.5);
    const cubes: Mesh[] = CUBE_X.map((x, i) => {
      const material = new MeshStandardMaterial({ color: CUBE_COLORS[i] });
      const mesh = new Mesh(cubeGeometry, material);
      mesh.position.set(x, 0, 0);
      scene.add(mesh);
      return mesh;
    });

    // ── FPS tracking ─────────────────────────────────────────────────────
    let frameCount = 0;
    let lastFpsTime = performance.now();

    // ── Camera smooth state ───────────────────────────────────────────────
    const smoothCamPos = new Vector3(...PAGE_CAMERAS[0].pos);
    const smoothCamTarget = new Vector3(...PAGE_CAMERAS[0].target);

    // ── Animation loop ───────────────────────────────────────────────────
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate cubes (each at slightly different rates)
      cubes.forEach((cube, i) => {
        cube.rotation.x += BASE_ROT_X + i * ROT_INCREMENT_X;
        cube.rotation.y += BASE_ROT_Y + i * ROT_INCREMENT_Y;
      });

      // ── Compute target camera from scroll state ───────────────────────
      const vT = clamp(verticalTRef.current, 0, 3);
      const hT = clamp(horizontalTRef.current, 0, 2);

      let targetPos: [number, number, number];
      let targetLookAt: [number, number, number];

      if (vT <= 2) {
        // Lerp between page cameras 0→1→2
        const seg = Math.floor(vT);
        const t = vT - seg;
        const camA = PAGE_CAMERAS[seg];
        const camB = PAGE_CAMERAS[seg + 1];
        targetPos = lerpV3(camA.pos, camB.pos, t);
        targetLookAt = lerpV3(camA.target, camB.target, t);
      } else {
        // vT 2→3: lerp from side-view to cube-focus
        const t = vT - 2; // 0..1
        const cubeX = lerp(CUBE_X[0], CUBE_X[2], hT / 2);
        const page3Pos: [number, number, number] = [cubeX, 0, 6];
        const page3Target: [number, number, number] = [cubeX, 0, 0];

        targetPos = lerpV3(PAGE_CAMERAS[2].pos, page3Pos, t);
        targetLookAt = lerpV3(PAGE_CAMERAS[2].target, page3Target, t);
      }

      // Smooth lerp camera toward target (easing = 0.12 per frame ≈ assertive but smooth)
      smoothCamPos.lerp(new Vector3(...targetPos), 0.12);
      smoothCamTarget.lerp(new Vector3(...targetLookAt), 0.12);

      camera.position.copy(smoothCamPos);
      camera.lookAt(smoothCamTarget);

      renderer.render(scene, camera);

      // FPS counter — update every second
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        onFpsUpdate(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }
    };

    animate();

    // ── Resize handler ───────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      cubeGeometry.dispose();
      cubes.forEach((c) => (c.material as MeshStandardMaterial).dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [verticalTRef, horizontalTRef, onFpsUpdate]);

  return (
    <div
      data-testid="three-scene"
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    />
  );
}
