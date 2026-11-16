# Coohom Freeform for Claude Code

An unofficial Claude Code plugin adaptation of [Coohom Freeform](https://github.com/manycore-research/Coohom-Freeform), which is published as a Codex plugin. It packages a Claude Code skill and connects Claude Code to the two upstream MCP servers. It is not an official Coohom or Manycore release.

## Requirements

- Claude Code with plugin and MCP support.
- Node.js/npm available to Claude Code (`npx` must be on `PATH`).
- Network access to npm and Coohom.
- A Coohom account, sign-in, service permissions, and any credits required for image-to-3D generation.

The servers are requested from npm as `latest`; their versions are not pinned by this adaptation. First startup may download dependencies. MCP discovery alone does not prove that browser sign-in, executor connection, scene import, or editing works.

## Install and use

To install from this GitHub marketplace, run:

```sh
claude plugin marketplace add Ambrose67/coohom-freeform-claude
claude plugin install coohom-freeform-claude@rose-coohom-freeform
```

Restart Claude Code, then run `/coohom-freeform` or ask for a Coohom Freeform scene task. Review the MCP permission prompts. If Lux3D returns an executor URL and requires a browser connection, open that exact URL yourself, sign in to Coohom, connect the page as instructed by the service, and return to Claude Code. Do not paste passwords, cookies, or authorization headers into chat.

For a local trial, run `claude --plugin-dir /absolute/path/to/coohom-freeform-claude` from a terminal.

## Claude.ai and Cowork

This package targets Claude Code. It is not a Claude.ai connector or Cowork plugin. Those surfaces have different component and MCP support.

## Validation status

This is a community adaptation. The plugin and marketplace manifests pass `claude plugin validate`. MCP startup and Coohom generation/import still need verification on a machine with Node.js/npm and a signed-in Coohom account; generation can use credits. No scene is generated or modified during installation.

## Upstream

The original Coohom Freeform project is licensed under MIT: <https://github.com/manycore-research/Coohom-Freeform>. This adaptation reuses the general workflow concept while adapting its instructions to Claude Code's MCP and skill interfaces.
