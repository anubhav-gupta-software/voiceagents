// background.js
console.log("Voice Agent Background Service Worker Start");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
  
  // Set default config
  chrome.storage.local.get(['voice_agent_config'], (result) => {
    if (!result.voice_agent_config) {
      chrome.storage.local.set({
        voice_agent_config: {
          voice_agent_enabled: true,
          wake_word_enabled: true,
          gaze_enabled: false,
          hardware_priority: 'auto'
        }
      });
    }
  });
});

let nativePort = null;

function connectToNativeHost() {
  nativePort = chrome.runtime.connectNative('com.chromium.voice.agent');
  
  nativePort.onMessage.addListener((msg) => {
    console.log("Received from Python:", msg);
    // Forward message to active tabs or handle internally
  });

  nativePort.onDisconnect.addListener(() => {
    console.error("Disconnected from Native Messaging Host", chrome.runtime.lastError);
    // Optionally implement retry logic
    nativePort = null;
  });
}

connectToNativeHost();
