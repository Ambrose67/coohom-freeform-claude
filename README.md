# Coohom Freeform for Claude Code

An unofficial Claude Code plugin adaptation of [Coohom Freeform](https://github.com/manycore-research/Coohom-Freeform), which is published as a Codex plugin. It packages a Claude Code skill and connects Claude Code to the two upstream MCP servers. It is not an official Coohom or Manycore release.

## Requirements

- Claude Code with plugin and MCP support (CLI or desktop app).
- **Node.js 20 or newer** with `node` and `npx` on the `PATH` Claude uses. The simplest way on macOS is the LTS installer from nodejs.org.
- Network access to npm and Coohom.
- A Coohom account. Image-to-3D generation (Lux3D) can use Coohom credits.

## Install

```sh
claude plugin marketplace add Ambrose67/coohom-freeform-claude
claude plugin install coohom-freeform-claude@rose-coohom-freeform
```

Restart Claude after installing or updating — MCP server settings are only read when a session starts. To update later:

```sh
claude plugin marketplace update rose-coohom-freeform
claude plugin update coohom-freeform-claude@rose-coohom-freeform
```

Check both servers start:

```sh
claude mcp list
```

Both `plugin:coohom-freeform-claude:…` entries should show **Connected**.

## Use: put something on a wall of your Coohom room

1. Open your project in Coohom in the browser.
2. Ask Claude, e.g. "Using /coohom-freeform, build this TV unit on the plain wall of my room" and attach a reference image.
3. When Claude gives you a Coohom **executor** link, open it and sign in if asked. Leave it open.
4. In your project tab, open **Advanced tool → Custom modeling**. When Coohom asks "An MCP connection is active in another window. Disconnect and reconnect?", choose **Confirm**. Claude now edits your room directly.
5. Claude locates the wall, builds the object, applies materials and lights, and checks the result.
6. Review it, then click **Finish** and **Save** in Coohom yourself. Claude does not save for you.

Don't refresh the Coohom tabs while Claude is working — unsaved Coohom work is lost on refresh.

## What's in the plugin

| Path | Purpose |
|---|---|
| `.mcp.json` | Starts `freeform-modeling-mcp` in stdio mode and Lux3D through the proxy |
| `bin/lux3d-proxy.mjs` | Makes `@manycore/coohom-lux3d-mcp` work in Claude Code (adds the thread ID it requires; works around its silent exit when launched via npm's bin link). Set `LUX3D_THREAD_ID` to pin the ID |
| `skills/coohom-freeform/SKILL.md` | The workflow Claude follows |
| `skills/coohom-freeform/references/recipes.md` | Tested KDS script templates: transactions, materials, textures, custom shapes, wall markers, lights |
| `skills/coohom-freeform/references/troubleshooting.md` | Known errors and fixes |
| `skills/coohom-freeform/scripts/textures.mjs` | Generates tileable wood-grain and marble PNGs sized for Coohom's script limit |

## Known limitations

- Coohom catalog search in `freeform-modeling-mcp` 1.1.3 fails (`unusableType` error), so decor is modeled from primitives or generated with Lux3D.
- The executor page always opens a new empty design; editing an existing room goes through Custom modeling (step 4 above).
- Floor-plan walls are not visible to scripts; Claude finds them with temporary marker posts and the 2D Top view.
- The Lux3D proxy uses a POSIX shell (`realpath`, `command -v`): macOS and Linux. Windows is untested.
- The servers are pulled from npm as `latest`; upstream changes can break things — see troubleshooting.

For a local trial, run `claude --plugin-dir /absolute/path/to/coohom-freeform-claude`.

## Claude.ai and Cowork

This package targets Claude Code. It is not a Claude.ai connector or Cowork plugin.

## Validation status

Tested end to end on macOS (Apple Silicon, Node 26) on 2026-11-19: both servers connected, a textured live-edge TV unit with lights was built on a wall of an existing Coohom room via Custom modeling, and live render was checked on the executor page. Lux3D image-to-3D generation itself was not run (credits).

## Upstream

The original Coohom Freeform project is licensed under MIT: <https://github.com/manycore-research/Coohom-Freeform>. This adaptation reuses the general workflow concept while adapting its instructions to Claude Code's MCP and skill interfaces.
