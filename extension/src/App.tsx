import { useState, useEffect, useRef } from 'react';
import './App.css';

declare var chrome: any;

interface AgentConfig {
  voice_agent_enabled: boolean;
  mic_enabled: boolean;
  wake_word_enabled: boolean;
  wake_word_phrase: string;
  wake_word_sensitivity: number;
  gaze_enabled: boolean;
  gaze_min_confidence: number;
  hardware_priority: string;
  nlu_confidence_threshold: number;
  require_confirmation_high: boolean;
  require_confirmation_critical: boolean;
  tts_mode: string;
  persist_logs: boolean;
  accessibility_mode: string;
}

const DEFAULT_CONFIG: AgentConfig = {
  voice_agent_enabled: true,
  mic_enabled: true,
  wake_word_enabled: true,
  wake_word_phrase: "hey chromium",
  wake_word_sensitivity: 0.55,
  gaze_enabled: false,
  gaze_min_confidence: 0.60,
  hardware_priority: "auto",
  nlu_confidence_threshold: 0.70,
  require_confirmation_high: true,
  require_confirmation_critical: true,
  tts_mode: "standard",
  persist_logs: false,
  accessibility_mode: "standard",
};

type Tab = "command" | "settings";

function App() {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [nativeStatus, setNativeStatus] = useState<string>("...");
  const [commandText, setCommandText] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("command");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['voice_agent_config'], (result: any) => {
        if (result.voice_agent_config) {
          setConfig({ ...DEFAULT_CONFIG, ...result.voice_agent_config });
        }
      });
    }
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "GET_AGENT_STATE" }, (resp: any) => {
        if (resp) {
          setNativeStatus(resp.state || "unknown");
          if (resp.config) setConfig({ ...DEFAULT_CONFIG, ...resp.config });
        }
      });
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const save = (newConfig: AgentConfig) => {
    setConfig(newConfig);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ voice_agent_config: newConfig });
    }
  };

  const toggle = (key: keyof AgentConfig) => {
    save({ ...config, [key]: !(config as any)[key] });
  };

  const setVal = (key: keyof AgentConfig, value: any) => {
    save({ ...config, [key]: value });
  };

  const sendCommand = () => {
    const text = commandText.trim();
    if (!text) return;
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: "PROCESS_VOICE_COMMAND",
        transcript: text,
        world_model: [],
        gaze: null,
      }, () => {
        setLastResult("Sent: " + text);
        setCommandText("");
      });
    }
  };

  const toggleListening = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      if (listening) {
        chrome.runtime.sendMessage({ type: "STOP_LISTENING" });
        setListening(false);
        setLastResult("Mic stopped");
      } else {
        chrome.runtime.sendMessage({ type: "START_LISTENING" });
        setListening(true);
        setLastResult("Mic active - speak a command");
      }
    }
  };

  const statusColor = nativeStatus === "IDLE" ? "#22c55e"
    : nativeStatus === "DISCONNECTED" ? "#ef4444"
    : "#f59e0b";

  const s = {
    section: { marginBottom: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' } as React.CSSProperties,
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } as React.CSSProperties,
    label: { fontSize: '13px', color: '#333' } as React.CSSProperties,
    heading: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, color: '#888', marginBottom: '6px', letterSpacing: '0.5px' } as React.CSSProperties,
    input: { width: '100px', padding: '3px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ced4da' } as React.CSSProperties,
    select: { padding: '3px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ced4da' } as React.CSSProperties,
  };

  return (
    <div style={{ padding: '14px', width: '340px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', margin: 0 }}>Voice Agent</h2>
        <span style={{
          fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
          backgroundColor: statusColor + '22', color: statusColor, fontWeight: 600,
          border: `1px solid ${statusColor}44`
        }}>
          {nativeStatus}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {(["command", "settings"] as Tab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: '6px', fontSize: '12px', fontWeight: 600,
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            backgroundColor: activeTab === t ? '#333' : '#e9ecef',
            color: activeTab === t ? '#fff' : '#666',
          }}>
            {t === "command" ? "Command" : "Settings"}
          </button>
        ))}
      </div>

      {/* Command tab */}
      {activeTab === "command" && (
        <>
          <div style={s.section}>
            <div style={s.heading}>Send a voice command</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder='e.g. "click login" or "scroll down"'
                value={commandText}
                onChange={e => setCommandText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCommand()}
                style={{ flex: 1, padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ced4da', outline: 'none' }}
              />
              <button onClick={sendCommand} style={{
                padding: '8px 14px', fontSize: '13px', fontWeight: 600,
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                backgroundColor: '#333', color: '#fff',
              }}>Go</button>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {["scroll down", "go to google.com", "new tab", "go back"].map(cmd => (
                <button key={cmd} onClick={() => { setCommandText(cmd); }}
                  style={{
                    padding: '3px 8px', fontSize: '11px', border: '1px solid #dee2e6',
                    borderRadius: '12px', cursor: 'pointer', backgroundColor: '#fff', color: '#555'
                  }}>{cmd}</button>
              ))}
            </div>
          </div>

          {lastResult && (
            <div style={{
              ...s.section,
              backgroundColor: '#f0fdf4', borderColor: '#bbf7d0',
              fontSize: '12px', color: '#166534'
            }}>
              {lastResult}
            </div>
          )}

          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
            <button onClick={toggleListening} style={{
              width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600,
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              backgroundColor: listening ? '#ef4444' : '#22c55e',
              color: '#fff',
            }}>
              {listening ? "Stop Listening" : "Start Listening (Mic)"}
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
            Type a command above or click Start Listening to use your microphone.
          </div>
        </>
      )}

      {/* Settings tab */}
      {activeTab === "settings" && (
        <>
          <div style={s.section}>
            <div style={s.heading}>Core</div>
            <div style={s.row}><label style={s.label}>Enable Voice Agent</label><input type="checkbox" checked={config.voice_agent_enabled} onChange={() => toggle('voice_agent_enabled')} /></div>
            <div style={s.row}><label style={s.label}>Microphone</label><input type="checkbox" checked={config.mic_enabled} onChange={() => toggle('mic_enabled')} /></div>
          </div>

          <div style={s.section}>
            <div style={s.heading}>Wake Word</div>
            <div style={s.row}><label style={s.label}>Enable Wake Word</label><input type="checkbox" checked={config.wake_word_enabled} onChange={() => toggle('wake_word_enabled')} /></div>
            <div style={s.row}><label style={s.label}>Phrase</label><input type="text" value={config.wake_word_phrase} onChange={e => setVal('wake_word_phrase', e.target.value)} style={s.input} /></div>
            <div style={s.row}>
              <label style={s.label}>Sensitivity</label>
              <input type="range" min="0.1" max="1.0" step="0.05" value={config.wake_word_sensitivity} onChange={e => setVal('wake_word_sensitivity', parseFloat(e.target.value))} style={{ width: '80px' }} />
              <span style={{ fontSize: '11px', width: '28px', textAlign: 'right' }}>{config.wake_word_sensitivity}</span>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.heading}>Eye Tracking</div>
            <div style={s.row}><label style={s.label}>Enable Eye Tracking</label><input type="checkbox" checked={config.gaze_enabled} onChange={() => toggle('gaze_enabled')} /></div>
          </div>

          <div style={s.section}>
            <div style={s.heading}>Safety</div>
            <div style={s.row}><label style={s.label}>Confirm HIGH risk</label><input type="checkbox" checked={config.require_confirmation_high} onChange={() => toggle('require_confirmation_high')} /></div>
            <div style={s.row}><label style={s.label}>Confirm CRITICAL risk</label><input type="checkbox" checked={config.require_confirmation_critical} onChange={() => toggle('require_confirmation_critical')} /></div>
          </div>

          <div style={s.section}>
            <div style={s.heading}>Accessibility</div>
            <div style={s.row}>
              <label style={s.label}>TTS Mode</label>
              <select value={config.tts_mode} onChange={e => setVal('tts_mode', e.target.value)} style={s.select}>
                <option value="standard">Standard</option>
                <option value="concise">Concise</option>
                <option value="silent">Silent</option>
              </select>
            </div>
            <div style={s.row}>
              <label style={s.label}>Mode</label>
              <select value={config.accessibility_mode} onChange={e => setVal('accessibility_mode', e.target.value)} style={s.select}>
                <option value="standard">Standard</option>
                <option value="low_vision">Low Vision</option>
                <option value="motor_support">Motor Support</option>
                <option value="cognitive_support">Cognitive Support</option>
              </select>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.heading}>Hardware</div>
            <div style={s.row}>
              <label style={s.label}>Backend</label>
              <select value={config.hardware_priority} onChange={e => setVal('hardware_priority', e.target.value)} style={s.select}>
                <option value="auto">Auto</option>
                <option value="npu">NPU</option>
                <option value="gpu">GPU</option>
                <option value="cpu_simd">CPU SIMD</option>
                <option value="cpu">CPU</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
            All processing runs 100% locally on your device.
          </div>
        </>
      )}
    </div>
  );
}

export default App;
