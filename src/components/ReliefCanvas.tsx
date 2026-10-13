"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { prepareReliefGeometry } from "./relief-geometry";

function Controls({
  controls,
  autoRotate,
}: {
  controls: React.RefObject<OrbitControls | null>;
  autoRotate: boolean;
}) {
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enablePan = false;
    orbit.autoRotateSpeed = 0.65;
    orbit.minDistance = 2.5;
    orbit.maxDistance = 8;
    orbit.maxPolarAngle = Math.PI / 2;
    const redraw = () => invalidate();
    orbit.addEventListener("change", redraw);
    orbit.update();
    controls.current = orbit;
    return () => {
      controls.current = null;
      orbit.removeEventListener("change", redraw);
      orbit.dispose();
    };
  }, [camera, gl, invalidate, controls]);
  useEffect(() => {
    if (controls.current) controls.current.autoRotate = autoRotate;
    invalidate();
  }, [autoRotate, controls, invalidate]);
  useFrame((_, delta) => {
    if (autoRotate) controls.current?.update(Math.min(delta, 0.05));
  });
  return null;
}

export default function ReliefCanvas({
  src,
  autoRotate,
}: {
  src: string;
  autoRotate: boolean;
}) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const controls = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let loaded: BufferGeometry | undefined;
    setGeometry(null);
    setError(null);
    async function load() {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error("The relief could not be loaded.");
        const body = src.endsWith(".gz")
          ? new Response(
              response.body!.pipeThrough(new DecompressionStream("gzip")),
            )
          : response;
        const bytes = await body.arrayBuffer();
        if (controller.signal.aborted) return;
        loaded = new STLLoader().parse(bytes);
        setGeometry(prepareReliefGeometry(loaded));
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause
              : new Error("The relief could not be loaded."),
          );
      }
    }
    void load();
    return () => {
      controller.abort();
      loaded?.dispose();
    };
  }, [src]);

  if (error) throw error;
  if (!geometry)
    return (
      <p className="relief-status" role="status">
        Loading your next dimension…
      </p>
    );

  function move(action: "left" | "right" | "in" | "out" | "reset") {
    const orbit = controls.current;
    if (!orbit) return;
    const camera = orbit.object;
    if (action === "reset") camera.position.set(0, -2.8, 4.6);
    else if (action === "left" || action === "right")
      camera.position.applyAxisAngle(
        new Vector3(0, 0, 1),
        action === "left" ? -0.25 : 0.25,
      );
    else camera.position.multiplyScalar(action === "in" ? 0.85 : 1.15);
    orbit.update();
  }

  return (
    <>
      <div
        className="relief-canvas"
        tabIndex={0}
        role="region"
        aria-label="Interactive Tactura relief. Arrow keys rotate, plus and minus zoom, Home resets the view."
        onKeyDown={(event) => {
          const action = {
            ArrowLeft: "left",
            ArrowRight: "right",
            "+": "in",
            "=": "in",
            "-": "out",
            Home: "reset",
          }[event.key];
          if (action) {
            event.preventDefault();
            move(action as Parameters<typeof move>[0]);
          }
        }}
      >
        <Canvas
          frameloop={autoRotate ? "always" : "demand"}
          dpr={[1, 1.5]}
          camera={{ position: [0, -2.8, 4.6], up: [0, 0, 1], fov: 42 }}
          fallback={
            <p className="relief-status">
              3D preview is unavailable on this device.
            </p>
          }
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[-3, -4, 6]} intensity={2.4} />
          <directionalLight
            position={[4, 2, 3]}
            intensity={0.7}
            color="#d7ff73"
          />
          <mesh geometry={geometry}>
            <meshStandardMaterial
              color="#b9a46d"
              roughness={0.62}
              metalness={0.24}
            />
          </mesh>
          <Controls controls={controls} autoRotate={autoRotate} />
        </Canvas>
      </div>
      <div className="relief-controls" aria-label="Relief preview controls">
        <button
          type="button"
          onClick={() => move("left")}
          aria-label="Rotate left"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => move("right")}
          aria-label="Rotate right"
        >
          ↷
        </button>
        <button type="button" onClick={() => move("in")} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => move("out")} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={() => move("reset")}>
          Reset view
        </button>
      </div>
    </>
  );
}
