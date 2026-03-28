#!/Applications/Xcode.app/Contents/Developer/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3.9 -u

import sys
import os
import json
import struct
import platform
import logging
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nlu_parser import NLUParser
from policy_engine import PolicyEngine
from gaze_tracker import GazeTracker, FusionScorer
from local_tts import LocalTTS

LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "host.log")
logging.basicConfig(
    filename=LOG_PATH,
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s"
)

DEFAULT_CONFIG = {
    "voice_agent_enabled": True,
    "local_only": True,
    "wake_word": {
        "enabled": True,
        "phrase": "hey chromium",
        "sensitivity": 0.55
    },
    "asr": {
        "model": "asr-small-q5",
        "backend_priority": ["npu", "gpu", "cpu_simd", "cpu"],
        "max_latency_ms": 500
    },
    "nlu": {
        "grammar_enabled": True,
        "semantic_parser_enabled": True,
        "confidence_threshold": 0.70
    },
    "gaze": {
        "enabled": False,
        "provider": "auto",
        "min_confidence": 0.60,
        "weight": 0.20
    },
    "policy": {
        "require_confirmation_high": True,
        "require_confirmation_critical": True
    },
    "telemetry": {
        "local_metrics_only": True,
        "persist_logs": False
    }
}

STATE_DISABLED = "DISABLED"
STATE_IDLE = "IDLE"
STATE_LISTENING = "LISTENING"
STATE_TRANSCRIBING = "TRANSCRIBING"
STATE_PARSING = "PARSING"
STATE_GROUNDING = "GROUNDING"
STATE_CONFIRMING = "CONFIRMING"
STATE_EXECUTING = "EXECUTING"
STATE_VERIFYING = "VERIFYING"
STATE_FEEDBACK = "FEEDBACK"
STATE_ERROR_RECOVERY = "ERROR_RECOVERY"


class NativeMessagingHost:
    def __init__(self):
        self.running = True
        self.config = dict(DEFAULT_CONFIG)
        self.state = STATE_IDLE

        self.nlu = NLUParser()
        self.policy = PolicyEngine(self.config.get("policy", {}))
        self.gaze_tracker = GazeTracker()
        self.fusion = FusionScorer({"gaze_enabled": self.config["gaze"]["enabled"]})
        self.tts = LocalTTS(mode="standard")

        self.audio_pipeline = None
        self.action_history = []

        self.metrics = {
            "commands_processed": 0,
            "commands_succeeded": 0,
            "wrong_target_count": 0,
            "clarification_count": 0,
            "total_latency_ms": 0,
        }
        logging.debug("NativeMessagingHost initialized, state=%s", self.state)

    def _transition(self, new_state):
        logging.debug("State transition: %s -> %s", self.state, new_state)
        self.state = new_state

    # ── Chrome Native Messaging I/O ──

    def get_message(self):
        raw_len = sys.stdin.buffer.read(4)
        if len(raw_len) == 0:
            return None
        length = struct.unpack("@I", raw_len)[0]
        message = sys.stdin.buffer.read(length).decode("utf-8")
        return json.loads(message)

    def send_message(self, response):
        encoded = json.dumps(response).encode("utf-8")
        sys.stdout.buffer.write(struct.pack("@I", len(encoded)))
        sys.stdout.buffer.write(encoded)
        sys.stdout.buffer.flush()

    # ── Request Handlers ──

    def handle_request(self, message):
        msg_type = message.get("type", "unknown")

        if msg_type == "ping":
            return {"type": "pong", "state": self.state}

        elif msg_type == "probe_capabilities":
            return {
                "type": "capabilities_response",
                "os": platform.system(),
                "backends": self._detect_backends(),
                "memory_budget_mb": 4096,
                "state": self.state,
                "status": "ready"
            }

        elif msg_type == "update_config":
            new_cfg = message.get("config", {})
            self._merge_config(new_cfg)
            self.policy = PolicyEngine(self.config.get("policy", {}))
            self.fusion = FusionScorer({
                "gaze_enabled": self.config["gaze"]["enabled"]
            })
            return {"type": "config_updated", "config": self.config}

        elif msg_type == "get_config":
            return {"type": "config_response", "config": self.config}

        elif msg_type == "process_transcript":
            return self._handle_transcript(message)

        elif msg_type == "start_audio":
            return self._start_audio_pipeline()

        elif msg_type == "stop_audio":
            return self._stop_audio_pipeline()

        elif msg_type == "get_metrics":
            return {"type": "metrics_response", "metrics": self.metrics}

        elif msg_type == "get_state":
            return {"type": "state_response", "state": self.state}

        return {"type": "error", "error": f"Unknown message type: {msg_type}"}

    def _handle_transcript(self, message):
        start_ms = time.time() * 1000
        transcript = message.get("transcript", "")
        world_model_nodes = message.get("world_model", [])
        gaze_data = message.get("gaze", None)

        if not transcript.strip():
            return {"type": "noop", "reason": "empty_transcript"}

        # Phase 1: NLU Parse
        self._transition(STATE_PARSING)
        command = self.nlu.parse(transcript)
        nlu_latency = time.time() * 1000 - start_ms

        if command["intent"] == "UNKNOWN":
            self._transition(STATE_IDLE)
            return {
                "type": "parse_result",
                "command": command,
                "action": "clarify",
                "message": "I didn't understand that command. Could you rephrase?"
            }

        # Phase 2: Policy evaluation
        risk_result = self.policy.evaluate_risk(command)
        command["risk_level"] = risk_result["risk_level"]

        if risk_result["blocked"]:
            self._transition(STATE_IDLE)
            return {
                "type": "blocked",
                "command": command,
                "reason": risk_result.get("block_reason", "Policy violation")
            }

        # Phase 3: Target grounding (if needed)
        grounding_result = None
        if command["requires_target_grounding"] and world_model_nodes:
            self._transition(STATE_GROUNDING)
            gaze_input = gaze_data or {"x": 0, "y": 0, "confidence": 0.0}
            scored = self.fusion.score_candidates(
                [dict(n) for n in world_model_nodes],
                command,
                gaze_input
            )
            grounding_result = self.fusion.pick_target(scored)

        # Phase 4: Confirmation check
        if risk_result["confirmation_required"]:
            self._transition(STATE_CONFIRMING)
            target_desc = ""
            if grounding_result and grounding_result.get("target"):
                target_desc = grounding_result["target"].get("name", "")
            return {
                "type": "confirm_required",
                "command": command,
                "risk": risk_result,
                "grounding": grounding_result,
                "message": f"Confirm {command['intent']}: {target_desc}? (risk: {risk_result['risk_level']})"
            }

        # Phase 5: Ready for execution
        self._transition(STATE_EXECUTING)

        end_ms = time.time() * 1000
        latency = end_ms - start_ms
        self.metrics["commands_processed"] += 1
        self.metrics["total_latency_ms"] += latency

        self.action_history.append({
            "command": command,
            "timestamp_ms": int(end_ms)
        })
        if len(self.action_history) > 50:
            self.action_history = self.action_history[-50:]

        self._transition(STATE_IDLE)

        return {
            "type": "execute",
            "command": command,
            "risk": risk_result,
            "grounding": grounding_result,
            "latency_ms": round(latency, 2)
        }

    def _start_audio_pipeline(self):
        try:
            from audio_pipeline import AudioPipeline
            self.audio_pipeline = AudioPipeline(
                on_transcript=self._on_local_transcript
            )
            self.audio_pipeline.start_listening()
            self._transition(STATE_LISTENING)
            return {"type": "audio_started", "state": self.state}
        except Exception as e:
            logging.error("Failed to start audio pipeline: %s", e, exc_info=True)
            return {"type": "error", "error": str(e)}

    def _stop_audio_pipeline(self):
        if self.audio_pipeline:
            self.audio_pipeline.stop()
            self.audio_pipeline = None
        self._transition(STATE_IDLE)
        return {"type": "audio_stopped", "state": self.state}

    def _on_local_transcript(self, transcript, confidence, is_final):
        if is_final and transcript.strip():
            result = self._handle_transcript({
                "transcript": transcript,
                "world_model": [],
                "gaze": None
            })
            self.send_message(result)

    def _detect_backends(self):
        backends = ["cpu"]
        try:
            import subprocess
            check = subprocess.run(
                ["python", "-c", "import torch; print(torch.cuda.is_available())"],
                capture_output=True, text=True, timeout=5
            )
            if "True" in check.stdout:
                backends.insert(0, "gpu_cuda")
        except Exception:
            pass

        if platform.system() == "Darwin":
            backends.insert(0, "gpu_metal")

        return backends

    def _merge_config(self, updates):
        for key, val in updates.items():
            if isinstance(val, dict) and isinstance(self.config.get(key), dict):
                self.config[key].update(val)
            else:
                self.config[key] = val

    # ── Main Loop ──

    def run(self):
        logging.debug("Starting Native Messaging run loop")
        while self.running:
            try:
                message = self.get_message()
                if message is None:
                    logging.debug("Stdin closed. Exiting.")
                    break

                logging.debug("Received: %s", json.dumps(message)[:500])
                response = self.handle_request(message)
                if response:
                    logging.debug("Sending: %s", json.dumps(response)[:500])
                    self.send_message(response)
            except Exception as e:
                logging.error("Error in run loop: %s", e, exc_info=True)
                try:
                    self.send_message({"type": "error", "error": str(e)})
                except Exception:
                    break
        logging.debug("Exiting Native Messaging Host")


if __name__ == "__main__":
    logging.debug("Executing __main__")
    try:
        host = NativeMessagingHost()
        host.run()
    except Exception as e:
        logging.error("Failed to start host: %s", e, exc_info=True)
