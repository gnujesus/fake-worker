package ocr

import (
	"image"
)

// TODO: OCR Screen Text Locator Engine
//
// PURPOSE:
// Uses Optical Character Recognition (OCR) to detect all text strings and words rendered on
// the user's screen and locate target keywords (e.g. "Submit", "Sign In", "Billing") with exact
// pixel bounding box coordinates.
//
// RECOMMENDED GO LIBRARIES:
// - `github.com/otiai10/gosseract/v2` (Go wrapper for Tesseract OCR C++ library)
// - Alternatively, pure Go OCR / local ONNX runtime embeddings
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define OCR Result Structs:
//    ```go
//    type TextBox struct {
//        Text       string          `json:"text"`
//        Confidence float64         `json:"confidence"` // 0 to 100
//        Bounds     image.Rectangle `json:"bounds"`
//        CenterX    int             `json:"centerX"`
//        CenterY    int             `json:"centerY"`
//    }
//    ```
// 2. [ ] Initialize persistent Gosseract client instance with thread safety.
// 3. [ ] Implement `FindText(screen image.Image, queryText string, caseSensitive bool) (*TextBox, error)`:
//    - Perform OCR on screenshot buffer.
//    - Iterate through detected word bounding boxes.
//    - Apply Levenshtein distance fuzzy matching to tolerate minor font rendering artifacts.
//    - Return matched bounding box and center coordinate.
// 4. [ ] Implement `ExtractAllText(screen image.Image) ([]TextBox, error)`:
//    - Returns a complete structured map of all on-screen visible labels.
// 5. [ ] Implement Preprocessing Filters (Binarization & Thresholding):
//    - Convert image to high-contrast black-and-white to maximize OCR accuracy on dark/light themes.

type TextBox struct {
	Text       string          `json:"text"`
	Confidence float64         `json:"confidence"`
	Bounds     image.Rectangle `json:"bounds"`
	CenterX    int             `json:"centerX"`
	CenterY    int             `json:"centerY"`
}

type OCRAgent interface {
	FindText(screen image.Image, queryText string, fuzzyTolerance int) (*TextBox, error)
	ExtractAllText(screen image.Image) ([]TextBox, error)
	Close() error
}
