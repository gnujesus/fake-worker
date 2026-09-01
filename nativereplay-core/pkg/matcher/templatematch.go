package matcher

import (
	"image"
)

// TODO: 2D Template Image Matcher Engine
//
// PURPOSE:
// Locates a target template sub-image (e.g. icon, button, checkbox) inside a larger full-screen
// capture using Normalized Cross-Correlation (NCC) or Sum of Absolute Differences (SAD).
//
// RECOMMENDED GO LIBRARIES:
// - Standard Go `image` package with goroutine SIMD parallelism, or
// - `gocv.io/x/gocv` (Go OpenCV bindings for GPU-accelerated matching)
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define Match Result Struct:
//    ```go
//    type MatchResult struct {
//        Found      bool            `json:"found"`
//        Confidence float64         `json:"confidence"` // 0.0 to 1.0 (e.g. >= 0.85)
//        CenterX    int             `json:"centerX"`    // Center X pixel coordinate
//        CenterY    int             `json:"centerY"`    // Center Y pixel coordinate
//        Bounds     image.Rectangle `json:"bounds"`     // Exact bounding box of match
//    }
//    ```
// 2. [ ] Implement Grayscale Pixel Conversion:
//    - Fast grayscale matrix generation: `gray = 0.299*R + 0.587*G + 0.114*B`.
// 3. [ ] Implement Normalized Cross-Correlation (NCC) Algorithm:
//    - Scan template across screen image rows and columns using parallel worker goroutines (`sync.WaitGroup`).
//    - Compute correlation coefficient for each candidate offset.
//    - Find the global maximum correlation peak.
// 4. [ ] Implement Multi-Scale Template Search:
//    - Test at 0.9x, 1.0x, and 1.1x scales to accommodate slight OS DPI and application zooming variances.
// 5. [ ] Implement Region of Interest (ROI) filtering:
//    - Allow restricting search to a specific screen bounding box to reduce scan time to < 10ms.

type MatchResult struct {
	Found      bool            `json:"found"`
	Confidence float64         `json:"confidence"`
	CenterX    int             `json:"centerX"`
	CenterY    int             `json:"centerY"`
	Bounds     image.Rectangle `json:"bounds"`
}

type TemplateMatcher interface {
	Match(screen image.Image, template image.Image, threshold float64) (*MatchResult, error)
	MatchMultiScale(screen image.Image, template image.Image, threshold float64, scales []float64) (*MatchResult, error)
}
