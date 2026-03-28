# Chromium Voice + Eye Agent Configuration & Migration

## 1. Single Source of Truth Configuration Schema
This schema represents the state used by both the Extension UI and the Python Native Messaging runtime.

```json
{
  "voice_agent_enabled": true,
  "local_only": true,
  "wake_word": {
    "enabled": true,
    "phrase": "hey chromium",
    "sensitivity": 0.55
  },
  "asr": {
    "model": "asr-small-q5",
    "backend_priority": ["npu","gpu","cpu_simd","cpu"],
    "max_latency_ms": 500
  },
  "nlu": {
    "grammar_enabled": true,
    "semantic_parser_enabled": true,
    "confidence_threshold": 0.70
  },
  "gaze": {
    "enabled": true,
    "provider": "auto",
    "min_confidence": 0.60,
    "weight": 0.20
  },
  "policy": {
    "require_confirmation_high": true,
    "require_confirmation_critical": true
  },
  "telemetry": {
    "local_metrics_only": true,
    "persist_logs": false
  }
}
```

## 2. Default Thresholds (Dynamic)

Initial starting values initialized by the application. Handled separately in advanced settings.

- `AUTO_THRESHOLD`: `0.78`
- `MARGIN_THRESHOLD`: `0.12`
- `NLU_CONF_MIN`: `0.70`
- `GAZE_MIN_CONF`: `0.60`
- `FIXATION_MIN_MS`: `120`
- `FIXATION_MAX_MS`: `250`
- `MAX_RETRIES`: `2`

## 3. Migration Plan (v2 to v3)
- Ensure old `telemetry.cloud_fallback` keys are actively deleted (violates `local_only` policy).
- Ensure `nlu.semantic_parser_enabled` is mapped to the new NLU architecture default (`true`).
- `policy.require_confirmation_critical` MUST be injected as `true` irrespective of old configuration data.
