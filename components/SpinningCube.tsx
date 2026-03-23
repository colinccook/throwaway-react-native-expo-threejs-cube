import React, { useEffect, useRef } from "react";
import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer } from "expo-three";
import {
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
} from "three";

export default function SpinningCube() {
  const requestIdRef = useRef<number | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const geometryRef = useRef<BoxGeometry | null>(null);
  const materialRef = useRef<MeshStandardMaterial | null>(null);

  useEffect(() => {
    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
      rendererRef.current?.dispose();
    };
  }, []);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    const scene = new Scene();

    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    rendererRef.current = renderer;

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0x4a90d9 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
    geometryRef.current = geometry;
    materialRef.current = material;

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0x404040);
    scene.add(ambientLight);

    const animate = () => {
      requestIdRef.current = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP?.();
    };

    animate();
  };

  return (
    <GLView
      testID="spinning-cube"
      style={{ flex: 1 }}
      onContextCreate={onContextCreate}
    />
  );
}
