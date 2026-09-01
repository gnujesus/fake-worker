package screencap

import (
	"image"
)

// TODO: Native OS Screen Capture Engine
//
// PURPOSE:
// Provides cross-platform, high-speed display snapshot capture into Go standard `image.Image`
// and PNG/JPEG byte buffers. Handles multi-monitor coordinate offsets and Windows DPI scaling.
//
// RECOMMENDED GO LIBRARIES:
// - `github.com/kbinani/screenshot` (Ultra-fast pure Go/Win32 GDI screen grabber)
// - `github.com/vova616/screenshot`
//
// IMPLEMENTATION TASKS:
// 1. [ ] Define Display Geometry struct:
//    ```go
//    type DisplayInfo struct {
//        Index   int        `json:"index"`
//        Bounds  image.Rectangle `json:"bounds"`
//        IsPrimary bool    `json:"isPrimary"`
//        ScaleFactor float64 `json:"scaleFactor"` // e.g. 1.25 for 125% DPI
//    }
//    ```
// 2. [ ] Implement `GetDisplays() ([]DisplayInfo, error)`:
//    - Queries the OS for all active monitors and their screen rectangles.
// 3. [ ] Implement `CaptureScreen(displayIndex int) (image.Image, error)`:
//    - Grabs the raw pixel buffer of the specified display.
// 4. [ ] Implement `CaptureRegion(bounds image.Rectangle) (image.Image, error)`:
//    - Crops and returns a specific sub-rectangle of the screen.
// 5. [ ] Implement `CaptureBase64PNG(displayIndex int) (string, error)`:
//    - Encodes captured image to a Base64 PNG data string for immediate transmission over WebSocket to Electron.
// 6. [ ] Add memory pooling (`sync.Pool`) for image byte buffers to achieve 60+ FPS screen inspection with zero GC overhead.

type ScreenService interface {
	GetDisplays() ([]image.Rectangle, error)
	CaptureScreen(displayIndex int) (image.Image, error)
	CaptureBase64PNG(displayIndex int) (string, error)
}
