# Changelog

## 0.2.0 — 2026-11-19

From a live end-to-end test in Claude Code.

- Fix: `freeform-modeling-mcp` now starts with `start --stdio` (it defaulted to an HTTP server, so Claude Code timed out).
- Fix: Lux3D now runs through `bin/lux3d-proxy.mjs`, which adds the `_meta.threadId` Lux3D requires and avoids the package's silent exit when launched via npm's bin link.
- Skill rewritten as an easy-path workflow: connecting, editing an existing room through Custom modeling, finding floor-plan walls with marker posts, building in one root group, materials and texture limits, verification and hand-off.
- Added `references/recipes.md` (tested script templates) and `references/troubleshooting.md`.
- Added `scripts/textures.mjs` (wood-grain and marble PNG generator sized for the 204,800-character script limit).
- README: Node 20+ requirement, update/restart steps, step-by-step room workflow, known limitations.

## 0.1.0

- Initial Claude Code adaptation.
