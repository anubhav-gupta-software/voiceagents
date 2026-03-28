// content.js - WP-05 World Model & UI Indexing

function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function getActionableNodes() {
    const nodes = [];
    const selectors = 'a, button, input, select, textarea, [role="button"], [role="link"], [role="textbox"], [role="checkbox"], [tabindex]:not([tabindex="-1"])';
    
    document.querySelectorAll(selectors).forEach((el, index) => {
        if (!isElementVisible(el)) return;
        
        const rect = el.getBoundingClientRect();
        
        // Extract semantic name
        let name = el.innerText || el.value || el.placeholder || el.getAttribute("aria-label") || el.getAttribute("alt") || "";
        name = name.trim().replace(/\n/g, ' ');

        let role = el.tagName.toLowerCase();
        if (el.getAttribute("role")) {
            role = el.getAttribute("role");
        } else if (role === "input") {
            role = el.type || "textbox";
        }

        nodes.append({
            node_id: `node-${index}-${Date.now()}`,
            source: "DOM",
            name: name,
            role: role,
            bounds: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                w: Math.round(rect.width),
                h: Math.round(rect.height)
            },
            is_visible: true,
            is_enabled: !el.disabled,
            action: (role === "textbox" || role === "search") ? "focus" : "click",
            score_hints: {
                tagName: el.tagName
            }
        });
    });
    
    return nodes;
}

// Listen for requests from background worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_WORLD_MODEL") {
        const actionableNodes = getActionableNodes();
        sendResponse({ nodes: actionableNodes, url: window.location.href });
    }
});
