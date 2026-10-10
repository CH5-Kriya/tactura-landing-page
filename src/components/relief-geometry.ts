import { BufferGeometry, Vector3 } from "three";

export function prepareReliefGeometry(source: BufferGeometry) {
  const positions = source.getAttribute("position");
  if (!positions || positions.count < 3 || positions.count % 3 !== 0) {
    throw new Error("The STL has no complete triangles.");
  }
  for (let i = 0; i < positions.array.length; i++) {
    if (!Number.isFinite(positions.array[i])) throw new Error("The STL has invalid vertices.");
  }
  source.computeBoundingBox();
  const size = source.boundingBox!.getSize(new Vector3());
  const longestSide = Math.max(size.x, size.y, size.z);
  if (longestSide <= 0) throw new Error("The STL has no visible surface.");
  source.center();
  source.scale(3 / longestSide, 3 / longestSide, 3 / longestSide);
  source.computeVertexNormals();
  return source;
}
