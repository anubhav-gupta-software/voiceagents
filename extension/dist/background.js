// background.js — Voice Agent Service Worker
// Always-on listening, NLU parsing, command execution.
"use strict";

var listenMode = true;
chrome.storage.local.get(["va_listen_mode"], function(r) {
  listenMode = r.va_listen_mode !== false;
});

// ── Ordinal helpers ──

var ORDINALS = {
  "first": 1, "1st": 1, "one": 1,
  "second": 2, "2nd": 2, "two": 2,
  "third": 3, "3rd": 3, "three": 3,
  "fourth": 4, "4th": 4, "four": 4,
  "fifth": 5, "5th": 5, "five": 5,
  "sixth": 6, "6th": 6, "six": 6,
  "seventh": 7, "7th": 7, "seven": 7,
  "eighth": 8, "8th": 8, "eight": 8,
  "ninth": 9, "9th": 9, "nine": 9,
  "tenth": 10, "10th": 10, "ten": 10,
  "last": -1
};

function parseOrdinal(word) {
  return ORDINALS[word] || null;
}

// ── NLU Parser ──

function parseCommand(text) {
  var t = text.trim().toLowerCase().replace(/[.,!?]+$/, "");

  if (/^(go\s+to\s+)?(the\s+)?top(\s+of\s+(the\s+)?page)?$/.test(t)) return { intent: "SCROLL", slots: { direction: "top", amount: "max" } };
  if (/^(go\s+to\s+)?(the\s+)?bottom(\s+of\s+(the\s+)?page)?$/.test(t)) return { intent: "SCROLL", slots: { direction: "bottom", amount: "max" } };
  var scrollMatch = t.match(/^scroll\s+(up|down|left|right)(?:\s+(a lot|a little|a bit))?$/);
  if (scrollMatch) {
    var rawAmt = scrollMatch[2] || "";
    var amount = "medium";
    if (rawAmt.includes("lot")) amount = "large";
    else if (rawAmt.includes("little") || rawAmt.includes("bit")) amount = "small";
    return { intent: "SCROLL", slots: { direction: scrollMatch[1], amount: amount } };
  }
  if (t === "page down" || t === "scroll down") return { intent: "SCROLL", slots: { direction: "down", amount: "large" } };
  if (t === "page up" || t === "scroll up") return { intent: "SCROLL", slots: { direction: "up", amount: "large" } };

  if (/^(play|resume)(\s+video)?$/.test(t)) return { intent: "MEDIA", slots: { action: "play" } };
  if (/^pause(\s+video)?$/.test(t)) return { intent: "MEDIA", slots: { action: "pause" } };
  if (/^(play|pause|toggle)$/.test(t)) return { intent: "MEDIA", slots: { action: "toggle" } };
  if (/^mute$/.test(t)) return { intent: "MEDIA", slots: { action: "mute" } };
  if (/^unmute$/.test(t)) return { intent: "MEDIA", slots: { action: "unmute" } };
  if (/^(full\s*screen|enter\s+full\s*screen|go\s+full\s*screen)$/.test(t)) return { intent: "MEDIA", slots: { action: "fullscreen" } };
  if (/^(exit\s+full\s*screen|leave\s+full\s*screen)$/.test(t)) return { intent: "MEDIA", slots: { action: "exit_fullscreen" } };
  if (/^(next\s+video|skip(\s+video)?)$/.test(t)) return { intent: "MEDIA", slots: { action: "next" } };
  if (/^(previous\s+video|prev\s+video)$/.test(t)) return { intent: "MEDIA", slots: { action: "previous" } };
  var skipMatch = t.match(/^(?:skip|fast\s+forward)\s+(\d+)\s*(?:seconds?|s)?(?:\s+ahead)?$/);
  if (skipMatch) return { intent: "MEDIA", slots: { action: "skip", seconds: parseInt(skipMatch[1]) } };
  var rewindMatch = t.match(/^(?:rewind|go\s+back)\s+(\d+)\s*(?:seconds?|s)?$/);
  if (rewindMatch) return { intent: "MEDIA", slots: { action: "rewind", seconds: parseInt(rewindMatch[1]) } };
  if (/^(like|like\s+this\s+video|thumbs\s+up)$/.test(t)) return { intent: "MEDIA", slots: { action: "like" } };
  if (/^(dislike|thumbs\s+down)$/.test(t)) return { intent: "MEDIA", slots: { action: "dislike" } };
  if (/^subscribe$/.test(t)) return { intent: "MEDIA", slots: { action: "subscribe" } };

  var ordinalMatch = t.match(/^(?:watch|play|open|click|view|select|pick|choose|go\s+to)\s+(?:the\s+)?(\w+)\s+(video|product|result|link|item|article|image|song|post|story|option|channel|playlist|movie|show)s?$/);
  if (ordinalMatch) {
    var idx = parseOrdinal(ordinalMatch[1]);
    if (idx) return { intent: "PICK_NTH", slots: { index: idx, item_type: ordinalMatch[2] } };
  }
  var shortOrdinal = t.match(/^(?:the\s+)?(\w+)\s+(video|product|result|link|item|article|image|song|post|option|channel)s?$/);
  if (shortOrdinal) {
    var idx2 = parseOrdinal(shortOrdinal[1]);
    if (idx2) return { intent: "PICK_NTH", slots: { index: idx2, item_type: shortOrdinal[2] } };
  }
  var numMatch = t.match(/^(?:(?:result|option|item|product|video|link|number)\s+)?(?:number\s+)?(\d+)$/);
  if (numMatch && parseInt(numMatch[1]) <= 20) {
    return { intent: "PICK_NTH", slots: { index: parseInt(numMatch[1]), item_type: "auto" } };
  }

  if (/^(open\s+)?(a\s+)?new\s+tab$/.test(t)) return { intent: "TAB_OP", slots: { action: "new" } };
  if (/^close(\s+this)?\s+tab$/.test(t)) return { intent: "TAB_OP", slots: { action: "close" } };
  if (/^reload(\s+(this\s+)?(tab|page))?$/.test(t) || t === "refresh") return { intent: "TAB_OP", slots: { action: "reload" } };
  if (/^go\s+back$/.test(t) || t === "back") return { intent: "TAB_OP", slots: { action: "back" } };
  if (/^go\s+forward$/.test(t) || t === "forward") return { intent: "TAB_OP", slots: { action: "forward" } };
  if (/^reopen\s+tab$/.test(t) || t === "undo close") return { intent: "TAB_OP", slots: { action: "reopen" } };
  var switchMatch2 = t.match(/^(?:switch\s+to\s+tab|tab)\s+(\d+)$/);
  if (switchMatch2) return { intent: "TAB_OP", slots: { action: "switch", tab_index: parseInt(switchMatch2[1]) } };

  var goToMatch = t.match(/^(?:go\s+to|open|navigate\s+to|visit)\s+(.+)$/);
  if (goToMatch) {
    var dest = goToMatch[1].trim();
    var goOrd = dest.match(/^(?:the\s+)?(\w+)\s+(video|product|result|link|item|article|image|song|post|option|channel)s?$/);
    if (goOrd) {
      var gi = parseOrdinal(goOrd[1]);
      if (gi) return { intent: "PICK_NTH", slots: { index: gi, item_type: goOrd[2] } };
    }
    var url = dest;
    if (!/^https?:\/\//.test(url)) {
      if (/\.\w{2,}/.test(url)) url = "https://" + url;
      else url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
    return { intent: "NAVIGATE", slots: { url: url } };
  }

  if (/^next\s+page$/.test(t)) return { intent: "PAGE_NAV", slots: { direction: "next" } };
  if (/^(?:previous|prev)\s+page$/.test(t)) return { intent: "PAGE_NAV", slots: { direction: "prev" } };

  if (/^add\s+to\s+cart$/.test(t)) return { intent: "CLICK_TARGET", slots: { target_text: "add to cart" } };
  if (/^(buy\s+now|checkout|check\s+out)$/.test(t)) return { intent: "CLICK_TARGET", slots: { target_text: t.replace(/\s+/g, " ") } };
  if (/^(add\s+to\s+wishlist|save\s+for\s+later|save\s+item)$/.test(t)) return { intent: "CLICK_TARGET", slots: { target_text: t } };

  var searchMatch = t.match(/^(?:search|search\s+for|look\s+up|find)\s+(.+)$/);
  if (searchMatch) {
    var query = searchMatch[1].trim();
    var onPageMatch = query.match(/^(.+?)\s+on\s+(?:this\s+)?page$/);
    if (onPageMatch) return { intent: "FIND_ON_PAGE", slots: { text: onPageMatch[1] } };
    return { intent: "SEARCH", slots: { query: query } };
  }
  var googleMatch = t.match(/^google\s+(.+)$/);
  if (googleMatch) return { intent: "NAVIGATE", slots: { url: "https://www.google.com/search?q=" + encodeURIComponent(googleMatch[1].trim()) } };

  var clickMatch = t.match(/^(?:click|tap|press|hit)\s+(?:on\s+)?(?:the\s+)?(.+)$/);
  if (clickMatch) return { intent: "CLICK_TARGET", slots: { target_text: clickMatch[1].trim() } };

  var typeMatch = t.match(/^(?:type|enter|input|write)\s+"?([^"]+)"?(?:\s+(?:in|into|on)\s+(.+))?$/);
  if (typeMatch) return { intent: "TYPE_TEXT", slots: { text: typeMatch[1].trim(), field: (typeMatch[2] || "").trim() } };

  if (/^submit(\s+form)?$/.test(t)) return { intent: "FORM", slots: { action: "submit" } };
  if (/^(clear|reset)(\s+form)?$/.test(t)) return { intent: "FORM", slots: { action: "clear" } };
  if (/^(next\s+field|tab\s+next)$/.test(t)) return { intent: "FORM", slots: { action: "next_field" } };

  var selectMatch = t.match(/^select\s+"?([^"]+)"?(?:\s+(?:from|in)\s+(.+))?$/);
  if (selectMatch) return { intent: "SELECT_OPTION", slots: { option: selectMatch[1].trim(), target: (selectMatch[2] || "").trim() } };

  if (/^zoom\s+in$/.test(t)) return { intent: "ZOOM", slots: { direction: "in" } };
  if (/^zoom\s+out$/.test(t)) return { intent: "ZOOM", slots: { direction: "out" } };
  if (/^(?:reset\s+zoom|zoom\s+reset|normal\s+zoom)$/.test(t)) return { intent: "ZOOM", slots: { direction: "reset" } };

  if (t === "stop" || t === "cancel" || t === "never mind" || t === "stop listening") return { intent: "SYSTEM", slots: { action: "cancel" } };

  return { intent: "SEARCH", slots: { query: t } };
}

// ── Command Executor ──

function execute(command) {
  var intent = command.intent;
  var slots = command.slots;
  console.log("Executing:", intent, slots);

  if (intent === "TAB_OP") { handleTabOp(slots); return; }

  if (intent === "NAVIGATE") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) chrome.tabs.update(tabs[0].id, { url: slots.url });
    });
    return;
  }

  if (intent === "SEARCH") {
    inject(function(query) {
      var selectors = [
        'input[type="search"]', 'input[name="search_query"]', 'input[name="q"]',
        'input[name="search"]', 'input[aria-label*="earch"]', 'input[placeholder*="earch"]',
        'input[title*="earch"]', 'textarea[name="q"]'
      ];
      var input = null;
      for (var i = 0; i < selectors.length; i++) {
        input = document.querySelector(selectors[i]);
        if (input) break;
      }
      if (input) {
        input.focus();
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        var form = input.closest("form");
        if (form) { form.requestSubmit ? form.requestSubmit() : form.submit(); }
        else { input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true })); }
        return { ok: true };
      }
      return { ok: false };
    }, [slots.query], function(result) {
      if (!result || !result.ok) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0]) chrome.tabs.update(tabs[0].id, { url: "https://www.google.com/search?q=" + encodeURIComponent(slots.query) });
        });
      }
    });
    return;
  }

  if (intent === "SCROLL") {
    if (slots.direction === "top") {
      inject(function() { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
    } else if (slots.direction === "bottom") {
      inject(function() { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }, []);
    } else {
      inject(function(dir, amt) {
        var sizes = { small: 0.25, medium: 0.6, large: 1.2 };
        var px = window.innerHeight * (sizes[amt] || 0.6);
        var opts = { behavior: "smooth" };
        if (dir === "down") opts.top = px;
        else if (dir === "up") opts.top = -px;
        else if (dir === "right") opts.left = px;
        else if (dir === "left") opts.left = -px;
        window.scrollBy(opts);
      }, [slots.direction, slots.amount]);
    }
    return;
  }

  if (intent === "PICK_NTH") {
    inject(function(index, itemType) {
      var host = location.hostname;
      var items = [];
      if (host.includes("youtube.com")) {
        if (itemType === "video" || itemType === "auto") items = document.querySelectorAll("ytd-video-renderer a#video-title, ytd-rich-item-renderer a#video-title-link, ytd-compact-video-renderer a.yt-simple-endpoint, ytd-playlist-video-renderer a#video-title");
        else if (itemType === "channel") items = document.querySelectorAll("ytd-channel-renderer a.channel-link, #channel-name a");
      }
      else if (host.includes("amazon.")) {
        if (itemType === "product" || itemType === "auto" || itemType === "item") items = document.querySelectorAll(".s-result-item:not(.AdHolder) h2 a, .s-card-container h2 a, [data-component-type='s-search-result'] h2 a");
      }
      else if (host.includes("google.com")) {
        if (itemType === "result" || itemType === "auto" || itemType === "link") {
          items = document.querySelectorAll("#search .g a h3, #rso .g a h3");
          var links = [];
          items.forEach(function(h3) { if (h3.closest("a")) links.push(h3.closest("a")); });
          items = links;
        }
      }
      else if (host.includes("reddit.com")) {
        if (itemType === "post" || itemType === "auto") items = document.querySelectorAll("a[data-click-id='body'], shreddit-post a[slot='full-post-link'], article h3 a");
      }
      if (!items || items.length === 0) {
        if (itemType === "video") items = document.querySelectorAll("a[href*='watch'], a[href*='video']");
        else if (itemType === "product" || itemType === "item") items = document.querySelectorAll(".product a, [class*='product'] a, article a");
        else if (itemType === "result" || itemType === "link") items = document.querySelectorAll("main a[href]:not([href='#']):not([role='button'])");
        else if (itemType === "image") items = document.querySelectorAll("main img[src], article img[src]");
        else if (itemType === "article" || itemType === "post") items = document.querySelectorAll("article a, h2 a, h3 a");
        else items = document.querySelectorAll("main a[href]:not([href='#']):not([aria-hidden]), article a, .card a, li > a, h2 a, h3 a");
      }
      var visible = [];
      items.forEach(function(el) { var r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) visible.push(el); });
      var seen = {}, unique = [];
      visible.forEach(function(el) { var k = el.href || el.src || el.innerText; if (k && !seen[k]) { seen[k] = true; unique.push(el); } });
      var target = index === -1 ? unique[unique.length - 1] : unique[index - 1];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        var orig = target.style.outline;
        target.style.outline = "3px solid #6c5ce7";
        setTimeout(function() { target.style.outline = orig; target.click(); }, 400);
        return { ok: true, text: (target.innerText || target.alt || "").substring(0, 80), total: unique.length };
      }
      return { ok: false, total: unique.length };
    }, [slots.index, slots.item_type], function(result) {
      if (result && !result.ok) speak("Could not find item number " + slots.index);
    });
    return;
  }

  if (intent === "MEDIA") {
    inject(function(action, seconds) {
      var host = location.hostname;
      var video = document.querySelector("video");
      if (host.includes("youtube.com")) {
        if (action === "like") { var b = document.querySelector("like-button-view-model button, #segmented-like-button button"); if (b) { b.click(); return { ok: true }; } }
        if (action === "dislike") { var b2 = document.querySelector("dislike-button-view-model button, #segmented-dislike-button button"); if (b2) { b2.click(); return { ok: true }; } }
        if (action === "subscribe") { var b3 = document.querySelector("#subscribe-button button, ytd-subscribe-button-renderer button"); if (b3) { b3.click(); return { ok: true }; } }
        if (action === "next") { var b4 = document.querySelector(".ytp-next-button"); if (b4) { b4.click(); return { ok: true }; } }
        if (action === "previous") { var b5 = document.querySelector(".ytp-prev-button"); if (b5) { b5.click(); return { ok: true }; } }
      }
      if (!video) video = document.querySelector("audio");
      if (video) {
        if (action === "play") { video.play(); return { ok: true }; }
        if (action === "pause") { video.pause(); return { ok: true }; }
        if (action === "toggle") { video.paused ? video.play() : video.pause(); return { ok: true }; }
        if (action === "mute") { video.muted = true; return { ok: true }; }
        if (action === "unmute") { video.muted = false; return { ok: true }; }
        if (action === "fullscreen") { (video.requestFullscreen || video.webkitRequestFullscreen).call(video); return { ok: true }; }
        if (action === "exit_fullscreen") { document.exitFullscreen && document.exitFullscreen(); return { ok: true }; }
        if (action === "skip") { video.currentTime = Math.min(video.duration, video.currentTime + (seconds || 10)); return { ok: true }; }
        if (action === "rewind") { video.currentTime = Math.max(0, video.currentTime - (seconds || 10)); return { ok: true }; }
      }
      var playBtn = document.querySelector("[aria-label*='Play' i], .play-button");
      if (playBtn && (action === "play" || action === "toggle")) { playBtn.click(); return { ok: true }; }
      var pauseBtn = document.querySelector("[aria-label*='Pause' i], .pause-button");
      if (pauseBtn && (action === "pause" || action === "toggle")) { pauseBtn.click(); return { ok: true }; }
      return { ok: false };
    }, [slots.action, slots.seconds || 0], function(result) {
      if (result && !result.ok) speak("No media found");
    });
    return;
  }

  if (intent === "PAGE_NAV") {
    inject(function(direction) {
      var selectors = direction === "next"
        ? ["a[aria-label*='Next' i]", "a.next", ".next a", "[class*='next'] a", "a[rel='next']", "#pnnext"]
        : ["a[aria-label*='Prev' i]", "a.prev", ".prev a", "[class*='prev'] a", "a[rel='prev']", "#pnprev"];
      for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        if (el) { el.click(); return { ok: true }; }
      }
      return { ok: false };
    }, [slots.direction], function(result) {
      if (result && !result.ok) speak("Could not find " + slots.direction + " page button");
    });
    return;
  }

  if (intent === "FORM") {
    inject(function(action) {
      if (action === "submit") {
        var form = document.activeElement && document.activeElement.closest("form") || document.querySelector("form");
        if (form) { form.requestSubmit ? form.requestSubmit() : form.submit(); return { ok: true }; }
      }
      if (action === "clear") { var f = document.querySelector("form"); if (f) { f.reset(); return { ok: true }; } }
      if (action === "next_field") {
        var inputs = Array.from(document.querySelectorAll("input:not([type='hidden']), textarea, select"));
        var idx = inputs.indexOf(document.activeElement);
        if (idx >= 0 && idx < inputs.length - 1) { inputs[idx + 1].focus(); return { ok: true }; }
        else if (inputs.length) { inputs[0].focus(); return { ok: true }; }
      }
      return { ok: false };
    }, [slots.action]);
    return;
  }

  if (intent === "CLICK_TARGET") {
    inject(function(target) {
      var selectors = "a, button, input[type='submit'], input[type='button'], select, [role='button'], [role='link'], [role='tab'], [role='menuitem'], [onclick], span[class*='button'], div[class*='button']";
      var best = null, bestScore = 0;
      document.querySelectorAll(selectors).forEach(function(el) {
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        var name = (el.getAttribute("aria-label") || el.innerText || el.value || el.title || el.alt || "").trim().toLowerCase();
        if (!name) return;
        var t = target.toLowerCase();
        var score = 0;
        if (name === t) score = 1.0;
        else if (name.startsWith(t)) score = 0.85;
        else if (name.includes(t)) score = 0.7;
        else if (t.includes(name)) score = 0.5;
        if (score > bestScore) { bestScore = score; best = el; }
      });
      if (best) {
        best.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(function() { best.focus(); best.click(); }, 300);
        return { ok: true, clicked: (best.innerText || best.value || "").substring(0, 60) };
      }
      return { ok: false };
    }, [slots.target_text], function(result) {
      if (result && !result.ok) speak("Could not find " + slots.target_text);
    });
    return;
  }

  if (intent === "TYPE_TEXT") {
    inject(function(text, field) {
      var el = null;
      if (field) {
        document.querySelectorAll("input, textarea, [contenteditable='true']").forEach(function(e) {
          var label = (e.getAttribute("aria-label") || e.getAttribute("placeholder") || e.getAttribute("name") || e.id || "").toLowerCase();
          if (label.includes(field.toLowerCase())) el = e;
        });
      }
      if (!el) el = document.activeElement;
      if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable)) {
        el = document.querySelector("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea");
      }
      if (el) {
        el.focus();
        if (el.isContentEditable) { el.textContent = text; } else { el.value = text; }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true };
      }
      return { ok: false };
    }, [slots.text, slots.field || ""], function(result) {
      if (result && !result.ok) speak("No input field found");
    });
    return;
  }

  if (intent === "SELECT_OPTION") {
    inject(function(option, target) {
      var sel = null;
      document.querySelectorAll("select").forEach(function(s) {
        if (!target) { sel = s; return; }
        var label = (s.getAttribute("aria-label") || s.getAttribute("name") || s.id || "").toLowerCase();
        if (label.includes(target.toLowerCase())) sel = s;
      });
      if (!sel) sel = document.querySelector("select");
      if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.toLowerCase().includes(option.toLowerCase())) {
            sel.selectedIndex = i; sel.dispatchEvent(new Event("change", { bubbles: true })); return { ok: true };
          }
        }
      }
      return { ok: false };
    }, [slots.option, slots.target || ""], function(result) {
      if (result && !result.ok) speak("Could not find that option");
    });
    return;
  }

  if (intent === "ZOOM") {
    inject(function(dir) {
      var current = parseFloat(document.documentElement.style.zoom || "1");
      if (dir === "in") document.documentElement.style.zoom = (current + 0.1).toFixed(1);
      else if (dir === "out") document.documentElement.style.zoom = Math.max(0.3, current - 0.1).toFixed(1);
      else document.documentElement.style.zoom = "1";
    }, [slots.direction]);
    return;
  }

  if (intent === "FIND_ON_PAGE") {
    inject(function(searchText) { window.find(searchText, false, false, true); }, [slots.text]);
    return;
  }

  if (intent === "SYSTEM") {
    setListenMode(false);
    return;
  }
}

function handleTabOp(slots) {
  var action = slots.action;
  if (action === "new") { chrome.tabs.create({}); }
  else if (action === "close") { chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { if (tabs[0]) chrome.tabs.remove(tabs[0].id); }); }
  else if (action === "reload") { chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { if (tabs[0]) chrome.tabs.reload(tabs[0].id); }); }
  else if (action === "back") { chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { if (tabs[0]) chrome.tabs.goBack(tabs[0].id); }); }
  else if (action === "forward") { chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { if (tabs[0]) chrome.tabs.goForward(tabs[0].id); }); }
  else if (action === "reopen") { chrome.sessions.restore(); }
  else if (action === "switch" && slots.tab_index) {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      var idx = slots.tab_index - 1;
      if (idx >= 0 && idx < tabs.length) chrome.tabs.update(tabs[idx].id, { active: true });
    });
  }
}

// ── Helpers ──

function inject(func, args, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: func, args: args || [] }, function(results) {
      if (chrome.runtime.lastError) { console.warn("Inject failed:", chrome.runtime.lastError.message); return; }
      if (callback && results && results[0]) callback(results[0].result);
    });
  });
}

function speak(text) {
  try { chrome.tts.speak(text, { rate: 1.1 }); } catch (e) {}
}

function safeBroadcast(msg) {
  try { chrome.runtime.sendMessage(msg, function() { if (chrome.runtime.lastError) {} }); } catch (e) {}
}

function setListenMode(on) {
  listenMode = on;
  chrome.storage.local.set({ va_listen_mode: on });
  if (on) { activateOnCurrentTab(); }
  else {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_SPEECH" }, function() { if (chrome.runtime.lastError) {} });
    });
  }
}

function isValidTab(tab) {
  if (!tab || !tab.url) return false;
  return !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://") && !tab.url.startsWith("about:") && !tab.url.startsWith("edge://");
}

function activateOnCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0] || !isValidTab(tabs[0])) return;
    startSpeechOnTab(tabs[0].id);
  });
}

function startSpeechOnTab(tabId) {
  chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["speech.js"] }, function() {
    if (chrome.runtime.lastError) return;
    setTimeout(function() {
      chrome.tabs.sendMessage(tabId, { type: "START_SPEECH" }, function(resp) {
        if (chrome.runtime.lastError) {
          setTimeout(function() {
            chrome.tabs.sendMessage(tabId, { type: "START_SPEECH" }, function() { if (chrome.runtime.lastError) {} });
          }, 500);
        }
      });
    }, 300);
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (!listenMode || changeInfo.status !== "complete" || !isValidTab(tab)) return;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs[0] && tabs[0].id === tabId) startSpeechOnTab(tabId);
  });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  if (!listenMode) return;
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (chrome.runtime.lastError || !isValidTab(tab)) return;
    if (tab.status === "complete") startSpeechOnTab(tab.id);
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get(["va_listen_mode"], function(r) {
    listenMode = r.va_listen_mode !== false;
    if (listenMode) setTimeout(activateOnCurrentTab, 1000);
  });
});
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get(["va_listen_mode"], function(r) {
    listenMode = r.va_listen_mode !== false;
    if (listenMode) setTimeout(activateOnCurrentTab, 1000);
  });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.type === "EXECUTE_COMMAND") {
    var parsed = parseCommand(msg.text);
    execute(parsed);
    sendResponse({ parsed: parsed });
  }
  else if (msg.type === "TOGGLE_LISTEN") {
    setListenMode(!listenMode);
    sendResponse({ listening: listenMode });
  }
  else if (msg.type === "GET_LISTEN_MODE") {
    sendResponse({ listening: listenMode });
  }
  else if (msg.type === "SPEECH_RESULT") {
    console.log("Voice:", msg.transcript);
    var parsed2 = parseCommand(msg.transcript);
    execute(parsed2);
    safeBroadcast({ type: "COMMAND_EXECUTED", transcript: msg.transcript, parsed: parsed2 });
  }
  else if (msg.type === "USER_STOPPED_SPEECH") {
    setListenMode(false);
    safeBroadcast({ type: "LISTEN_MODE_CHANGED", listening: false });
  }
  else if (msg.type === "SPEECH_INTERIM" || msg.type === "SPEECH_STATUS" || msg.type === "SPEECH_ERROR") {
    safeBroadcast(msg);
  }
  return false;
});

setTimeout(function() {
  chrome.storage.local.get(["va_listen_mode"], function(r) {
    listenMode = r.va_listen_mode !== false;
    if (listenMode) activateOnCurrentTab();
  });
}, 500);
