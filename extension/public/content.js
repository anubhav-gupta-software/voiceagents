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

function getAriaRole(el) {
    const explicit = el.getAttribute("role");
    if (explicit) return explicit;

    const tag = el.tagName.toLowerCase();
    const type = (el.getAttribute("type") || "").toLowerCase();

    const roleMap = {
        a: "link",
        button: "button",
        select: "combobox",
        textarea: "textbox",
        input: {
            text: "textbox", search: "textbox", email: "textbox",
            password: "textbox", url: "textbox", tel: "textbox",
            number: "textbox", checkbox: "checkbox", radio: "radio",
            submit: "button", reset: "button", button: "button",
            range: "slider"
        }
    };

    if (tag === "input") {
        return (roleMap.input && roleMap.input[type]) || "textbox";
    }
    return roleMap[tag] || "other";
}

function getActionableNodes() {
    const nodes = [];
    const selectors = [
        'a', 'button', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="textbox"]',
        '[role="combobox"]', '[role="menuitem"]', '[role="tab"]',
        '[role="checkbox"]', '[role="radio"]',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    document.querySelectorAll(selectors).forEach((el, index) => {
        if (!isElementVisible(el)) return;

        const rect = el.getBoundingClientRect();

        let name = el.getAttribute("aria-label")
            || el.getAttribute("alt")
            || el.getAttribute("title")
            || el.innerText
            || el.value
            || el.placeholder
            || "";
        name = name.trim().substring(0, 200).replace(/\n+/g, ' ');

        const role = getAriaRole(el);
        const isInput = (role === "textbox" || role === "combobox" || role === "search");

        nodes.push({
            node_id: `node-${index}`,
            source: "DOM",
            name: name,
            role: role,
            bounds: {
                x: Math.round(rect.x + window.scrollX),
                y: Math.round(rect.y + window.scrollY),
                w: Math.round(rect.width),
                h: Math.round(rect.height)
            },
            is_visible: true,
            is_enabled: !el.disabled,
            action: isInput ? "focus" : "default",
            _element_index: index
        });
    });

    return nodes;
}

function getWorldModel() {
    return {
        url: window.location.href,
        title: document.title,
        nodes: getActionableNodes(),
        focus_node_id: null,
        timestamp_ms: Date.now()
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_WORLD_MODEL") {
        sendResponse(getWorldModel());
    } else if (request.type === "FIND_ELEMENT_BY_NODE_ID") {
        const selectors = [
            'a', 'button', 'input', 'select', 'textarea',
            '[role="button"]', '[role="link"]', '[role="textbox"]',
            '[role="combobox"]', '[role="menuitem"]', '[role="tab"]',
            '[role="checkbox"]', '[role="radio"]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        const allEls = document.querySelectorAll(selectors);
        const idx = parseInt((request.node_id || "").replace("node-", ""), 10);
        if (!isNaN(idx) && idx < allEls.length) {
            sendResponse({ found: true, tag: allEls[idx].tagName });
        } else {
            sendResponse({ found: false });
        }
    }
    return true;
});
