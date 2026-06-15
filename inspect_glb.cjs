const fs = require('fs');
const path = process.argv[2];

if (!fs.existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
}

const buffer = fs.readFileSync(path);

// GLB header is 12 bytes
const magic = buffer.readUInt32LE(0);
if (magic !== 0x46546C67) {
    console.error('Not a valid GLB file');
    process.exit(1);
}

const chunkLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + chunkLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

console.log("=== MATERIALS ===");
if (gltf.materials) {
    gltf.materials.forEach((mat, i) => {
        console.log(`[${i}] ${mat.name} (alphaMode: ${mat.alphaMode})`);
    });
}

console.log("\n=== MESHES ===");
if (gltf.meshes) {
    gltf.meshes.forEach((mesh, i) => {
        const mat = mesh.primitives[0].material;
        const matName = gltf.materials[mat] ? gltf.materials[mat].name : 'unknown';
        console.log(`[${i}] ${mesh.name || 'unnamed'} -> Material: ${matName}`);
    });
}
