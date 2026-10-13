import assert from 'node:assert/strict';
import {previewMesh} from '../public/demo-assets/mesh.mjs';
for (const [rows,cols] of [[2,2],[1000,1000],[1000,657],[408,612]]) {
 const height=Float32Array.from({length:rows*cols},(_,i)=> (i%cols)/(cols-1));
 const mesh=previewMesh(height,rows,cols);
 assert.equal(mesh.aspect,rows/cols);
 assert(mesh.positions.every(Number.isFinite));
 assert(mesh.normals.every(Number.isFinite));
 assert(mesh.indices.every(i=>i<mesh.positions.length/3));
 assert(mesh.positions.length/3<=512*512+4*(512*4));
 assert(mesh.normals[2]>0,'Surface faces outwards');
 const offset=(Math.max(2,Math.round(rows*Math.min(1,512/Math.max(rows,cols))))*Math.max(2,Math.round(cols*Math.min(1,512/Math.max(rows,cols)))))*3;
 assert(mesh.normals[offset+1]>0,'Top wall points outwards');
}
assert.throws(()=>previewMesh(new Float32Array(2002),1001,2));
console.log('Mesh dimensions, buffers, winding and normals passed');
