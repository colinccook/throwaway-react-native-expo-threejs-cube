import React, { useRef } from "react";
import { GLView } from "expo-gl";
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

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0x4a90d9 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

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
      gl.endFrameEXP();
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
