# Chromium Voice + Eye Agent Release Checklist & DoD

## 1. Program-Level "Definition of Done"

### 1.1 Required Functional Capabilities
- [ ] Push-to-talk and wake-word modes initialize and function reliably.
- [ ] Core browser actions (nav, tab control) function.
- [ ] Page interactions (click, type, scroll, form submit) function.
- [ ] Voice clarification states successfully break ambiguous multi-target ties.
- [ ] Eye tracking actively reduces wrong-target rates without causing auto-clicks.
- [ ] Accessibility visual target highlights correctly outline targets inside the DOM.

### 1.2 Non-Functional Requirements (NFR) Checklist
- [ ] Complete local-only inference runtime validated (Airplane mode test passed).
- [ ] Performance SLOs met: (Browser task < 700ms; Grounding task < 2000ms p95 latency).
- [ ] Ambiguity failure rate < 1% wrong-target on Suite 3 benchmarks.
- [ ] Safety defaults are hard-coded correctly in config.
- [ ] System handles CPU/GPU capability routing automatically.

## 2. Final Go-Live Verification
### 2.1 Security & Policy Red Team
- [ ] "No Cloud Dependency" firewall trap test passed.
- [ ] Adversarial prompt injection attacks failed to bypass Confirmation Policy.
- [ ] Critical functions request dual-confirmation.

### 2.2 Accessibility User Testing
- [ ] Low-vision mode visually readable on diverse color palettes.
- [ ] Audio-only verification sequence confirmed.

## 3. Launch Checklist
- [ ] Merge WP-01 -> WP-10 completed.
- [ ] Publish documentation for custom wake-word pipeline.
- [ ] Issue beta distribution binaries.
