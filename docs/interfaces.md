# Chromium Voice + Eye Agent Interfaces & IPC Schemas

## 1. IPC Overview
The Chromium Extension communicates with the Python Utility processes exclusively via Native Messaging. This occurs primarily using newline-delimited JSON payloads.

All messages must contain an explicit `"type"` field indicating the operation class.

---

## 2. Command Schema Structure
Used when transmitting parsed intents from the NLU process back to the Browser Process for resolution and execution.

```json
{
  "command_id": "8b51d3b0-53db-4e7d-bd7c-2b509bc9bc64",
  "timestamp_ms": 1711627200000,
  "utterance": "click the login button",
  "intent": "CLICK_TARGET",
  "slots": {
    "url": null,
    "target_text": "login",
    "target_role": "button",
    "text": null,
    "direction": null,
    "amount": null,
    "tab_index": null,
    "scope": "web_content"
  },
  "nlu_confidence": 0.94,
  "requires_target_grounding": true,
  "risk_level": "MEDIUM"
}
```

---

## 3. Grounding Candidate Schema
Used by the World Model injected script to serialize accessible and actionable DOM nodes for the Fusion Scorer.

```json
{
  "node_id": "div-login-btn-1",
  "source": "AX",
  "name": "login",
  "role": "button",
  "bounds": {"x": 450, "y": 200, "w": 120, "h": 40},
  "is_visible": true,
  "is_enabled": true,
  "action": "focus",
  "scores": {
    "utterance": 0.92,
    "gaze": 0.85,
    "ui_prior": 0.20,
    "history": 0.05,
    "final": 0.88
  }
}
```

---

## 4. Subsystem Events

### 4.1 ASR Partial Event
Emitted iteratively during transcription to update visual cues in the extension's rendering overlay.

```json
{
  "type": "asr_partial",
  "transcript": "hey chro",
  "confidence": 0.80,
  "is_final": false,
  "latency_ms": 120
}
```

### 4.2 Gaze Update Payload
Passed to the Fusion engine at constant intervals.

```json
{
  "type": "gaze_update",
  "timestamp_ms": 1711627200100,
  "coordinates": {"x": 480, "y": 210},
  "calibration_confidence": 0.65,
  "is_fixation_detected": true
}
```

### 4.3 Action Execution Result
Emitted by the Executor block in the extension, consumed by the Feedback module.

```json
{
  "type": "action_result",
  "command_id": "8b51d3b0-53db-4e7d-bd7c-2b509bc9bc64",
  "success": true,
  "layer_used": "DOM_API",
  "post_condition_met": true,
  "latency_ms": 320,
  "fallback_reason": null
}
```
