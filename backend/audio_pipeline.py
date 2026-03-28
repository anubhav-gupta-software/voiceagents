import queue
import threading
import time
import numpy as np

try:
    import pyaudio
    HAS_PYAUDIO = True
except ImportError:
    HAS_PYAUDIO = False

try:
    import webrtcvad
    HAS_VAD = True
except ImportError:
    HAS_VAD = False

try:
    from faster_whisper import WhisperModel
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False

try:
    from openwakeword.model import Model as WakeWordModel
    HAS_WAKEWORD = True
except ImportError:
    HAS_WAKEWORD = False


class AudioPipeline:
    def __init__(self, sample_rate=16000, chunk_ms=30,
                 wake_word_enabled=True, wake_word_phrase="hey chromium",
                 wake_word_sensitivity=0.55, on_transcript=None):
        self.sample_rate = sample_rate
        self.chunk_ms = chunk_ms
        self.chunk_size = int(sample_rate * chunk_ms / 1000)
        self.on_transcript = on_transcript or self._default_on_transcript

        self.audio_queue = queue.Queue(maxsize=500)
        self.running = False
        self.stream = None
        self._audio_interface = None

        # VAD
        self.vad = None
        if HAS_VAD:
            self.vad = webrtcvad.Vad(3)

        # Wake word
        self.wake_word_enabled = wake_word_enabled and HAS_WAKEWORD
        self.wake_word_model = None
        self.wake_word_active = False
        if self.wake_word_enabled:
            try:
                self.wake_word_model = WakeWordModel(
                    wakeword_models=["hey_jarvis"],
                    inference_framework="onnx"
                )
                print("[AudioPipeline] Wake-word model loaded")
            except Exception as e:
                print(f"[AudioPipeline] Wake-word init failed: {e}")
                self.wake_word_enabled = False

        # ASR (Whisper)
        self.model = None
        if HAS_WHISPER:
            print("[AudioPipeline] Loading Whisper model...")
            try:
                self.model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
                print("[AudioPipeline] Whisper model loaded")
            except Exception as e:
                print(f"[AudioPipeline] Whisper load failed: {e}")

        # Push-to-talk state
        self.push_to_talk_active = False

    def _default_on_transcript(self, transcript, confidence, is_final):
        print(f"[TRANSCRIPT] {'FINAL' if is_final else 'PARTIAL'} ({confidence:.2f}): {transcript}")

    def _audio_callback(self, in_data, frame_count, time_info, status):
        if not self.audio_queue.full():
            self.audio_queue.put(in_data)
        return (in_data, pyaudio.paContinue)

    def start_listening(self):
        if not HAS_PYAUDIO:
            print("[AudioPipeline] pyaudio not available, cannot start mic")
            return

        self.running = True
        self._audio_interface = pyaudio.PyAudio()
        self.stream = self._audio_interface.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._audio_callback
        )
        self.stream.start_stream()
        threading.Thread(target=self._process_audio, daemon=True).start()
        print("[AudioPipeline] Listening started")

    def set_push_to_talk(self, active):
        self.push_to_talk_active = active

    def _process_audio(self):
        speech_buffer = b""
        is_speaking = False
        silence_frames = 0
        max_silence_frames = int(0.6 * 1000 / self.chunk_ms)

        while self.running:
            try:
                frame = self.audio_queue.get(timeout=1.0)
            except queue.Empty:
                continue

            expected_bytes = self.chunk_size * 2
            if len(frame) != expected_bytes:
                continue

            # Wake-word gate
            if self.wake_word_enabled and not self.wake_word_active:
                if self.wake_word_model:
                    np_chunk = np.frombuffer(frame, dtype=np.int16)
                    prediction = self.wake_word_model.predict(np_chunk)
                    scores = list(prediction.values()) if isinstance(prediction, dict) else []
                    if any(s > 0.5 for s in scores):
                        self.wake_word_active = True
                        self.on_transcript("Wake word detected", 1.0, False)
                        continue
                continue

            # VAD
            is_speech = True
            if self.vad:
                try:
                    is_speech = self.vad.is_speech(frame, self.sample_rate)
                except Exception:
                    is_speech = True

            if is_speech:
                speech_buffer += frame
                is_speaking = True
                silence_frames = 0
            elif is_speaking:
                silence_frames += 1
                speech_buffer += frame
                if silence_frames >= max_silence_frames:
                    min_bytes = self.sample_rate * 2
                    if len(speech_buffer) > min_bytes:
                        self._transcribe(speech_buffer)
                    speech_buffer = b""
                    is_speaking = False
                    silence_frames = 0
                    if self.wake_word_enabled:
                        self.wake_word_active = False

    def _transcribe(self, audio_data):
        if not self.model:
            return

        np_audio = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0

        try:
            segments, info = self.model.transcribe(np_audio, beam_size=1)
            parts = []
            for seg in segments:
                parts.append(seg.text)

            transcript = " ".join(parts).strip()
            if transcript:
                confidence = 0.85
                self.on_transcript(transcript, confidence, True)
        except Exception as e:
            print(f"[AudioPipeline] Transcription error: {e}")

    def stop(self):
        self.running = False
        if self.stream:
            try:
                self.stream.stop_stream()
                self.stream.close()
            except Exception:
                pass
        if self._audio_interface:
            try:
                self._audio_interface.terminate()
            except Exception:
                pass
        print("[AudioPipeline] Stopped")


if __name__ == "__main__":
    pipeline = AudioPipeline(wake_word_enabled=False)
    pipeline.start_listening()
    print("Listening... (Ctrl+C to stop)")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pipeline.stop()
