import { useState, useEffect } from 'react';
import './App.css';

// Declare chrome type for local development (without `@types/chrome`)
declare var chrome: any;

function App() {
  const [config, setConfig] = useState({
    voice_agent_enabled: true,
    wake_word_enabled: true,
    gaze_enabled: false,
    hardware_priority: 'auto'
  });

  useEffect(() => {
    // Load state from chrome.storage if available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['voice_agent_config'], (result: any) => {
        if (result.voice_agent_config) {
          setConfig(result.voice_agent_config);
        }
      });
    }
  }, []);

  const handleToggle = (key: string) => {
    const newConfig = { ...config, [key]: !(config as any)[key] };
    setConfig(newConfig);
    
    // Save state back to chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ voice_agent_config: newConfig });
    }
  };

  const handleChange = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    // Save state back to chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ voice_agent_config: newConfig });
    }
  };

  return (
    <div className="container" style={{ padding: '20px', width: '300px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Voice Agent Settings</h2>
      
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <label>Enable Voice Agent</label>
        <input 
          type="checkbox" 
          checked={config.voice_agent_enabled} 
          onChange={() => handleToggle('voice_agent_enabled')} 
        />
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <label>Enable Wake-Word</label>
        <input 
          type="checkbox" 
          checked={config.wake_word_enabled} 
          onChange={() => handleToggle('wake_word_enabled')} 
        />
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <label>Enable Eye Tracking</label>
        <input 
          type="checkbox" 
          checked={config.gaze_enabled} 
          onChange={() => handleToggle('gaze_enabled')} 
        />
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '5px' }}>Hardware Backend</label>
        <select 
          value={config.hardware_priority}
          onChange={(e) => handleChange('hardware_priority', e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="auto">Auto (Performance)</option>
          <option value="npu">NPU/Neural Engine</option>
          <option value="gpu">GPU (CUDA/Metal)</option>
          <option value="cpu_simd">CPU SIMD</option>
        </select>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
        All processing remains 100% local.
      </div>
    </div>
  );
}

export default App;
