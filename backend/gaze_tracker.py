import time
import uuid
import math

class GazeTracker:
    def __init__(self, fps=30):
        self.fps = fps
        self.running = False
        self.current_gaze = {"x": 0, "y": 0, "confidence": 0.0}
        self.history = []

    def start(self):
        # Placeholder for real hardware webcam init (e.g. OpenCV / MediaPipe FaceMesh)
        self.running = True
        print("Camera hardware initialized.")

    def get_gaze(self):
        # Dummy return for implementation spec
        return {
            "x": 500,
            "y": 300,
            "confidence": 0.85,
            "timestamp": time.time()
        }

    def stop(self):
        self.running = False


class FusionScorer:
    def __init__(self, config):
        self.a = 0.55 # utterance
        self.b = 0.20 if config.get("gaze_enabled", False) else 0.0 # gaze
        self.c = 0.15 # UI prior
        self.d = 0.10 # history
        self.auto_threshold = 0.78
        self.margin_threshold = 0.12

    def score_candidates(self, candidates: list, utterance_intent: dict, current_gaze: dict) -> list:
        for node in candidates:
            # 1. Utterance Text Math
            u_score = 1.0 if utterance_intent["slots"].get("target_text", "") in node["name"].lower() else 0.1
            
            # 2. Gaze Overlap Match
            g_score = 0.0
            if current_gaze and current_gaze["confidence"] > 0.6:
                bounds = node["bounds"]
                # simple bounding box check
                if (bounds["x"] <= current_gaze["x"] <= bounds["x"] + bounds["w"]) and \
                   (bounds["y"] <= current_gaze["y"] <= bounds["y"] + bounds["h"]):
                    g_score = 1.0
                else:
                    cx = bounds["x"] + bounds["w"]/2
                    cy = bounds["y"] + bounds["h"]/2
                    dist = math.hypot(cx - current_gaze["x"], cy - current_gaze["y"])
                    g_score = max(0.0, 1.0 - (dist / 1000.0))
            
            # 3. UI Prior
            p_score = 1.0 if node["is_visible"] and node["is_enabled"] else 0.0

            # 4. Final Math
            node["scores"] = {
                "utterance": u_score,
                "gaze": g_score,
                "ui_prior": p_score,
                "history": 0.0,
                "final": (self.a * u_score) + (self.b * g_score) + (self.c * p_score)
            }
            
        candidates.sort(key=lambda x: x["scores"]["final"], reverse=True)
        return candidates

if __name__ == "__main__":
    fusion = FusionScorer({"gaze_enabled": True})
    nodes = [
        {"name": "login", "bounds": {"x": 480, "y": 280, "w": 100, "h": 40}, "is_visible": True, "is_enabled": True},
        {"name": "logout", "bounds": {"x": 100, "y": 100, "w": 100, "h": 40}, "is_visible": True, "is_enabled": True}
    ]
    intent = {"slots": {"target_text": "login"}}
    gaze = {"x": 500, "y": 300, "confidence": 0.9}
    
    scored = fusion.score_candidates(nodes, intent, gaze)
    print(scored)
