import time
import math


class GazeTracker:
    def __init__(self, fps=30, min_confidence=0.60):
        self.fps = fps
        self.min_confidence = min_confidence
        self.running = False
        self.current_gaze = {"x": 0, "y": 0, "confidence": 0.0, "timestamp": 0}
        self.history = []
        self.calibration_confidence = 0.0

    def start(self):
        self.running = True
        print("[GazeTracker] Initialized (placeholder - connect hardware/webcam SDK)")

    def get_gaze(self):
        return dict(self.current_gaze)

    def update_gaze(self, x, y, confidence):
        self.current_gaze = {
            "x": x, "y": y,
            "confidence": confidence,
            "timestamp": time.time()
        }
        self.history.append(self.current_gaze)
        if len(self.history) > 300:
            self.history = self.history[-300:]

    def get_calibration_confidence(self):
        if not self.history:
            return 0.0
        recent = self.history[-30:]
        avg_conf = sum(h["confidence"] for h in recent) / len(recent)
        return avg_conf

    def stop(self):
        self.running = False


DEFAULTS = {
    "a": 0.55,
    "b": 0.20,
    "c": 0.15,
    "d": 0.10,
    "auto_threshold": 0.78,
    "margin_threshold": 0.12,
    "gaze_min_conf": 0.60,
    "fixation_min_ms": 120,
    "fixation_max_ms": 250,
}


class FusionScorer:
    def __init__(self, config):
        gaze_on = config.get("gaze_enabled", False)
        self.a = DEFAULTS["a"]
        self.b = DEFAULTS["b"] if gaze_on else 0.0
        self.c = DEFAULTS["c"]
        self.d = DEFAULTS["d"]
        self.auto_threshold = DEFAULTS["auto_threshold"]
        self.margin_threshold = DEFAULTS["margin_threshold"]
        self.gaze_min_conf = DEFAULTS["gaze_min_conf"]
        self.gaze_enabled = gaze_on

    def score_candidates(self, candidates, utterance_intent, current_gaze):
        target_text = (utterance_intent.get("slots", {}).get("target_text") or "").lower()
        target_role = utterance_intent.get("slots", {}).get("target_role")

        gaze_conf = current_gaze.get("confidence", 0.0) if current_gaze else 0.0

        a, b, c, d = self.a, self.b, self.c, self.d
        if self.gaze_enabled and gaze_conf < self.gaze_min_conf:
            b = 0.05
            surplus = (self.b - 0.05)
            a += surplus * 0.6
            c += surplus * 0.4

        for node in candidates:
            u_score = self._utterance_score(target_text, target_role, node)
            g_score = self._gaze_score(current_gaze, node) if self.gaze_enabled else 0.0
            p_score = self._ui_prior_score(node)
            h_score = 0.0

            final = (a * u_score) + (b * g_score) + (c * p_score) + (d * h_score)

            node["scores"] = {
                "utterance": round(u_score, 4),
                "gaze": round(g_score, 4),
                "ui_prior": round(p_score, 4),
                "history": round(h_score, 4),
                "final": round(final, 4)
            }

        candidates.sort(key=lambda x: x["scores"]["final"], reverse=True)
        return candidates

    def pick_target(self, scored_candidates):
        if not scored_candidates:
            return {"target": None, "action": "clarify", "reason": "no_candidates"}

        top = scored_candidates[0]
        top_score = top["scores"]["final"]

        if top_score < self.auto_threshold:
            labels = [c.get("name", "?") for c in scored_candidates[:3]]
            return {
                "target": None,
                "action": "clarify",
                "reason": "below_threshold",
                "candidates": labels
            }

        if len(scored_candidates) >= 2:
            second_score = scored_candidates[1]["scores"]["final"]
            margin = top_score - second_score
            if margin < self.margin_threshold:
                labels = [c.get("name", "?") for c in scored_candidates[:3]]
                return {
                    "target": None,
                    "action": "clarify",
                    "reason": "insufficient_margin",
                    "candidates": labels
                }

        return {"target": top, "action": "execute"}

    def _utterance_score(self, target_text, target_role, node):
        name = (node.get("name") or "").lower()
        if not target_text or not name:
            return 0.0

        if name == target_text:
            score = 1.0
        elif target_text in name:
            score = 0.8
        elif name in target_text:
            score = 0.6
        else:
            words = target_text.split()
            matched = sum(1 for w in words if w in name)
            score = (matched / len(words)) * 0.7 if words else 0.0

        if target_role and node.get("role") == target_role:
            score = min(1.0, score + 0.1)

        return score

    def _gaze_score(self, gaze, node):
        if not gaze or gaze.get("confidence", 0) < self.gaze_min_conf:
            return 0.0

        bounds = node.get("bounds", {})
        bx, by = bounds.get("x", 0), bounds.get("y", 0)
        bw, bh = bounds.get("w", 0), bounds.get("h", 0)
        gx, gy = gaze.get("x", 0), gaze.get("y", 0)

        if bx <= gx <= bx + bw and by <= gy <= by + bh:
            return 1.0

        cx = bx + bw / 2
        cy = by + bh / 2
        dist = math.hypot(cx - gx, cy - gy)
        return max(0.0, 1.0 - (dist / 800.0))

    def _ui_prior_score(self, node):
        if not node.get("is_visible", False):
            return 0.0
        if not node.get("is_enabled", False):
            return 0.2
        return 1.0


if __name__ == "__main__":
    fusion = FusionScorer({"gaze_enabled": True})
    nodes = [
        {"name": "Login", "role": "button", "bounds": {"x": 480, "y": 280, "w": 100, "h": 40}, "is_visible": True, "is_enabled": True},
        {"name": "Logout", "role": "button", "bounds": {"x": 100, "y": 100, "w": 100, "h": 40}, "is_visible": True, "is_enabled": True},
        {"name": "Sign Up", "role": "link", "bounds": {"x": 300, "y": 200, "w": 80, "h": 30}, "is_visible": True, "is_enabled": True},
    ]
    intent = {"slots": {"target_text": "login", "target_role": "button"}}
    gaze = {"x": 500, "y": 300, "confidence": 0.9}

    scored = fusion.score_candidates([dict(n) for n in nodes], intent, gaze)
    result = fusion.pick_target(scored)
    print("Result:", result)
    for n in scored:
        print(f"  {n['name']:15s} -> {n['scores']}")
