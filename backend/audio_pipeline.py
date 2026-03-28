import pyaudio
import webrtcvad
import queue
import threading
import numpy as np
from faster_whisper import WhisperModel

class AudioPipeline:
    def __init__(self, sample_rate=16000, chunk_ms=30):
        self.sample_rate = sample_rate
        self.chunk_size = int(sample_rate * chunk_ms / 1000)
        
        self.vad = webrtcvad.Vad(3) # High aggressiveness
        self.audio = pyaudio.PyAudio()
        self.stream = None
        
        self.audio_queue = queue.Queue()
        self.running = False
        
        # WP-02 Hardware capability probe logic sets this device type in prod
        print("Loading Whisper Model...")
        self.model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
        print("Whisper Model loaded.")

    def _audio_callback(self, in_data, frame_count, time_info, status):
        self.audio_queue.put(in_data)
        return (in_data, pyaudio.paContinue)

    def start_listening(self):
        self.running = True
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._audio_callback
        )
        self.stream.start_stream()
        
        # Start transcription thread
        threading.Thread(target=self._process_audio, daemon=True).start()

    def _process_audio(self):
        buffer = b""
        is_speaking = False
        
        while self.running:
            try:
                frame = self.audio_queue.get(timeout=1.0)
                # Ensure frame size matches Vad expectation 
                if len(frame) != self.chunk_size * 2:
                    continue
                
                is_speech = self.vad.is_speech(frame, self.sample_rate)
                
                if is_speech:
                    buffer += frame
                    is_speaking = True
                elif is_speaking:
                    # Silence detected, process buffer if large enough
                    if len(buffer) > self.sample_rate * 2: # At least 1 second
                        self._transcribe(buffer)
                    buffer = b""
                    is_speaking = False
                    
            except queue.Empty:
                continue

    def _transcribe(self, audio_data):
        # Convert raw bytes to numpy array
        np_audio = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        
        segments, info = self.model.transcribe(np_audio, beam_size=1)
        transcript = "".join([segment.text for segment in segments]).strip()
        
        if transcript:
            print(f"TRANSCRIPT: {transcript}")
            # Here this would send an event down the event bus to NLU parser

    def stop(self):
        self.running = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        self.audio.terminate()

if __name__ == "__main__":
    import time
    pipeline = AudioPipeline()
    pipeline.start_listening()
    print("Listening... (Press Ctrl+C to stop)")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pipeline.stop()
