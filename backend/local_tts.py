# local_tts.py - WP-09 Optional TTS 
import platform
import subprocess

class LocalTTS:
    def __init__(self, mode="standard"):
        self.mode = mode # 'standard', 'concise', 'silent'
        self.os_type = platform.system()

    def speak(self, text):
        if self.mode == "silent":
            return
            
        print(f"TTS Synthesizing: '{text}'")
        
        try:
            if self.os_type == "Darwin":
                # MacOS built-in TTS
                rate = 200 if self.mode == "concise" else 175
                subprocess.Popen(["say", "-r", str(rate), text])
            elif self.os_type == "Linux":
                # Linux espeak
                subprocess.Popen(["espeak", text])
            elif self.os_type == "Windows":
                # Windows SAPI 
                ps_script = f"Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Speak('{text}')"
                subprocess.Popen(["powershell", "-Command", ps_script])
        except Exception as e:
            print(f"TTS Error: {e}")

if __name__ == "__main__":
    tts = LocalTTS(mode="standard")
    tts.speak("Voice agent accessibility systems are online.")
