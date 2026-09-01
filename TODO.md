# NativeReplay Core: Go Computer Vision, Form Automation & Network Engine

> **Architecture:** A high-performance standalone Go library and daemon engine (`nativereplay-core`) that provides **Computer Vision, Human-like Input Automation, Gemini Multimodal Reasoning, and Server/Network Inspection** for the NativeReplay QA desktop app.

---

## 📁 Repository Structure (`nativereplay-core/`)

```
nativereplay-core/
├── go.mod                                # Go module definition
├── cmd/
│   └── agent/
│       └── main.go                       # Standalone daemon CLI & process entry point
└── pkg/
    ├── screencap/
    │   └── screencap.go                  # Native OS multi-monitor screenshot capture
    ├── matcher/
    │   └── templatematch.go              # 2D cross-correlation image template matcher
    ├── ocr/
    │   └── ocr.go                        # Screen OCR text locator with fuzzy matching
    ├── geminivision/
    │   └── gemini.go                     # Gemini 2.5 Flash multimodal coordinate reasoning
    ├── humanmouse/
    │   └── mouse.go                      # Cubic Bézier mouse physics & OS clicks
    ├── networkinspector/
    │   └── inspector.go                  # Browser CDP network listener & server response tracker
    ├── formfiller/
    │   └── runner.go                     # Autonomous form execution & visual workflow orchestrator
    └── server/
        └── ws_server.go                  # Local WebSocket & JSON-RPC communication bridge
```

---

## 📦 Required Go Dependencies

Run these commands inside the `nativereplay-core/` directory:

```bash
# Screen Capture & Imaging
go get github.com/kbinani/screenshot
go get github.com/disintegration/imaging

# Hardware Mouse & Keyboard Simulation
go get github.com/go-vgo/robotgo

# Optical Character Recognition (OCR)
go get github.com/otiai10/gosseract/v2

# Chrome DevTools Protocol & Network Inspection
go get github.com/chromedp/chromedp

# Google Gemini Multimodal Vision SDK
go get google.golang.org/genai

# WebSocket Server Bridge
go get github.com/gorilla/websocket
```

---

## 📝 Subsystem Implementation Checklist

### 1. Screen Capture (`pkg/screencap/screencap.go`)
- [ ] Implement `GetDisplays()` to query monitor resolutions and DPI scaling factors.
- [ ] Implement `CaptureScreen(displayIndex int)` for raw pixel buffers.
- [ ] Implement `CaptureBase64PNG()` for streaming snapshots to Electron UI.

### 2. 2D Template Matcher (`pkg/matcher/templatematch.go`)
- [ ] Implement Normalized Cross-Correlation (NCC) 2D matching algorithm.
- [ ] Multi-scale matching (0.9x – 1.1x) to tolerate OS rendering scale variances.
- [ ] Region of Interest (ROI) bounding box clipping.

### 3. Screen OCR Engine (`pkg/ocr/ocr.go`)
- [ ] Initialize persistent Gosseract/Tesseract client pool.
- [ ] Implement `FindText()` with fuzzy Levenshtein distance matching.
- [ ] Preprocessing filters (grayscale & contrast thresholding).

### 4. Gemini 2.5 Vision (`pkg/geminivision/gemini.go`)
- [ ] Connect to Google Gen AI Go SDK.
- [ ] Implement `LocateElement()` requesting normalized 2D coordinates `[ymin, xmin, ymax, xmax]`.
- [ ] Denormalize 0-1000 scale to actual screen pixel coordinates.

### 5. Human-like Mouse Physics (`pkg/humanmouse/mouse.go`)
- [ ] Cubic Bézier curve trajectory generator with perpendicular control points.
- [ ] S-curve acceleration profile (`t = (1 - cos(π * progress)) / 2`).
- [ ] Natural click dwell time (60ms–120ms) and micro-tremor jitter.

### 6. Network & Server Inspector (`pkg/networkinspector/inspector.go`)
- [ ] Subscribe to Chrome DevTools Protocol (CDP) `network.EventResponseReceived`.
- [ ] Capture HTTP status codes (200, 400, 500) and server JSON response bodies.
- [ ] Capture browser console errors and exceptions.

### 7. Form Automation Runner (`pkg/formfiller/runner.go`)
- [ ] Combine Vision Detection $\rightarrow$ Mouse Move $\rightarrow$ Keystroke Typing $\rightarrow$ Submit $\rightarrow$ Network Inspection into unified steps.
- [ ] Emergency stop cancellation listener.

### 8. WebSocket Bridge (`pkg/server/ws_server.go`)
- [ ] Start local JSON-RPC / WebSocket server on `127.0.0.1:49221`.
- [ ] Dispatch incoming Electron requests and broadcast live telemetry events.
