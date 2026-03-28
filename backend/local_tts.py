import platform
import subprocess
import shlex


class LocalTTS:
    def __init__(self, mode="standard"):
        self.mode = mode
        self.os_type = platform.system()

    def speak(self, text):
        if self.mode == "silent":
            return

        safe_text = text.replace("'", "'\\''")

        try:
            if self.os_type == "Darwin":
                rate = "200" if self.mode == "concise" else "175"
                subprocess.Popen(["say", "-r", rate, text])
            elif self.os_type == "Linux":
                subprocess.Popen(["espeak", text])
            elif self.os_type == "Windows":
                escaped = safe_text.replace("'", "''")
                ps_script = (
                    "Add-Type -AssemblyName System.speech;"
                    "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;"
                    f"$s.Speak('{escaped}')"
                )
                subprocess.Popen(["powershell", "-Command", ps_script])
        except FileNotFoundError:
            print(f"[TTS] Speech binary not found on {self.os_type}")
        except Exception as e:
            print(f"[TTS] Error: {e}")

    def set_mode(self, mode):
        if mode in ("standard", "concise", "silent"):
            self.mode = mode


if __name__ == "__main__":
    tts = LocalTTS(mode="standard")
    tts.speak("Voice agent accessibility systems are online.")
