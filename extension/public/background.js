// background.js - Voice Agent Background Service Worker
"use strict";

console.log("Voice Agent Background Service Worker Start");

var NATIVE_HOST = "com.chromium.voice.agent";
var nativePort = null;
var agentState = "IDLE";
var currentConfig = null;
var connectRetries = 0;
var MAX_RETRIES = 3;

var DEFAULT_CONFIG = {
  voice_agent_enabled: true,
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
  mic_enabled: true,
  accessibility_mode: "standard"
};

chrome.runtime.onInstalled.addListener(function() {
  console.log("Extension Installed");
  chrome.storage.local.get(["voice_agent_config"], function(result) {
    if (!result.voice_agent_config) {
      chrome.storage.local.set({ voice_agent_config: DEFAULT_CONFIG });
      currentConfig = DEFAULT_CONFIG;
    } else {
      currentConfig = result.voice_agent_config;
    }
    connectToNativeHost();
  });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get(["voice_agent_config"], function(result) {
    currentConfig = result.voice_agent_config || DEFAULT_CONFIG;
    connectToNativeHost();
  });
});

chrome.storage.local.get(["voice_agent_config"], function(result) {
  currentConfig = result.voice_agent_config || DEFAULT_CONFIG;
});

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.voice_agent_config) {
    currentConfig = changes.voice_agent_config.newValue;
    sendToNative({
      type: "update_config",
      config: {
        gaze: { enabled: currentConfig.gaze_enabled },
        policy: {
          require_confirmation_high: currentConfig.require_confirmation_high,
          require_confirmation_critical: currentConfig.require_confirmation_critical
        }
      }
    });
  }
});

// ── Native Messaging ──

function connectToNativeHost() {
  if (nativePort) return;
  try {
    console.log("Connecting to native host...");
    nativePort = chrome.runtime.connectNative(NATIVE_HOST);
    nativePort.onMessage.addListener(function(msg) {
      console.log("From Native Host:", msg.type);
      connectRetries = 0;
      handleNativeMessage(msg);
    });
    nativePort.onDisconnect.addListener(function() {
      var err = chrome.runtime.lastError;
      console.error("Native Host disconnected:", err ? err.message : "unknown");
      nativePort = null;
      agentState = "DISCONNECTED";
      if (connectRetries < MAX_RETRIES) {
        connectRetries++;
        setTimeout(connectToNativeHost, 2000);
      }
    });
    sendToNative({ type: "ping" });
  } catch (e) {
    console.error("Connect failed:", e);
    nativePort = null;
  }
}

function sendToNative(msg) {
  if (!nativePort) { connectToNativeHost(); return; }
  try { nativePort.postMessage(msg); }
  catch (e) { console.error("Send failed:", e); nativePort = null; }
}

// ── Handle native host responses ──

function handleNativeMessage(msg) {
  if (msg.type === "pong") {
    agentState = msg.state || "IDLE";
    console.log("Native host alive, state:", agentState);
  }
  else if (msg.type === "execute") {
    executeOnActiveTab(msg);
  }
  else if (msg.type === "confirm_required") {
    console.log("Confirmation needed:", msg.message);
  }
  else if (msg.type === "blocked") {
    console.log("Blocked:", msg.reason);
  }
  else if (msg.type === "parse_result" && msg.action === "clarify") {
    console.log("Clarify:", msg.message);
  }
  else if (msg.type === "config_updated") {
    console.log("Config updated on backend");
  }
  else if (msg.type === "audio_started") {
    console.log("Audio pipeline started");
    agentState = "LISTENING";
  }
  else if (msg.type === "audio_stopped") {
    console.log("Audio pipeline stopped");
    agentState = "IDLE";
  }
}

// ── Execute commands ──

function executeOnActiveTab(msg) {
  var command = msg.command;
  var grounding = msg.grounding;
  console.log("Executing:", command.intent, command.slots);

  if (command.intent === "TAB_OP") {
    handleTabOp(command);
    return;
  }

  if (command.intent === "NAVIGATE") {
    var url = command.slots.url;
    if (url) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs[0]) chrome.tabs.update(tabs[0].id, { url: url });
      });
    }
    return;
  }

  if (command.intent === "SYSTEM") {
    console.log("System command:", command.slots.text);
    return;
  }

  if (command.intent === "SCROLL") {
    var dir = command.slots.direction || "down";
    var amt = command.slots.amount || "medium";
    injectAndRun(function(direction, amount) {
      var map = { small: 0.3, medium: 0.7, large: 1.5 };
      var px = window.innerHeight * (map[amount] || 0.7);
      if (direction === "down") window.scrollBy({ top: px, behavior: "smooth" });
      else if (direction === "up") window.scrollBy({ top: -px, behavior: "smooth" });
      else if (direction === "right") window.scrollBy({ left: px, behavior: "smooth" });
      else if (direction === "left") window.scrollBy({ left: -px, behavior: "smooth" });
      return "scrolled " + direction;
    }, [dir, amt]);
    return;
  }

  if (command.intent === "CLICK_TARGET") {
    var targetText = command.slots.target_text || "";
    injectAndRun(function(target) {
      var selectors = "a, button, input[type='submit'], input[type='button'], [role='button'], [role='link'], [role='tab'], [role='menuitem']";
      var best = null;
      var bestScore = 0;
      document.querySelectorAll(selectors).forEach(function(el) {
        var name = (el.getAttribute("aria-label") || el.innerText || el.value || el.title || "").trim().toLowerCase();
        if (!name) return;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        var t = target.toLowerCase();
        var score = 0;
        if (name === t) score = 1.0;
        else if (name.includes(t)) score = 0.7;
        else if (t.includes(name)) score = 0.5;
        if (score > bestScore) { bestScore = score; best = el; }
      });
      if (best) {
        best.scrollIntoView({ behavior: "smooth", block: "center" });
        best.focus();
        best.click();
        return "clicked: " + (best.innerText || best.value || "element").substring(0, 50);
      }
      return "target not found: " + target;
    }, [targetText]);
    return;
  }

  if (command.intent === "TYPE_TEXT") {
    var text = command.slots.text || "";
    var fieldTarget = command.slots.target_text || "";
    injectAndRun(function(textToType, field) {
      var el = null;
      if (field) {
        document.querySelectorAll("input, textarea, [contenteditable]").forEach(function(e) {
          var name = (e.getAttribute("aria-label") || e.getAttribute("placeholder") || e.getAttribute("name") || "").toLowerCase();
          if (name.includes(field.toLowerCase())) el = e;
        });
      }
      if (!el) el = document.activeElement;
      if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable)) {
        el = document.querySelector("input:not([type='hidden']), textarea");
      }
      if (el) {
        el.focus();
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = textToType;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          el.textContent = textToType;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return "typed into: " + (el.getAttribute("name") || el.tagName);
      }
      return "no input field found";
    }, [text, fieldTarget]);
    return;
  }

  if (command.intent === "SELECT_OPTION") {
    var optText = command.slots.text || "";
    var selTarget = command.slots.target_text || "";
    injectAndRun(function(option, target) {
      var sel = null;
      document.querySelectorAll("select").forEach(function(s) {
        var name = (s.getAttribute("aria-label") || s.getAttribute("name") || s.id || "").toLowerCase();
        if (!target || name.includes(target.toLowerCase())) sel = s;
      });
      if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.toLowerCase().includes(option.toLowerCase())) {
            sel.value = sel.options[i].value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            return "selected: " + sel.options[i].text;
          }
        }
        return "option not found";
      }
      return "no select element found";
    }, [optText, selTarget]);
    return;
  }

  console.log("Unhandled intent:", command.intent);
}

function injectAndRun(func, args) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) { console.error("No active tab"); return; }
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: func,
      args: args || []
    }, function(results) {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed:", chrome.runtime.lastError.message);
        return;
      }
      if (results && results[0]) {
        console.log("Result:", results[0].result);
      }
    });
  });
}

// ── Tab operations ──

function handleTabOp(command) {
  var action = (command.slots.text || "").toLowerCase();
  var tabIndex = command.slots.tab_index;
  if (action === "close") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) chrome.tabs.remove(tabs[0].id);
    });
  } else if (action === "new") {
    chrome.tabs.create({});
  } else if (action === "reload") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) chrome.tabs.reload(tabs[0].id);
    });
  } else if (action === "switch" && tabIndex != null) {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      var idx = tabIndex - 1;
      if (idx >= 0 && idx < tabs.length) chrome.tabs.update(tabs[idx].id, { active: true });
    });
  } else if (action === "back") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) chrome.tabs.goBack(tabs[0].id);
    });
  } else if (action === "forward") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) chrome.tabs.goForward(tabs[0].id);
    });
  }
}

// ── Messages from popup / content scripts ──

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "PROCESS_VOICE_COMMAND") {
    sendToNative({
      type: "process_transcript",
      transcript: request.transcript,
      world_model: [],
      gaze: null
    });
    sendResponse({ status: "sent" });
    return false;
  }
  else if (request.type === "GET_AGENT_STATE") {
    sendResponse({ state: agentState, config: currentConfig });
    return false;
  }
  else if (request.type === "START_LISTENING") {
    sendToNative({ type: "start_audio" });
    sendResponse({ status: "ok" });
    return false;
  }
  else if (request.type === "STOP_LISTENING") {
    sendToNative({ type: "stop_audio" });
    sendResponse({ status: "ok" });
    return false;
  }
  return false;
});

setTimeout(connectToNativeHost, 500);
