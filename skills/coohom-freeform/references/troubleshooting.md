# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Executable not found in $PATH: npx` | Node.js not installed or not on the app's PATH | Install Node.js 20+ (nodejs.org installer), restart Claude |
| Lux3D: "Connection closed" right after start | Package exits when launched through its npm bin symlink | Use this plugin's `bin/lux3d-proxy.mjs` (default in `.mcp.json`) |
| Lux3D: "Codex thread ID is unavailable … `_meta.threadId`" | Claude Code sends no thread ID | Use the proxy (adds one); set `LUX3D_THREAD_ID` to pin it |
| Freeform: connection timed out | Server started in HTTP mode | `.mcp.json` must pass `start --stdio` |
| Fixed `.mcp.json` but still failing | Claude keeps the config it loaded at session start | Restart Claude / start a new session |
| `prepare_modeling_task` → `connected:false`, "No Koomaster clients connected" | No Coohom canvas is connected | Open the Lux3D `executorUrl`; for an existing room, also open Custom modeling in that project and Confirm the reconnect prompt |
| Port 8765/7764 already in use | A leftover `freeform-modeling-mcp` from a manual test | `lsof -nP -iTCP:8765 -sTCP:LISTEN`, stop that process |
| Executor opens an empty design, not the user's room | Executor always creates a new design | Use Custom modeling in the user's project (SKILL §1.4) |
| Model "visible" but not seen in the room | It is inside a wall | Re-read wall faces in 2D Top view; move toward the room |
| `run_kds_script` → `runtime`, message `[object Object]` | Usually stale material IDs from another page session | Recreate materials in the current page, then retry |
| `script exceeds max size of 204800 characters` | Embedded texture too big | One texture per call, PNG ≤ ~150 KB (384–512 px) |
| `batch_search_kjl_assets` → `Cannot read properties of undefined (reading 'unusableType')` | Server bug (1.1.3) | Model decor with primitives or Lux3D (ask first: credits) |
| `get_scene_screenshot` shows only axes | Camera not framed on content | Use `get_objects_screenshot` or a browser screenshot |
| Coohom shows "Failed to save … cached locally" / "Network disconnected" | Coohom cloud save hiccup | Don't refresh; let the user Save again after reconnecting |
| `saveInstanceAsLibraryProject` returns no projectId | Normal for this API | Check Custom modeling → Private models |
