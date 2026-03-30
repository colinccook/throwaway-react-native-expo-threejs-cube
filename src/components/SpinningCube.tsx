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
} from "three";

export default function SpinningCube() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new Scene();

    const camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0x4a90d9 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0x404040);
    scene.add(ambientLight);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      data-testid="spinning-cube"
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
