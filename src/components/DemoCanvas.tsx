"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { DemoMesh } from "./PhotoDemo";

function Controls({ controls, size, onLost }: { controls: React.RefObject<OrbitControls | null>; size: number; onLost: (lost: boolean) => void }) {
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enablePan = false;
    orbit.minDistance = size * 1.2;
    orbit.maxDistance = size * 5;
    const redraw = () => invalidate();
    orbit.addEventListener("change", redraw);
    controls.current = orbit;
    orbit.update();
    const lost = () => onLost(true);
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      controls.current = null;
      orbit.removeEventListener("change", redraw);
      gl.domElement.removeEventListener("webglcontextlost", lost);
      orbit.dispose();
    };
  }, [camera, gl, invalidate, controls, size, onLost]);
  return null;
}

export default function DemoCanvas({ mesh, depth }: { mesh: DemoMesh; depth: number }) {
  const controls = useRef<OrbitControls | null>(null);
  const [lost, setLost] = useState(false);
  const size = Math.max(1, mesh.aspect);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(mesh.positions, 3));
    g.setAttribute("normal", new BufferAttribute(mesh.normals, 3));
    g.setIndex(new BufferAttribute(mesh.indices, 1));
    return g;
  }, [mesh]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  function move(action: string) {
    const orbit = controls.current;
    if (!orbit) return;
    const camera = orbit.object;
    if (action === "reset") camera.position.set(0, -2.8 * size, 4.6 * size);
    else if (action === "left" || action === "right")
      camera.position.applyAxisAngle(new Vector3(0, 0, 1), action === "left" ? -.25 : .25);
    else camera.position.multiplyScalar(action === "in" ? .85 : 1.15);
    orbit.update();
  }
  if (lost) return <p className="relief-status" role="alert">The graphics connection was lost. Create your relief again to retry.</p>;
  return <>
    <div className="relief-canvas" tabIndex={0} role="region"
      aria-label="Your 2.5D relief. Drag to rotate, scroll to zoom. Arrow keys rotate, plus and minus zoom, Home resets."
      onKeyDown={event => {
        const action = ({ ArrowLeft: "left", ArrowRight: "right", "+": "in", "=": "in", "-": "out", Home: "reset" } as Record<string, string>)[event.key];
        if (action) { event.preventDefault(); move(action); }
      }}>
      <Canvas frameloop="demand" dpr={[1, 1.5]}
        camera={{ position: [0, -2.8 * size, 4.6 * size], up: [0, 0, 1], fov: 42 }}
        fallback={<p className="relief-status">3D preview is unavailable on this device.</p>}>
        <ambientLight intensity={.45} />
        <directionalLight position={[-3, -4, 6]} intensity={2.4} />
        <directionalLight position={[4, 2, 3]} intensity={.7} color="#d7ff73" />
        <mesh geometry={geometry} scale={[1, 1, (4 + depth * 36) / 100]}>
          <meshStandardMaterial color="#b9a46d" roughness={.62} metalness={.24} />
        </mesh>
        <mesh position={[0, 0, -.015]}>
          <boxGeometry args={[2, mesh.aspect * 2, .03]} />
          <meshStandardMaterial color="#b9a46d" roughness={.62} metalness={.24} />
        </mesh>
        <Controls controls={controls} size={size} onLost={setLost} />
      </Canvas>
    </div>
    <div className="relief-controls" aria-label="Relief preview controls">
      <button type="button" onClick={() => move("left")} aria-label="Rotate left">↶</button>
      <button type="button" onClick={() => move("right")} aria-label="Rotate right">↷</button>
      <button type="button" onClick={() => move("in")} aria-label="Zoom in">+</button>
      <button type="button" onClick={() => move("out")} aria-label="Zoom out">−</button>
      <button type="button" onClick={() => move("reset")}>Reset view</button>
    </div>
  </>;
}
