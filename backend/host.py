#!/usr/bin/env python3

import sys
import json
import struct
import platform

class NativeMessagingHost:
    def __init__(self):
        self.running = True

    def get_message(self):
        # Read the message length (first 4 bytes)
        raw_len = sys.stdin.buffer.read(4)
        if len(raw_len) == 0:
            return None
        length = struct.unpack('@I', raw_len)[0]
        
        # Read the message content
        message = sys.stdin.buffer.read(length).decode('utf-8')
        return json.loads(message)

    def send_message(self, response):
        # Encode the JSON message
        encoded_msg = json.dumps(response).encode('utf-8')
        
        # Write the message length
        sys.stdout.buffer.write(struct.pack('@I', len(encoded_msg)))
        
        # Write the message
        sys.stdout.buffer.write(encoded_msg)
        sys.stdout.buffer.flush()

    def handle_request(self, message):
        # Dispatch logic for different message types
        msg_type = message.get("type", "unknown")
        
        if msg_type == "ping":
            return {"type": "pong"}
            
        elif msg_type == "probe_capabilities":
            # WP-02 Backend Capability Probe
            return {
                "type": "capabilities_response",
                "os": platform.system(),
                "architectures": ["npu", "gpu", "cpu_simd", "cpu"],
                "memory_budget_mb": 4096,
                "status": "ready"
            }
            
        return {"error": "Unknown message type"}

    def run(self):
        while self.running:
            message = self.get_message()
            if message is None:
                break
            
            response = self.handle_request(message)
            if response:
                self.send_message(response)

if __name__ == '__main__':
    host = NativeMessagingHost()
    host.run()
