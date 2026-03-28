// speech.js — Always-on speech recognition content script
(function() {
  // Clean up any previous instance (important after extension reload)
  if (window.__vaCleanup) {
    try { window.__vaCleanup(); } catch (e) {}
  }

  var recognition = null;
  var listening = false;
  var shouldListen = false;
  var restartTimer = null;
  var indicator = null;

  function onMessage(msg, sender, sendResponse) {
    if (msg.type === "START_SPEECH") {
      shouldListen = true;
      startListening();
      sendResponse({ ok: true });
    } else if (msg.type === "STOP_SPEECH") {
      shouldListen = false;
      stopListening();
      sendResponse({ ok: true });
    } else if (msg.type === "SPEECH_PING") {
      sendResponse({ ok: true, listening: listening, shouldListen: shouldListen });
    }
  }

  chrome.runtime.onMessage.addListener(onMessage);

  // Cleanup function for next injection
  window.__vaCleanup = function() {
    chrome.runtime.onMessage.removeListener(onMessage);
    shouldListen = false;
    stopListening();
  };

  function startListening() {
    if (listening) return;
    clearTimeout(restartTimer);

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      trySend({ type: "SPEECH_ERROR", error: "not-supported" });
      return;
    }

    try {
      recognition = new SR();
    } catch (e) {
      scheduleRestart();
      return;
    }

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
      listening = true;
      showIndicator();
      trySend({ type: "SPEECH_STATUS", status: "listening" });
    };

    recognition.onresult = function(e) {
      var last = e.results[e.results.length - 1];
      var transcript = last[0].transcript.trim();
      if (!transcript) return;
      if (last.isFinal) {
        updateIndicator(">> " + transcript);
        trySend({ type: "SPEECH_RESULT", transcript: transcript });
      } else {
        updateIndicator(transcript);
        trySend({ type: "SPEECH_INTERIM", transcript: transcript });
      }
    };

    recognition.onerror = function(e) {
      console.log("Speech error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        trySend({ type: "SPEECH_ERROR", error: e.error });
        shouldListen = false;
        stopListening();
        return;
      }
      // Transient errors — just restart
    };

    recognition.onend = function() {
      listening = false;
      if (shouldListen) {
        scheduleRestart();
      } else {
        hideIndicator();
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.log("Speech start failed:", e);
      scheduleRestart();
    }
  }

  function stopListening() {
    listening = false;
    clearTimeout(restartTimer);
    hideIndicator();
    if (recognition) {
      try { recognition.abort(); } catch (e) {}
      recognition = null;
    }
  }

  function scheduleRestart() {
    if (!shouldListen) return;
    clearTimeout(restartTimer);
    if (recognition) {
      try { recognition.abort(); } catch (e) {}
      recognition = null;
    }
    listening = false;
    restartTimer = setTimeout(function() {
      if (shouldListen) startListening();
    }, 500);
  }

  function trySend(msg) {
    try {
      chrome.runtime.sendMessage(msg, function() {
        if (chrome.runtime.lastError) {} // popup might be closed, that's fine
      });
    } catch (e) {}
  }

  function showIndicator() {
    hideIndicator();
    indicator = document.createElement("div");
    indicator.id = "__va-mic";
    indicator.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg><span>Listening</span>';
    indicator.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483647;background:rgba(108,92,231,0.92);color:#fff;padding:6px 14px;border-radius:20px;font:12px/1.4 -apple-system,sans-serif;display:flex;align-items:center;gap:6px;box-shadow:0 2px 12px rgba(0,0,0,0.3);backdrop-filter:blur(8px);cursor:pointer;user-select:none;";
    indicator.addEventListener("click", function() {
      shouldListen = false;
      stopListening();
      trySend({ type: "SPEECH_STATUS", status: "stopped" });
      try { chrome.runtime.sendMessage({ type: "USER_STOPPED_SPEECH" }); } catch (e) {}
    });
    if (!document.getElementById("__va-style")) {
      var style = document.createElement("style");
      style.id = "__va-style";
      style.textContent = "@keyframes __va-breathe{0%,100%{opacity:0.92}50%{opacity:0.65}}#__va-mic{animation:__va-breathe 2s ease infinite}";
      document.head.appendChild(style);
    }
    document.body.appendChild(indicator);
  }

  function updateIndicator(text) {
    if (!indicator) return;
    var span = indicator.querySelector("span");
    if (span) span.textContent = text.length > 35 ? text.substring(0, 35) + "..." : text;
  }

  function hideIndicator() {
    var el = document.getElementById("__va-mic");
    if (el) el.remove();
    indicator = null;
  }
})();
