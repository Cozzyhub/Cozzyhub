# How to Reload the Browser Extension

## ⚠️ IMPORTANT: You MUST reload the extension for changes to take effect!

The browser has cached the old version of the extension code. Follow these steps:

## Step-by-Step Instructions

### Method 1: Quick Reload (Recommended)

1. **Open Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - Or click the puzzle icon (🧩) in Chrome toolbar → "Manage Extensions"

2. **Find "Meesho Importer"**
   - Look for your extension in the list

3. **Click the Reload Button**
   - There's a circular arrow icon (🔄) on the extension card
   - Click it to reload the extension

4. **Go Back to Meesho**
   - Navigate to the product page again
   - The extension will now use the NEW code

### Method 2: Full Reload

1. Go to `chrome://extensions/`
2. Toggle OFF the "Meesho Importer" extension
3. Wait 2 seconds
4. Toggle it back ON
5. Navigate to Meesho product page

## Testing the New Version

After reloading, open the browser console to see the new debug logs:

1. **On the Meesho product page**, press `F12`
2. Go to the **Console** tab
3. You should see new logs like:
   ```
   Scanning X total images on page...
   Filtered marketing image: [url with 'marketing']
   Added MAIN product image (largest): [url] Size: 512x512
   Added gallery image: [url]
   Found images: 4
   ```

## What You Should See

✅ **Before reload**: Promotional "% OFF" banner image
✅ **After reload**: Actual product images (white charger)

## Still Not Working?

If images are still wrong after reload:

1. **Check console logs** - Are you seeing the new log messages?
2. **Hard refresh** - Close and reopen the Meesho tab
3. **Clear cache** - `Ctrl+Shift+Delete` → Clear browsing data
4. **Reinstall extension**:
   - Go to `chrome://extensions/`
   - Remove the extension
   - Click "Load unpacked"
   - Select the `browser-extension` folder again

## Latest Improvements

The new version now:
- ✅ Filters out images with "marketing" in URL
- ✅ Filters out promotional alt text (offer, discount, sale, %)
- ✅ Filters by aspect ratio (no wide banners)
- ✅ Prioritizes the LARGEST product image first
- ✅ Adds gallery thumbnails as additional images
- ✅ Better console logging for debugging
