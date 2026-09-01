package server

import (
	"context"
)

// TODO: Local WebSocket & JSON-RPC Communication Server
//
// PURPOSE:
// Provides the bi-directional communication bridge between the Go engine daemon and the
// Electron desktop application over local WebSocket (`ws://127.0.0.1:49221`).
//
// RECOMMENDED GO LIBRARIES:
// - `github.com/gorilla/websocket` or
// - `github.com/coder/websocket`
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define JSON-RPC / WebSocket Message Protocol:
//    ```go
//    type RPCMessage struct {
//        ID     string          `json:"id"`
//        Method string          `json:"method"` // e.g. "screen.capture", "vision.match", "form.run"
//        Params json.RawMessage `json:"params,omitempty"`
//        Result interface{}     `json:"result,omitempty"`
//        Error  *RPCError       `json:"error,omitempty"`
//    }
//    ```
// 2. [ ] Implement WebSocket Connection Handler:
//    - Upgrade HTTP connection to WebSocket.
//    - Manage client connection pool and heartbeat ping/pong.
// 3. [ ] Register Method Routers:
//    - `screen.capture` -> calls `screencap.CaptureBase64PNG()`
//    - `template.match` -> calls `matcher.Match()`
//    - `ocr.find`       -> calls `ocr.FindText()`
//    - `gemini.locate`  -> calls `geminivision.LocateElement()`
//    - `mouse.click`    -> calls `humanmouse.Click()`
//    - `form.run_step`  -> calls `formfiller.ExecuteStep()`
//    - `form.run_all`   -> calls `formfiller.ExecuteWorkflow()`
// 4. [ ] Implement Streaming Progress Broadcasts:
//    - Send live telemetry to Electron (mouse position, matched coordinate highlight, server response).
// 5. [ ] Implement `StartServer(ctx context.Context, port int) error`:
//    - Runs HTTP/WS server and blocks until context cancellation.

type ServerConfig struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

type DaemonServer interface {
	Start(ctx context.Context, config ServerConfig) error
	BroadcastEvent(method string, payload interface{}) error
	Stop() error
}
