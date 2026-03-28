DANGEROUS_KEYWORDS = [
    "delete", "remove", "erase", "destroy", "clear all", "wipe",
    "pay", "buy", "purchase", "checkout", "place order",
    "submit", "confirm order", "transfer",
    "save", "apply", "update settings"
]

CRITICAL_KEYWORDS = [
    "delete account", "remove account", "close account",
    "pay now", "purchase", "place order", "checkout",
    "transfer funds", "send money", "wire transfer",
    "change password", "update email", "two factor",
    "disable security", "revoke", "deauthorize"
]

RESTRICTED_CONTEXTS = [
    "captcha", "recaptcha", "i'm not a robot",
    "verify you are human", "security check"
]


class PolicyEngine:
    def __init__(self, config):
        self.require_high = config.get("require_confirmation_high", True)
        self.require_critical = config.get("require_confirmation_critical", True)

    def evaluate_risk(self, command: dict) -> dict:
        intent = command.get("intent", "")
        slots = command.get("slots", {})
        target_text = (slots.get("target_text") or "").lower()
        text_val = (slots.get("text") or "").lower()
        combined = f"{target_text} {text_val}"

        risk = self._classify_risk(intent, combined, slots)
        confirmation_required = False
        blocked = False
        block_reason = None

        if risk == "CRITICAL" and self.require_critical:
            confirmation_required = True
        elif risk == "HIGH" and self.require_high:
            confirmation_required = True

        for rc in RESTRICTED_CONTEXTS:
            if rc in combined:
                blocked = True
                block_reason = "Restricted context detected (anti-bot/CAPTCHA)"
                break

        return {
            "risk_level": risk,
            "confirmation_required": confirmation_required,
            "blocked": blocked,
            "block_reason": block_reason
        }

    def _classify_risk(self, intent, combined_text, slots):
        if intent in ("SCROLL",):
            return "LOW"

        if intent == "NAVIGATE":
            return "LOW"

        if intent == "TAB_OP":
            action = (slots.get("text") or "").lower()
            if action in ("close",):
                return "MEDIUM"
            return "LOW"

        if intent == "SYSTEM":
            return "LOW"

        for kw in CRITICAL_KEYWORDS:
            if kw in combined_text:
                return "CRITICAL"

        for kw in DANGEROUS_KEYWORDS:
            if kw in combined_text:
                return "HIGH"

        if intent in ("CLICK_TARGET", "TYPE_TEXT", "SELECT_OPTION"):
            return "MEDIUM"

        return "MEDIUM"


if __name__ == "__main__":
    engine = PolicyEngine({
        "require_confirmation_high": True,
        "require_confirmation_critical": True
    })

    cases = [
        {"intent": "SCROLL", "slots": {"direction": "down"}},
        {"intent": "CLICK_TARGET", "slots": {"target_text": "next page"}},
        {"intent": "CLICK_TARGET", "slots": {"target_text": "delete account"}},
        {"intent": "CLICK_TARGET", "slots": {"target_text": "submit"}},
        {"intent": "CLICK_TARGET", "slots": {"target_text": "pay now"}},
        {"intent": "TAB_OP", "slots": {"text": "close"}},
        {"intent": "TAB_OP", "slots": {"text": "new"}},
        {"intent": "NAVIGATE", "slots": {"url": "https://google.com"}},
        {"intent": "CLICK_TARGET", "slots": {"target_text": "verify you are human"}},
    ]

    for c in cases:
        r = engine.evaluate_risk(c)
        print(f"  [{r['risk_level']:8s}] confirm={r['confirmation_required']}  blocked={r['blocked']}  | {c}")
