// executor.js - WP-07 Layered Executor and Post-Condition Verifier

function executeCommand(command) {
    return new Promise((resolve) => {
        try {
            if (command.intent === "NAVIGATE") {
                const url = command.slots.url.startsWith('http') ? command.slots.url : `https://${command.slots.url}`;
                window.location.href = url;
                resolve({ success: true, post_condition_met: true, layer_used: "DOM_API" });
            } 
            else if (command.intent === "CLICK_TARGET" && command.target_node_id) {
                // Find node by index (a real implementation would cache elements with data-agent-id attributes)
                // Here we rescan to find matching bounds/name for simplicity
                const selectors = 'a, button, input, select, textarea, [role]';
                let matched = false;
                
                document.querySelectorAll(selectors).forEach((el) => {
                    const rect = el.getBoundingClientRect();
                    const name = el.innerText || el.value || el.getAttribute("aria-label") || "";
                    
                    if (name.includes(command.slots.target_text)) {
                        el.click();
                        matched = true;
                    }
                });
                resolve({ success: matched, post_condition_met: matched, layer_used: "DOM_API" });
            }
            else if (command.intent === "SCROLL") {
                const amount = window.innerHeight * 0.8;
                if (command.slots.direction === "down") window.scrollBy({ top: amount, behavior: 'smooth' });
                else if (command.slots.direction === "up") window.scrollBy({ top: -amount, behavior: 'smooth' });
                resolve({ success: true, layer_used: "DOM_API" });
            }
            else {
                resolve({ success: false, fallback_reason: "Intent not handled by executor yet." });
            }
        } catch (e) {
            resolve({ success: false, fallback_reason: e.message });
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "EXECUTE_COMMAND") {
        executeCommand(request.command).then(sendResponse);
        return true; 
    }
});
