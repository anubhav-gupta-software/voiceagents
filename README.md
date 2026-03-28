# VoiceAgents

This repo contains two separate local agent projects:

- `chromium-voice-agent/` - a Chromium browser voice-control prototype for navigating pages, triggering browser actions, and testing local command classification
- `lmmsagent/` - an LMMS-focused voice and text agent project with the LMMS `AgentControl` plugin, integration patches, transport code, and setup scripts

## Project layout

### `chromium-voice-agent/`

Browser automation prototype for voice-driven web control.

Key files:

- `chromium-voice-agent/manifest.json`
- `chromium-voice-agent/background.js`
- `chromium-voice-agent/speech.js`
- `chromium-voice-agent/popup.html`
- `chromium-voice-agent/popup.js`

### `lmmsagent/`

LMMS automation project for controlling LMMS through a local plugin boundary.

Key directories:

- `lmmsagent/integrations/lmms/AgentControl/` - LMMS plugin source
- `lmmsagent/integrations/lmms/patches/` - minimal LMMS host patch set
- `lmmsagent/lmms-text-agent/` - local text command client
- `lmmsagent/lmms-voice-agent/` - local voice bridge
- `lmmsagent/shared/` - shared LMMS socket client and command normalization
- `lmmsagent/scripts/` - install and build scripts for an external LMMS checkout
- `lmmsagent/docs/` - architecture, command map, and demo notes
- `lmmsagent/demo/` - smoke-test commands

## Intended use

- use `chromium-voice-agent/` for browser-side voice control experiments
- use `lmmsagent/` for the hackathon LMMS automation work
