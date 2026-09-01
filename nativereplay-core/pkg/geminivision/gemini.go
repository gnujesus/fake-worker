package geminivision

import (
	"context"
	"image"
)

// TODO: Gemini Multimodal Vision & Semantic Reasoning Engine
//
// PURPOSE:
// Uses Google Gemini 2.5 Flash Multimodal Vision API to semantically locate complex UI elements
// described in natural language (e.g. "Find the user avatar menu in top right", "Locate the zip code input").
//
// RECOMMENDED GO LIBRARIES:
// - `google.golang.org/genai` (Official Google Gen AI Go SDK) or
// - `github.com/google/generative-ai-go/genai`
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define Semantic Result Struct:
//    ```go
//    type SemanticTarget struct {
//        Found        bool    `json:"found"`
//        Description  string  `json:"description"`
//        CenterX      int     `json:"centerX"`    // Denormalized Screen X pixel
//        CenterY      int     `json:"centerY"`    // Denormalized Screen Y pixel
//        NormalizedBox [4]int `json:"normalizedBox"` // [ymin, xmin, ymax, xmax] (0-1000 scale)
//    }
//    ```
// 2. [ ] Initialize GenAI Client using API Key (or Cloud Proxy endpoint):
//    ```go
//    client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
//    ```
// 3. [ ] Implement `LocateElement(ctx context.Context, screen image.Image, prompt string) (*SemanticTarget, error)`:
//    - Encode image to JPEG / PNG buffer.
//    - Pass image part and system instructions requesting normalized bounding boxes:
//      `{"box_2d": [ymin, xmin, ymax, xmax], "label": "description"}`
//    - Parse Gemini structured JSON output.
//    - Compute center point: `((xmin + xmax) / 2, (ymin + ymax) / 2)`.
// 4. [ ] Implement Denormalization Mapping:
//    - Map Gemini's 0–1000 scale to exact display resolution `(screenWidth, screenHeight)`.
// 5. [ ] Implement Fallback Strategy:
//    - Automatic retry with exponential backoff on rate limits (429) or transient network errors.

type SemanticTarget struct {
	Found         bool    `json:"found"`
	Description   string  `json:"description"`
	CenterX       int     `json:"centerX"`
	CenterY       int     `json:"centerY"`
	NormalizedBox [4]int  `json:"normalizedBox"`
}

type GeminiVisionAgent interface {
	LocateElement(ctx context.Context, screen image.Image, queryPrompt string) (*SemanticTarget, error)
}
