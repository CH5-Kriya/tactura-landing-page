import { expect, test } from "bun:test";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { prepareReliefGeometry } from "../src/components/relief-geometry";

test("a binary STL is centered and fitted without changing relief proportions", () => {
  const bytes = new ArrayBuffer(134);
  const data = new DataView(bytes);
  data.setUint32(80, 1, true);
  [10, 20, 2, 110, 20, 2, 10, 70, 12].forEach((value, i) => data.setFloat32(96 + i * 4, value, true));
  const geometry = prepareReliefGeometry(new STLLoader().parse(bytes));
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new Vector3());
  const size = geometry.boundingBox.getSize(new Vector3());
  expect(center.length()).toBeCloseTo(0);
  expect(size.x).toBeCloseTo(3);
  expect(size.y).toBeCloseTo(1.5);
  expect(size.z).toBeCloseTo(0.3);
  geometry.dispose();
});

test("empty, non-finite, and zero-size geometry cannot reach the viewer", () => {
  for (const vertices of [[], Array(9).fill(NaN), Array(9).fill(0)]) {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    expect(() => prepareReliefGeometry(geometry)).toThrow();
    geometry.dispose();
  }
});
