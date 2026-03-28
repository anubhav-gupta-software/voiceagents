// overlay.js - WP-09 Accessibility Visual Overlays

class AccessibilityOverlay {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = "voice-agent-accessibility-overlay";
        this.container.style.position = "fixed";
        this.container.style.top = "0";
        this.container.style.left = "0";
        this.container.style.width = "100vw";
        this.container.style.height = "100vh";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = "2147483647"; // Max z-index
        document.body.appendChild(this.container);

        this.targetBox = document.createElement('div');
        this.targetBox.style.position = "absolute";
        this.targetBox.style.border = "4px solid #00FF00"; // High contrast green
        this.targetBox.style.borderRadius = "4px";
        this.targetBox.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
        this.targetBox.style.transition = "all 0.2s ease-in-out";
        this.targetBox.style.display = "none";
        this.container.appendChild(this.targetBox);
        
        this.transcriptBubble = document.createElement('div');
        this.transcriptBubble.style.position = "absolute";
        this.transcriptBubble.style.bottom = "20px";
        this.transcriptBubble.style.left = "50%";
        this.transcriptBubble.style.transform = "translateX(-50%)";
        this.transcriptBubble.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.transcriptBubble.style.color = "white";
        this.transcriptBubble.style.padding = "10px 20px";
        this.transcriptBubble.style.borderRadius = "20px";
        this.transcriptBubble.style.fontFamily = "sans-serif";
        this.transcriptBubble.style.fontSize = "18px";
        this.transcriptBubble.style.display = "none";
        this.container.appendChild(this.transcriptBubble);
    }

    highlightTarget(bounds) {
        this.targetBox.style.display = "block";
        this.targetBox.style.left = `${bounds.x - 2}px`;
        this.targetBox.style.top = `${bounds.y - 2}px`;
        this.targetBox.style.width = `${bounds.w + 4}px`;
        this.targetBox.style.height = `${bounds.h + 4}px`;
        
        // Auto hide after 2 seconds
        setTimeout(() => {
            this.targetBox.style.display = "none";
        }, 2000);
    }

    showTranscript(text, isFinal = false) {
        this.transcriptBubble.style.display = "block";
        this.transcriptBubble.innerText = text;
        this.transcriptBubble.style.color = isFinal ? "#00FF00" : "white";
        
        if (isFinal) {
            setTimeout(() => {
                this.transcriptBubble.style.display = "none";
            }, 3000);
        }
    }
}

// Initialize on page load
const overlay = new AccessibilityOverlay();

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "HIGHLIGHT_TARGET") {
        overlay.highlightTarget(request.bounds);
    } else if (request.type === "SHOW_TRANSCRIPT") {
        overlay.showTranscript(request.text, request.isFinal);
    }
});
