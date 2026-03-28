import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nlu_parser import NLUParser
from policy_engine import PolicyEngine
from gaze_tracker import FusionScorer


def run_suite():
    print("=" * 70)
    print("  CHROMIUM VOICE + EYE AGENT  -  E2E BENCHMARK SUITE")
    print("=" * 70)

    nlu = NLUParser()
    policy = PolicyEngine({
        "require_confirmation_high": True,
        "require_confirmation_critical": True
    })
    fusion = FusionScorer({"gaze_enabled": True})

    world_model = [
        {"node_id": "1", "name": "cancel", "role": "button",
         "bounds": {"x": 100, "y": 100, "w": 50, "h": 20},
         "is_visible": True, "is_enabled": True},
        {"node_id": "2", "name": "delete account", "role": "button",
         "bounds": {"x": 200, "y": 100, "w": 80, "h": 20},
         "is_visible": True, "is_enabled": True},
        {"node_id": "3", "name": "submit", "role": "button",
         "bounds": {"x": 300, "y": 100, "w": 60, "h": 20},
         "is_visible": True, "is_enabled": True},
        {"node_id": "4", "name": "next page", "role": "link",
         "bounds": {"x": 400, "y": 100, "w": 70, "h": 20},
         "is_visible": True, "is_enabled": True},
        {"node_id": "5", "name": "login", "role": "button",
         "bounds": {"x": 500, "y": 300, "w": 80, "h": 30},
         "is_visible": True, "is_enabled": True},
    ]

    test_cases = [
        # NLU + Policy tests
        {"utterance": "click submit", "expected_risk": "HIGH",
         "expected_intent": "CLICK_TARGET", "expected_top_node": "3"},
        {"utterance": "click delete account", "expected_risk": "CRITICAL",
         "expected_intent": "CLICK_TARGET", "expected_top_node": "2"},
        {"utterance": "go to youtube", "expected_risk": "LOW",
         "expected_intent": "NAVIGATE"},
        {"utterance": "scroll down", "expected_risk": "LOW",
         "expected_intent": "SCROLL"},
        {"utterance": "close tab", "expected_risk": "MEDIUM",
         "expected_intent": "TAB_OP"},
        {"utterance": "new tab", "expected_risk": "LOW",
         "expected_intent": "TAB_OP"},
        {"utterance": "go back", "expected_risk": "LOW",
         "expected_intent": "TAB_OP"},
        {"utterance": "undo", "expected_risk": "LOW",
         "expected_intent": "SYSTEM"},
        {"utterance": "click next page", "expected_risk": "MEDIUM",
         "expected_intent": "CLICK_TARGET", "expected_top_node": "4"},

        # Schema compliance checks
        {"utterance": "type hello into search box",
         "expected_intent": "TYPE_TEXT", "expected_risk": "MEDIUM"},
        {"utterance": "select option Large from size dropdown",
         "expected_intent": "SELECT_OPTION", "expected_risk": "MEDIUM"},

        # Grounding with gaze
        {"utterance": "click login", "expected_intent": "CLICK_TARGET",
         "expected_top_node": "5", "gaze": {"x": 510, "y": 310, "confidence": 0.9}},

        # Unknown intent
        {"utterance": "do the hokey pokey", "expected_intent": "UNKNOWN"},
    ]

    passed = 0
    failed = 0
    total_latency = 0
    start = time.time()

    for idx, case in enumerate(test_cases):
        t1 = time.time()

        command = nlu.parse(case["utterance"])

        risk_eval = policy.evaluate_risk(command)

        top_node = None
        if command["requires_target_grounding"]:
            gaze = case.get("gaze", {"x": 0, "y": 0, "confidence": 0.0})
            scored = fusion.score_candidates(
                [dict(n) for n in world_model], command, gaze
            )
            result = fusion.pick_target(scored)
            if result.get("target"):
                top_node = result["target"]["node_id"]

        latency = (time.time() - t1) * 1000
        total_latency += latency

        success = True
        errors = []

        if "expected_intent" in case and command["intent"] != case["expected_intent"]:
            errors.append(f"intent: got {command['intent']}, expected {case['expected_intent']}")
            success = False

        if "expected_risk" in case and risk_eval["risk_level"] != case["expected_risk"]:
            errors.append(f"risk: got {risk_eval['risk_level']}, expected {case['expected_risk']}")
            success = False

        if "expected_top_node" in case and top_node != case["expected_top_node"]:
            errors.append(f"top_node: got {top_node}, expected {case['expected_top_node']}")
            success = False

        status = "PASS" if success else "FAIL"
        if success:
            passed += 1
        else:
            failed += 1

        print(f"\n[Test {idx+1:2d}] {status} | '{case['utterance']}'")
        print(f"         intent={command['intent']}  risk={risk_eval['risk_level']}  "
              f"confirm={risk_eval['confirmation_required']}  "
              f"blocked={risk_eval['blocked']}  latency={latency:.1f}ms")
        if top_node:
            print(f"         grounded_to=node:{top_node}")
        for err in errors:
            print(f"         ERROR: {err}")

    wall = (time.time() - start) * 1000
    print("\n" + "=" * 70)
    print(f"  RESULTS: {passed}/{len(test_cases)} passed, {failed} failed")
    print(f"  Avg latency: {total_latency/len(test_cases):.2f} ms")
    print(f"  Total wall time: {wall:.2f} ms")

    slots_schema_keys = {"url", "target_text", "target_role", "text",
                         "direction", "amount", "tab_index", "scope"}
    sample = nlu.parse("click the login button")
    actual_keys = set(sample["slots"].keys())
    missing = slots_schema_keys - actual_keys
    if missing:
        print(f"\n  SCHEMA WARNING: slots missing keys: {missing}")
    else:
        print(f"\n  SCHEMA CHECK: slots keys match spec (section 7)")

    print("=" * 70)


if __name__ == "__main__":
    run_suite()
