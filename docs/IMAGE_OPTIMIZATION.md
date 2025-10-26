# Image Optimization with FFmpeg and Sharp

This project includes both client-side and server-side image optimization capabilities.

## Features

### 1. Client-Side Optimization (FFmpeg.wasm)
- Runs entirely in the browser
- Converts images to WebP format
- Resizes and optimizes images
- No server resources required

**Location**: `lib/ffmpeg/imageProcessor.ts`

**Usage**:
```typescript
import { optimizeImage, convertImageToWebP } from "@/lib/ffmpeg/imageProcessor";

// Optimize and resize
const blob = await optimizeImage(file, 1920, 1080, 80);

// Simple WebP conversion
const webpBlob = await convertImageToWebP(file, 80);
```

### 2. Server-Side Optimization (Sharp)
- Fast server-side processing
- Better for batch operations
- Automatic caching with proper headers

**Location**: `app/api/optimize-image/route.ts`

#### POST Endpoint - Upload and Optimize
```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("maxWidth", "1920");
formData.append("maxHeight", "1080");
formData.append("quality", "80");

const response = await fetch("/api/optimize-image", {
  method: "POST",
  body: formData
});

const blob = await response.blob();
```

#### GET Endpoint - Serve Optimized Static Images
```html
<!-- Automatically optimize and serve images from URLs -->
<img src="/api/optimize-image?url=https://example.com/image.jpg&maxWidth=800&quality=80" />
```

## Example Component

See `components/ImageUploadExample.tsx` for a complete working example.

## Parameters

- **maxWidth**: Maximum width in pixels (default: 1920)
- **maxHeight**: Maximum height in pixels (default: 1080)
- **quality**: WebP quality 0-100 (default: 80)

## When to Use Which?

### Use Client-Side (FFmpeg):
- User uploads in browser
- Real-time preview needed
- Reduce server load
- Progressive Web Apps

### Use Server-Side (Sharp):
- Serving static images
- Batch processing
- Better performance for large images
- CDN integration

## Next.js Image Component Integration

You can use the API route as an image loader:

```typescript
import Image from "next/image";

<Image
  src="/api/optimize-image?url=https://example.com/image.jpg"
  alt="Optimized image"
  width={800}
  height={600}
/>
```

## Performance Tips

1. **Caching**: The API route sets cache headers for optimized images
2. **Lazy Loading**: Use Next.js Image component for automatic lazy loading
3. **WebP Format**: 25-35% smaller than JPEG/PNG with same quality
4. **Responsive Images**: Adjust maxWidth based on viewport size

## Dependencies

- `@ffmpeg/ffmpeg`: Client-side video/image processing
- `@ffmpeg/util`: FFmpeg utilities
- `sharp`: Fast server-side image processing
