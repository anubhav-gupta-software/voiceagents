import re
import uuid
import time

class NLUParser:
    def __init__(self):
        self.intents = {
            "NAVIGATE": r"(?:go to|open|navigate to)\s+(.+)",
            "TAB_OP": r"(?:close|new|switch|reload|refresh)\s+(?:this\s+)?tab",
            "CLICK_TARGET": r"(?:click|press|tap)\s+(?:the\s+)?(.+)",
            "TYPE_TEXT": r"(?:type|enter|input)\s+(.+?)\s+(?:in|into|to)\s+(.+)",
            "SCROLL": r"scroll\s+(up|down|left|right)"
        }
        
    def parse(self, utterance: str) -> dict:
        utterance = utterance.lower().strip()
        
        command = {
            "command_id": str(uuid.uuid4()),
            "timestamp_ms": int(time.time() * 1000),
            "utterance": utterance,
            "intent": "UNKNOWN",
            "slots": {},
            "nlu_confidence": 0.0,
            "requires_target_grounding": False,
            "risk_level": "LOW"
        }
        
        # Grounding check deterministic grammar
        for intent, pattern in self.intents.items():
            match = re.search(pattern, utterance)
            if match:
                command["intent"] = intent
                command["nlu_confidence"] = 0.9  # High for deterministic match
                
                # Assign specific slots based on intent
                if intent == "NAVIGATE":
                    command["slots"]["url"] = match.group(1).replace(" ", "")
                elif intent == "TAB_OP":
                    if "close" in utterance: command["slots"]["action"] = "close"
                    elif "new" in utterance: command["slots"]["action"] = "new"
                    elif "switch" in utterance: command["slots"]["action"] = "switch"
                    else: command["slots"]["action"] = "reload"
                elif intent == "CLICK_TARGET":
                    command["slots"]["target_text"] = match.group(1)
                    command["requires_target_grounding"] = True
                    command["risk_level"] = "MEDIUM"
                elif intent == "TYPE_TEXT":
                    command["slots"]["text"] = match.group(1)
                    command["slots"]["target_text"] = match.group(2)
                    command["requires_target_grounding"] = True
                    command["risk_level"] = "MEDIUM"
                elif intent == "SCROLL":
                    command["slots"]["direction"] = match.group(1)
                
                return command
                
        # Semantic mapping schema fallback goes here in WP-04 full execution (via small LLM)
        
        return command

if __name__ == "__main__":
    parser = NLUParser()
    print(parser.parse("click the login button"))
    print(parser.parse("go to google.com"))
    print(parser.parse("scroll down"))
