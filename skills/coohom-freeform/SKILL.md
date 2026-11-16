---
name: coohom-freeform
description: Create or edit real Coohom Freeform 3D scenes from images and natural language. Use the Coohom Freeform modeling MCP for scene structure, furniture placement and materials, and Lux3D MCP for image-to-3D generation.
---
# Coohom Freeform for Claude Code

Carry out the user's requested spatial design work in the real Coohom Freeform scene using the connected MCP tools. A design plan alone is not the deliverable when the tools are available. Keep the user informed at major milestones. Stay within the requested scope; never save, publish, replace a full scene, or delete unrelated content unless the user asks.

## Start safely

1. Discover the currently connected tools from both freeform-modeling-mcp and lux3d-mcp-server. Read their current descriptions and schemas before relying on a capability. Tool names, inputs, output meanings, coordinate systems and supported operations can change; do not guess or reuse old schemas.
2. Initialize the modeling task with the declared read-only setup/query tool. For generation, prepare the Lux3D workspace using its current declared preparation tool. Record the real scene/workspace identity and complete task URL returned by the tool.
3. If the executor page must be connected or signed in, give the user the exact returned URL and ask them to open it, sign in to Coohom if needed, and confirm when ready. Claude Code does not provide the Codex in-app browser workflow. Do not invent a URL, copy cookies, ask for credentials, or claim a page is connected until the MCP confirms it.
4. Before scene writes, verify a unique intended Freeform target and query its current scene. Do not edit if the target or page binding is ambiguous.

## Interpret the brief

- Identify what must change and what should remain. For a local edit, touch only the requested objects and directly affected neighbors. A reference image is visual input, not permission to replace the whole scene.
- Separate explicit requirements, visible evidence, estimates, and unknowns. A photo alone does not establish exact dimensions. Use measured dimensions when provided; otherwise disclose estimates.
- Ask before acting when competing interpretations would materially change layout, main proportions, appearance, or substitutions and the user has not already authorized discretion.
- With multiple images, treat them as views of one space only when evidence supports that. Avoid duplicate objects from repeated views.

## Model and edit

- Move, rotate, resize, or recolor existing objects directly when appropriate. For new or rebuilt furniture, use the declared Lux3D generation and Freeform import capabilities when available.
- Follow the current MCP's modeling guide and public tool schemas. Derive required fields, units, IDs, and coordinate conventions from those sources; do not invent arguments or identities.
- For larger changes, establish the room structure and major proportions first, check them, then add major furnishings and details. Sequence scene writes and verify each before continuing.
- Before generation, confirm there is a supported path to import its actual output into Freeform. Generation may consume Coohom credits. A displayed balance may omit free allowances; the generation response determines eligibility. If the server explicitly reports insufficient credits, pause and offer the user the available documented choices. Never open payment or retry generation without the user's choice.
- Treat timeouts and ambiguous errors as unknown outcomes. Check task records and the scene before retrying so you do not duplicate generation or scene writes.

## Verify and finish

After each edit and at the end, query the affected scene and use available screenshots/views to check:

- Room structure, connections, relative positions, scale, orientation, support, clearances, occlusion, and obvious intersections.
- Overall silhouette, proportions, major color/material distribution, important object shapes, and visual consistency with the brief.

Distinguish verified results from estimates, unsupported features, and unverified details. Do not treat lighting or camera artifacts as proof that geometry is missing. Correct directly understood deviations within scope; pause and explain when the cause or recovery choice is unclear.

Leave the actual Coohom scene open. Summarize what was verified, what was estimated, and any limitations. The user chooses whether to save the scene.
