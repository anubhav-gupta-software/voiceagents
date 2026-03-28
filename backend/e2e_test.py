import time
from nlu_parser import NLUParser
from policy_engine import PolicyEngine
from gaze_tracker import FusionScorer

def run_suite():
    print("--- STARTING CHROMIUM VOICE + EYE AGENT E2E BENCHMARK ---")
    
    nlu = NLUParser()
    policy = PolicyEngine({"require_confirmation_high": True, "require_confirmation_critical": True})
    fusion = FusionScorer({"gaze_enabled": True})
    
    # Mock World Model Nodes
    world_model = [
        {"node_id": "1", "name": "cancel", "bounds": {"x": 100, "y": 100, "w": 50, "h": 20}, "is_visible": True, "is_enabled": True},
        {"node_id": "2", "name": "delete account", "bounds": {"x": 200, "y": 100, "w": 80, "h": 20}, "is_visible": True, "is_enabled": True},
        {"node_id": "3", "name": "submit", "bounds": {"x": 300, "y": 100, "w": 60, "h": 20}, "is_visible": True, "is_enabled": True}
    ]
    
    test_cases = [
        {"utterance": "click submit", "expected_risk": "HIGH", "expected_top_node": "3"},
        {"utterance": "click delete account", "expected_risk": "HIGH", "expected_top_node": "2"},
        {"utterance": "go to youtube", "expected_risk": "LOW", "expected_intent": "NAVIGATE"},
        {"utterance": "scroll down", "expected_risk": "LOW", "expected_intent": "SCROLL"}
    ]
    
    passed = 0
    start_time = time.time()
    
    for idx, case in enumerate(test_cases):
        print(f"\n[Test {idx+1}] Utterance: '{case['utterance']}'")
        
        # 1. NLU Parse Phase
        t1 = time.time()
        command = nlu.parse(case["utterance"])
        # 2. Policy Engine Phase
        risk_evaluation = policy.evaluate_risk(command)
        
        # 3. Grounding / Fusion Phase (mocked gaze focus on 0,0)
        top_node = None
        if command["requires_target_grounding"]:
            scored = fusion.score_candidates([dict(n) for n in world_model], command, {"x": 0, "y": 0, "confidence": 0.0})
            if scored:
                top_node = scored[0]["node_id"]
        
        latency = (time.time() - t1) * 1000
        
        # Assertions
        success = True
        if risk_evaluation["risk_level"] != case["expected_risk"]:
            print(f"  FAILED: Expected risk {case['expected_risk']}, got {risk_evaluation['risk_level']}")
            success = False
            
        if "expected_intent" in case and command["intent"] != case["expected_intent"]:
            print(f"  FAILED: Expected intent {case['expected_intent']}, got {command['intent']}")
            success = False
            
        if "expected_top_node" in case and top_node != case["expected_top_node"]:
            print(f"  FAILED: Expected top node {case['expected_top_node']}, got {top_node}")
            success = False
            
        if success:
            passed += 1
            print(f"  PASS! (Latency: {latency:.2f} ms)")
            
    total_latency = (time.time() - start_time) * 1000
    print(f"\n--- SUITE COMPLETE | {passed}/{len(test_cases)} Passed | Total time: {total_latency:.2f} ms ---")
    
if __name__ == "__main__":
    run_suite()
