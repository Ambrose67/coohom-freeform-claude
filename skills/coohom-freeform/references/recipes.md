# Tested `run_kds_script` recipes

All of these ran successfully against freeform-modeling-mcp 1.1.3 on 2026-11-19. Units are mm, Z up, `location` is the bounding-box centre. Pass `scene_summary: "none"` (or `"summary"` when you need the group list). Re-check signatures with `batch_get_methods_full` if the server version changes.

## Transaction skeleton

```javascript
const design = app.getActiveDesign();
if (!design) throw new Error('No active design');
const basePath = design.getEditPath();
function ok(r, api) { if (r?.isSuccess !== true) throw new Error(api + ' failed: ' + (r?.errorMsg || 'isSuccess=false')); }
ok(design.startOperation(TransactionConfigurations.BULK_OP_LOCK_FLUSH), 'startOperation');
try {
  // ... edits ...
  ok(await design.activateEditPath(basePath), 'activateEditPath');
  ok(design.commitOperation(), 'commitOperation');
} catch (e) {
  try { await design.activateEditPath(basePath); } catch {}
  try { design.abortOperation(); } catch {}
  throw e;
}
return { ok: true, saved: false };
```

The modeling guide says to `await design.save()` after committing. In a user's project, leave saving to the user (Finish → Save) unless they asked you to save.

## Check which design is connected (read-only)

```javascript
const d = app.getActiveDesign();
const subs = d.getActiveGroupDefinition().getSubGroupInstances();
return {
  yun: d.getYunDesignInfo(), // { designId } must match the project's URL designid
  items: subs.map(g => { const b = g.getBoundingBox(); return { name: g.getCustomProperty('name'), visible: g.isVisible(),
    box: [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(Math.round) }; })
};
```

## Colour materials (run before the build, outside any transaction)

```javascript
const design = app.getActiveDesign();
const DIFF = [{ overridePath: "diffuseTex", name: "贴图", value: 1 }, { overridePath: "diffuse", name: "颜色", value: 0 }];
const colour = (r, g, b) => { const c = { type: "AColor", value: { x: r, y: g, z: b } }; return {
  srcMaterialId: "6acdc4da47c8d766b7c81bfb",
  editParam: { sceneId: "MUSR6XIKTJ746AABAAAAAAQ8", obsPhysicalTextureId: "3FO4K4W3GOL2", scale: { x: 1000, y: 1000 },
    attributeInfoSet: [
      { overridePath: "diffuse", basicValue: c },
      { overridePath: "vrColor", basicValue: c },
      { overridePath: "diffuseOption", basicValue: { type: "Option", value: DIFF[1], optionValueList: DIFF } } ] } }; };
const specs = { wood: [0.60, 0.36, 0.17], marble: [0.93, 0.89, 0.82], black: [0.02, 0.02, 0.025], leaf: [0.20, 0.38, 0.14] };
const names = Object.keys(specs);
const res = await design.createAndLoadMaterialsByParams(names.map(n => colour(...specs[n])));
const out = {}; names.forEach((n, i) => out[n] = [res[i].materialId, res[i].obsBrandGoodId]);
return out;
```

## Texture material (one per call — script limit 204,800 chars)

Prepend `const IMG = "data:image/png;base64,...";` and `const SCALE = 1400;` (tile size in mm). Generate the PNG with `scripts/textures.mjs` (`S=384` for wood, `S=512` for marble keeps it under the limit).

```javascript
const design = app.getActiveDesign();
const DIFF = [{ overridePath: "diffuseTex", name: "贴图", value: 1 }, { overridePath: "diffuse", name: "颜色", value: 0 }];
const res = await design.createAndLoadMaterialsByParams([{
  srcMaterialId: "6acdc4da47c8d766b7c81bfb",
  editParam: { sceneId: "MUSR6XIKTJ746AABAAAAAAQ8", obsPhysicalTextureId: "3FO4K4W3GOL2", scale: { x: SCALE, y: SCALE },
    attributeInfoSet: [
      { overridePath: "diffuseTex", basicValue: { type: "File", value: IMG } },
      { overridePath: "diffuseOption", basicValue: { type: "Option", value: DIFF[0], optionValueList: DIFF } } ] } }]);
return { materialId: res[0].materialId, bg: res[0].obsBrandGoodId };
```

## Helpers used inside a build transaction

```javascript
const P = (x, y, z) => GeomLib.createPoint3d(x, y, z);
function paint(inst, [materialId, bg]) { if (design.assignMaterialForGroupInstance(inst, materialId, bg) !== true) throw new Error('material'); }
function prim(opts, mat) { const r = design.createPrimitiveGroupInstance(opts); if (!r?.addedInstance) throw new Error('primitive ' + opts.name); paint(r.addedInstance, mat); return r.addedInstance; }
function move(inst, dx, dy, dz) { ok(design.transformGroupInstances([inst], GeomLib.createTranslationMatrix4(dx, dy, dz)), 'transform'); }

// Extruded custom shape in its own child group. outerPts/holePts: coplanar KPoint3d arrays.
async function shape(name, outerPts, holePts, depth, mat) {
  const g = design.createEmptyGroupInstance()?.addedInstance; if (!g) throw new Error('group ' + name);
  g.setCustomProperty('name', name);
  const parent = design.getEditPath();
  ok(await design.activateGroupInstance(g), 'activate ' + name);
  const f = design.addFaces([outerPts], undefined, KWindingOrder.CounterClockwise);
  if (!f?.addedFaces?.length) throw new Error('addFaces ' + name);
  if (holePts) ok(design.addFaceHoles([f.addedFaces[0]], [[holePts]]), 'addFaceHoles ' + name);
  const faces = design.getActiveGroupDefinition().getShells().flatMap(s => s.getFaces());
  const face = faces.find(x => x.getInnerLoops().length > 0) || faces[0];
  ok(design.pullPushFace(face, depth, false), 'pullPushFace ' + name);
  ok(await design.activateEditPath(parent), 'back ' + name);
  paint(g, mat);
  return g; // then: const b = g.getBoundingBox(); move(g, 0, -b.max.y, 0);
}
```

Root group pattern: `const root = design.createEmptyGroupInstance().addedInstance; root.setCustomProperty('name', 'MyUnit'); ok(await design.activateGroupInstance(root), 'root');` → build children → `ok(await design.activateEditPath(basePath), …)` → `move(root, wallX, wallY, 0)`.

Organic outlines (live edge): walk a rectangle or superellipse and offset each point by a sum of sines, e.g. `noise = t => 0.5*Math.sin(3*t+s) + 0.3*Math.sin(7.3*t+2.1*s) + 0.2*Math.sin(13.7*t+0.7*s)`; 120–140 points per loop look smooth.

## Wall-finding markers

```javascript
// place
for (const [n, x, y, h] of [['TMP_o', 0, 0, 3000], ['TMP_x2000', 2000, 0, 2000], ['TMP_y2000', 0, 2000, 1000]])
  design.createPrimitiveGroupInstance({ type: 'CUBE', name: n, dimensions: [120, 120, h], location: [x, y, h / 2] });
// remove (inside a transaction)
for (const g of design.getActiveGroupDefinition().getSubGroupInstances())
  if (String(g.getCustomProperty('name') || '').startsWith('TMP_')) design.removeGroupInstance(g);
```

Read them in **2D → Top view**: scale = pixel distance between `TMP_o` and `TMP_x2000` ÷ 2000.

## Warm cove lights (set_lights arguments)

```json
{ "lights": [ { "type": "point", "id": "unit-cove-01", "position": { "x": 0, "y": -70, "z": 1460 },
  "radius": 30, "brightness": 3, "useColorTemperature": true, "colorTemperature": 2700 } ] }
```

Space 10–12 of them around the inside edge of an opening, 50–80 mm in front of the back panel.
