class PolicyEngine:
    def __init__(self, config):
        self.config = config

    def evaluate_risk(self, command: dict) -> dict:
        intent = command.get("intent")
        slots = command.get("slots", {})
        
        # Determine strict Risk Tier
        risk = "LOW"
        confirmation_required = False
        
        if intent in ["SCROLL", "NAVIGATE", "TAB_OP"]:
            risk = "LOW"
        elif intent in ["TYPE_TEXT"]:
            risk = "MEDIUM"
        elif intent == "CLICK_TARGET":
            # Contextual analysis of target text
            target = slots.get("target_text", "").lower()
            if any(danger in target for danger in ["delete", "remove", "pay", "buy", "submit", "save"]):
                risk = "HIGH"
            else:
                risk = "MEDIUM"

        # Apply config policies
        if risk == "HIGH" and self.config.get("require_confirmation_high", True):
            confirmation_required = True
        elif risk == "CRITICAL" and self.config.get("require_confirmation_critical", True):
            confirmation_required = True
            
        return {
            "risk_level": risk,
            "confirmation_required": confirmation_required,
            "blocked": False # e.g. if offline policy breached
        }

if __name__ == "__main__":
    engine = PolicyEngine({"require_confirmation_high": True, "require_confirmation_critical": True})
    
    # Test cases
    print(engine.evaluate_risk({"intent": "SCROLL"}))
    print(engine.evaluate_risk({"intent": "CLICK_TARGET", "slots": {"target_text": "next page"}}))
    print(engine.evaluate_risk({"intent": "CLICK_TARGET", "slots": {"target_text": "delete account"}}))
