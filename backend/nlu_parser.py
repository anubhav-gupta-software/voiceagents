import re
import uuid
import time


VALID_INTENTS = [
    "NAVIGATE", "TAB_OP", "CLICK_TARGET", "TYPE_TEXT",
    "SELECT_OPTION", "SCROLL", "WORKFLOW", "SYSTEM"
]

VALID_ROLES = [
    "button", "link", "textbox", "combobox",
    "menuitem", "tab", "checkbox", "radio", "other", None
]

VALID_SCOPES = [
    "browser_ui", "web_content", "active_dialog", "omnibox", "auto"
]


def _empty_slots():
    return {
        "url": None,
        "target_text": None,
        "target_role": None,
        "text": None,
        "direction": None,
        "amount": None,
        "tab_index": None,
        "scope": "auto"
    }


class NLUParser:
    def __init__(self):
        self._grammar_rules = [
            # TAB_OP (must come before NAVIGATE to avoid "reopen tab" matching "open")
            (r"(?:close|new|switch|reload|refresh|reopen)\s+(?:this\s+)?(?:the\s+)?tab(?:\s+(\d+))?",
             self._parse_tab_op),
            # NAVIGATE
            (r"(?:go\s+to|open|navigate\s+to|visit)\s+(.+)",
             self._parse_navigate),
            (r"(?:go\s+)?back",
             lambda u, m: self._make_tab_op(u, "back")),
            (r"(?:go\s+)?forward",
             lambda u, m: self._make_tab_op(u, "forward")),
            # SELECT_OPTION
            (r"select\s+(?:option\s+)?[\"']?(.+?)[\"']?\s+(?:in|from|on)\s+(.+)",
             self._parse_select_option),
            # TYPE_TEXT
            (r"(?:type|enter|input|write)\s+[\"']?(.+?)[\"']?\s+(?:in|into|on|to)\s+(.+)",
             self._parse_type_text),
            # CLICK_TARGET
            (r"(?:click|press|tap|hit|activate)\s+(?:the\s+)?(?:on\s+)?(.+)",
             self._parse_click),
            # SCROLL
            (r"scroll\s+(up|down|left|right)(?:\s+(a\s+lot|a\s+little|a\s+bit))?",
             self._parse_scroll),
            # SYSTEM
            (r"(?:undo|undo\s+last(?:\s+action)?)",
             lambda u, m: self._make_system(u, "undo")),
            (r"(?:stop|cancel|nevermind|never\s+mind)",
             lambda u, m: self._make_system(u, "cancel")),
            (r"(?:what\s+did\s+you\s+do|show\s+history|last\s+action)",
             lambda u, m: self._make_system(u, "show_history")),
        ]

    def parse(self, utterance: str) -> dict:
        utterance_clean = utterance.lower().strip()

        for pattern, handler in self._grammar_rules:
            match = re.search(pattern, utterance_clean)
            if match:
                command = handler(utterance_clean, match)
                command["utterance"] = utterance.strip()
                command["nlu_confidence"] = 0.92
                return command

        return {
            "command_id": str(uuid.uuid4()),
            "timestamp_ms": int(time.time() * 1000),
            "utterance": utterance.strip(),
            "intent": "UNKNOWN",
            "slots": _empty_slots(),
            "nlu_confidence": 0.0,
            "requires_target_grounding": False,
            "risk_level": "LOW"
        }

    # ── Intent Handlers ──

    def _parse_navigate(self, utterance, match):
        raw_url = match.group(1).strip()
        url = raw_url
        if not re.match(r"https?://", url):
            if "." in url:
                url = "https://" + url.replace(" ", "")
            else:
                url = "https://www.google.com/search?q=" + url.replace(" ", "+")

        slots = _empty_slots()
        slots["url"] = url
        return self._build(utterance, "NAVIGATE", slots,
                           grounding=False, risk="LOW")

    def _parse_tab_op(self, utterance, match):
        action = "reload"
        if "close" in utterance:
            action = "close"
        elif "new" in utterance:
            action = "new"
        elif "switch" in utterance:
            action = "switch"
        elif "reopen" in utterance:
            action = "reopen"
        elif "reload" in utterance or "refresh" in utterance:
            action = "reload"

        slots = _empty_slots()
        slots["text"] = action
        if match.lastindex and match.group(1):
            try:
                slots["tab_index"] = int(match.group(1))
            except ValueError:
                pass

        risk = "MEDIUM" if action == "close" else "LOW"
        return self._build(utterance, "TAB_OP", slots,
                           grounding=False, risk=risk)

    def _make_tab_op(self, utterance, action):
        slots = _empty_slots()
        slots["text"] = action
        return self._build(utterance, "TAB_OP", slots,
                           grounding=False, risk="LOW")

    def _parse_click(self, utterance, match):
        target = match.group(1).strip()
        role = None
        for r in ["button", "link", "tab", "checkbox", "menu", "menuitem"]:
            if r in target:
                role = r
                target = target.replace(r, "").strip()
                break

        slots = _empty_slots()
        slots["target_text"] = target
        slots["target_role"] = role
        return self._build(utterance, "CLICK_TARGET", slots,
                           grounding=True, risk="MEDIUM")

    def _parse_type_text(self, utterance, match):
        slots = _empty_slots()
        slots["text"] = match.group(1).strip()
        slots["target_text"] = match.group(2).strip()
        return self._build(utterance, "TYPE_TEXT", slots,
                           grounding=True, risk="MEDIUM")

    def _parse_select_option(self, utterance, match):
        slots = _empty_slots()
        slots["text"] = match.group(1).strip()
        slots["target_text"] = match.group(2).strip()
        slots["target_role"] = "combobox"
        return self._build(utterance, "SELECT_OPTION", slots,
                           grounding=True, risk="MEDIUM")

    def _parse_scroll(self, utterance, match):
        slots = _empty_slots()
        slots["direction"] = match.group(1)
        amount_text = match.group(2) if match.lastindex >= 2 else None
        if amount_text:
            if "lot" in amount_text:
                slots["amount"] = "large"
            elif "little" in amount_text or "bit" in amount_text:
                slots["amount"] = "small"
        else:
            slots["amount"] = "medium"
        return self._build(utterance, "SCROLL", slots,
                           grounding=False, risk="LOW")

    def _make_system(self, utterance, action):
        slots = _empty_slots()
        slots["text"] = action
        return self._build(utterance, "SYSTEM", slots,
                           grounding=False, risk="LOW")

    def _build(self, utterance, intent, slots, grounding, risk):
        return {
            "command_id": str(uuid.uuid4()),
            "timestamp_ms": int(time.time() * 1000),
            "utterance": utterance,
            "intent": intent,
            "slots": slots,
            "nlu_confidence": 0.0,
            "requires_target_grounding": grounding,
            "risk_level": risk
        }


if __name__ == "__main__":
    parser = NLUParser()
    tests = [
        "click the login button",
        "go to google.com",
        "scroll down",
        "scroll up a lot",
        "type hello world into search box",
        "close tab",
        "new tab",
        "switch tab 3",
        "reopen tab",
        "go back",
        "undo",
        "select option Large from size dropdown",
        "press submit",
        "click delete account",
        "navigate to youtube",
        "cancel",
    ]
    for t in tests:
        r = parser.parse(t)
        print(f"  [{r['intent']:15s}] {t}")
        print(f"    slots={r['slots']}")
        print(f"    risk={r['risk_level']}  grounding={r['requires_target_grounding']}")
        print()
