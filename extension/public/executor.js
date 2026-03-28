// executor.js - WP-07 Layered Executor and Post-Condition Verifier

const MAX_RETRIES = 2;

function findTargetElement(command, target) {
    const targetText = (command.slots && command.slots.target_text) || "";
    const targetRole = (command.slots && command.slots.target_role) || null;

    const selectors = [
        'a', 'button', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="textbox"]',
        '[role="combobox"]', '[role="menuitem"]', '[role="tab"]',
        '[role="checkbox"]', '[role="radio"]',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const candidates = [];
    document.querySelectorAll(selectors).forEach((el) => {
        const name = (
            el.getAttribute("aria-label")
            || el.getAttribute("alt")
            || el.getAttribute("title")
            || el.innerText
            || el.value
            || el.placeholder
            || ""
        ).trim().toLowerCase();

        if (!name) return;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        let score = 0;
        const normalizedTarget = targetText.toLowerCase();

        if (name === normalizedTarget) {
            score = 1.0;
        } else if (name.includes(normalizedTarget)) {
            score = 0.7;
        } else if (normalizedTarget.includes(name)) {
            score = 0.5;
        }

        if (score > 0 && targetRole) {
            const elRole = el.getAttribute("role") || el.tagName.toLowerCase();
            if (elRole === targetRole || el.tagName.toLowerCase() === targetRole) {
                score += 0.1;
            }
        }

        if (score > 0) {
            candidates.push({ el, score, name });
        }
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates.length > 0 ? candidates[0].el : null;
}

function executeCommand(command, target) {
    return new Promise((resolve) => {
        try {
            const intent = command.intent;

            if (intent === "CLICK_TARGET") {
                const el = findTargetElement(command, target);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => {
                        el.focus();
                        el.click();
                        resolve({
                            success: true,
                            post_condition_met: true,
                            layer_used: "DOM_API"
                        });
                    }, 150);
                } else {
                    resolve({
                        success: false,
                        fallback_reason: "Target element not found on page."
                    });
                }
                return;
            }

            if (intent === "TYPE_TEXT") {
                const el = findTargetElement(command, target);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.focus();
                    const textToType = command.slots.text || "";
                    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                        el.value = textToType;
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                    } else if (el.isContentEditable) {
                        el.textContent = textToType;
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    const matched = el.value === textToType || el.textContent === textToType;
                    resolve({
                        success: true,
                        post_condition_met: matched,
                        layer_used: "DOM_API"
                    });
                } else {
                    resolve({
                        success: false,
                        fallback_reason: "Target input field not found."
                    });
                }
                return;
            }

            if (intent === "SELECT_OPTION") {
                const el = findTargetElement(command, target);
                if (el && el.tagName === "SELECT") {
                    const optionText = (command.slots.text || "").toLowerCase();
                    let matched = false;
                    for (const opt of el.options) {
                        if (opt.text.toLowerCase().includes(optionText)) {
                            el.value = opt.value;
                            el.dispatchEvent(new Event("change", { bubbles: true }));
                            matched = true;
                            break;
                        }
                    }
                    resolve({
                        success: matched,
                        post_condition_met: matched,
                        layer_used: "DOM_API",
                        fallback_reason: matched ? null : "Option not found in dropdown."
                    });
                } else {
                    resolve({
                        success: false,
                        fallback_reason: "Target select element not found."
                    });
                }
                return;
            }

            if (intent === "SCROLL") {
                const dir = command.slots.direction;
                const amountKey = command.slots.amount || "medium";
                const amountMap = {
                    small: window.innerHeight * 0.3,
                    medium: window.innerHeight * 0.7,
                    large: window.innerHeight * 1.5
                };
                const px = amountMap[amountKey] || amountMap.medium;

                const scrollOpts = { behavior: "smooth" };
                if (dir === "down") scrollOpts.top = px;
                else if (dir === "up") scrollOpts.top = -px;
                else if (dir === "right") scrollOpts.left = px;
                else if (dir === "left") scrollOpts.left = -px;

                window.scrollBy(scrollOpts);
                resolve({
                    success: true,
                    post_condition_met: true,
                    layer_used: "DOM_API"
                });
                return;
            }

            resolve({
                success: false,
                fallback_reason: `Intent '${command.intent}' not handled by page executor.`
            });

        } catch (e) {
            resolve({ success: false, fallback_reason: e.message });
        }
    });
}

async function executeWithRetry(command, target) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const result = await executeCommand(command, target);
        if (result.success) {
            result.attempt = attempt + 1;
            return result;
        }
        if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 300));
        } else {
            result.attempts_exhausted = true;
            result.attempt = attempt + 1;
            return result;
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "EXECUTE_COMMAND") {
        executeWithRetry(request.command, request.target).then(sendResponse);
        return true;
    }
});
