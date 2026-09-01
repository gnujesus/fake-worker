package formfiller

import (
	"context"
	"time"
)

// TODO: Autonomous Form Filler & Visual Action Orchestrator Engine
//
// PURPOSE:
// Combines Computer Vision detection (Template, OCR, Gemini), Human Input simulation (Bézier mouse
// + keystrokes), and Network Inspection into a complete autonomous loop:
// "Look at form -> Understand fields with AI -> Move & Type -> Submit -> Report Server Response"
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define Action Step Structs:
//    ```go
//    type DetectionStrategy string
//    const (
//        DetectByTemplate DetectionStrategy = "template"
//        DetectByOCR      DetectionStrategy = "ocr"
//        DetectByGemini   DetectionStrategy = "gemini_vision"
//    )
//
//    type ActionType string
//    const (
//        ActionClick        ActionType = "click"
//        ActionDoubleClick  ActionType = "double_click"
//        ActionFocusAndType ActionType = "focus_and_type"
//        ActionHover        ActionType = "hover"
//        ActionWaitForText  ActionType = "wait_for_text"
//    )
//
//    type WorkflowStep struct {
//        ID               string            `json:"id"`
//        Name             string            `json:"name"`
//        Strategy         DetectionStrategy `json:"strategy"`
//        TargetTemplateB64 string           `json:"targetTemplateB64,omitempty"`
//        TargetText       string            `json:"targetText,omitempty"`
//        TargetPrompt     string            `json:"targetPrompt,omitempty"`
//        Action           ActionType        `json:"action"`
//        PayloadText      string            `json:"payloadText,omitempty"`
//        WPM              int               `json:"wpm,omitempty"`
//        PostDelay        time.Duration     `json:"postDelay,omitempty"`
//        InspectNetwork   bool              `json:"inspectNetwork,omitempty"` // Wait and capture server response
//    }
//    ```
// 2. [ ] Implement `ExecuteStep(ctx context.Context, step WorkflowStep) (*StepExecutionReport, error)`:
//    - Capture display snapshot via `screencap`.
//    - Locate target coordinates via `matcher`, `ocr`, or `geminivision`.
//    - Move mouse with Bézier physics via `humanmouse`.
//    - Type payload using human keystroke cadence.
//    - If `InspectNetwork` is true, wait for API server response via `networkinspector`.
// 3. [ ] Implement `ExecuteWorkflow(ctx context.Context, steps []WorkflowStep, onProgress func(stepIndex int, msg string)) (*WorkflowReport, error)`:
//    - Executes sequence of visual actions with live progress reporting over WebSocket.
// 4. [ ] Implement Emergency Stop Integration:
//    - Abort workflow loop immediately when context cancellation is signaled.

type WorkflowStep struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Strategy       string        `json:"strategy"`
	TargetText     string        `json:"targetText,omitempty"`
	Action         string        `json:"action"`
	PayloadText    string        `json:"payloadText,omitempty"`
	WPM            int           `json:"wpm,omitempty"`
	PostDelay      time.Duration `json:"postDelay,omitempty"`
	InspectNetwork bool          `json:"inspectNetwork,omitempty"`
}

type StepReport struct {
	StepID         string `json:"stepId"`
	Success        bool   `json:"success"`
	MatchedCoords  [2]int `json:"matchedCoords"`
	ServerResponse string `json:"serverResponse,omitempty"`
	HTTPStatus     int    `json:"httpStatus,omitempty"`
	DurationMs     int64  `json:"durationMs"`
	ErrorMessage   string `json:"errorMessage,omitempty"`
}

type FormRunner interface {
	ExecuteStep(ctx context.Context, step WorkflowStep) (*StepReport, error)
	ExecuteWorkflow(ctx context.Context, steps []WorkflowStep) ([]StepReport, error)
}
