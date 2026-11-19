---
name: coohom-freeform
description: Create or edit real Coohom 3D scenes from images and natural language — e.g. build a TV unit, wardrobe or wall feature on a wall of the user's Coohom room. Uses the freeform-modeling-mcp tools (scene, geometry, materials, lights) and lux3d-mcp-server (image-to-3D, executor page).
---
# Coohom Freeform for Claude Code

Do the requested design work in the user's real Coohom scene with the connected MCP tools. A plan alone is not the deliverable. Keep the user posted at milestones. Stay in scope: never save, publish, replace a scene or delete unrelated content unless the user asks.

Read [references/recipes.md](references/recipes.md) before writing any `run_kds_script` code — it holds tested script templates. Read [references/troubleshooting.md](references/troubleshooting.md) when something fails.

## 1. Connect (easy path)

1. Call `prepare_modeling_task({})` once. It returns the modeling guide, API directory and `connected`. Reuse its guide and directory for the whole task.
2. If `connected` is false, call Lux3D `prepare_workspace({})`. Give the user the returned `executorUrl` exactly as returned (it contains this session's thread ID) and ask them to open it in their browser, sign in to Coohom if asked, and say when it is open. Then call `prepare_workspace` again and require `status: "connected"`, and call `prepare_modeling_task` again to confirm Freeform is connected.
   - If the in-app browser tools are available, open the URL yourself in a new tab; the user still does any sign-in.
3. The executor page always opens a **new, empty design**. It ignores any `designId` you add to the URL. Use it for stand-alone models.
4. **To work in the user's existing room** (the usual case — "put it on the wall I selected"):
   - Keep the executor page open (it registers the connection).
   - In the user's own project tab: **Advanced tool → Custom modeling**. Coohom shows "An MCP connection is active in another window. Disconnect and reconnect?" → **Confirm** (do this yourself if you control the browser; it only moves the connection).
   - Verify with a read-only script that `app.getActiveDesign().getYunDesignInfo().designId` equals the project's `designid` in its URL. Do not write until it matches.
   - Entering Custom modeling makes Coohom auto-save the project. Tell the user; it is Coohom's behaviour, not yours.
5. Never refresh or close a Coohom project tab: unsaved Coohom work is lost on refresh.

## 2. Read the brief

- Separate what is given (measurements, chosen wall), what you see in the reference image, and what you estimate. A photo gives proportions, not sizes: estimate from the room (ceiling height is in Coohom's Floor panel) and say so.
- Ask only when choices would materially change layout, size or look and the user has not given discretion.

## 3. Find the wall (existing rooms)

Floor-plan walls are **not** Freeform geometry — scripts cannot read them, and the scene shows `objectCount: 0`. Locate them like this (recipe in references):

1. Place a few thin temporary cubes named `TMP_*` at known coordinates (origin, +2000 on X, +2000 on Y, plus a row stepping toward each wall).
2. Switch the canvas to **2D → Top view** (orthographic) and take a browser screenshot. Compute the scale from two markers, then read each wall's inner face.
3. A grey band beside a wall in Top view is wall thickness — the inner face is on the room side of the grey band. Cross-check: inner width × depth should match the room's interior area from the Floor panel.
4. Delete every `TMP_*` cube, then build.
5. If the model is reported visible but cannot be seen in 3D, it is probably inside a wall: move it toward the room and recheck.

The selected wall in the normal Coohom editor is not exposed to the MCP. Identify it from the user's words/screenshot (e.g. "the plain wall right of the window").

## 4. Build

- Build the whole object inside **one named root group** (e.g. `LiveEdgeTVUnit`) with named child groups, at the origin with its back face at y=0 and front toward −Y; then move the root once to the wall (`transformGroupInstances` with a translation matrix). Rotate 90/180/270° about Z first if the wall runs along Y or faces the other way.
- Put geometry, materials and checks in as few `run_kds_script` calls as possible, each one transaction (template in references). Return only counts, bounding boxes and keys.
- Organic/custom shapes: `addFaces` (coplanar points, explicit `KWindingOrder`) → optional `addFaceHoles` → `pullPushFace`. After extruding, read the group bounding box and translate it to the intended position — extrusion direction is not guaranteed.
- Primitives: `createPrimitiveGroupInstance` (`CUBE` dims, `SPHERE` radius, `CYLINDER` radius+height; `location` = bounding-box centre).
- Catalog search (`batch_search_kjl_assets`) currently errors (`unusableType`). Do not loop on it: model decor with simple primitives, and offer Lux3D image-to-3D for hero pieces (plants, sculptures) — **ask before each generation; it uses Coohom credits**.
- Lights: one `set_lights` call with every light (point lights, `useColorTemperature: true`, `colorTemperature: 2700` for warm LED glow). It replaces all DIY lights.

## 5. Materials

- Create materials **before** the transaction with `design.createAndLoadMaterialsByParams`, using the fixed `srcMaterialId`, `sceneId` and `obsPhysicalTextureId` from the modeling guide. Exact working format is in references.
- Material IDs only work in the page session that created them. After switching pages or reloading, create them again.
- Solid colours: `diffuse` + `vrColor` AColor + `diffuseOption` "颜色". Textures: `diffuseTex` File (base64 PNG) + `diffuseOption` "贴图"; `editParam.scale` is the tile size in mm.
- **Scripts are capped at 204,800 characters.** Send one texture per call and keep each PNG under ~150 KB (384–512 px). `scripts/textures.mjs` makes tileable wood-grain and marble-vein PNGs that fit.
- Assign with `assignMaterialForGroupInstance(instance, materialId, obsBrandGoodId)` and check it returns `true`.

## 6. Verify

- `get_objects_screenshot({groupNames:[...], view_angle:"front"})` is the reliable close-up check of the model itself.
- `get_scene_screenshot` often frames empty space; for room context take a browser screenshot of the canvas (use the "Default view" button under the canvas to reframe).
- Coohom's **Render** tab (executor page) runs a free live render with an outdoor sky backdrop; daylight there hides interior LED glow, so judge glow inside the room. Report lighting as "set, not render-verified" unless you saw it.
- Compare against the reference: silhouette, proportions, colour/material split, decor positions. List differences plainly.

## 7. Finish

- Do not save. Tell the user: click **Finish** (top right) to leave Custom modeling, then **Save** the project, and check the save succeeds.
- Optional backup (ask first): `await design.saveInstanceAsLibraryProject(rootGroup, 2)` saves the group as a private library model (it appears under Custom modeling → Private models, without a thumbnail; the call returns no projectId).
- Summarise what was verified, what was estimated, and what still differs from the reference.
