# How to Reload the Browser Extension

## ⚠️ CRITICAL: You MUST reload the extension after ANY code changes!

The browser caches the extension code. Changes to `content.js`, `popup.js`, or any other files **will NOT work** until you reload.

## Steps to Reload:

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions` in address bar OR
   - Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the switch in top-right corner (if not already on)

3. **Find "Meesho Product Importer" Extension**

4. **Click the Reload Icon (circular arrow)** next to the extension

5. **Refresh the Meesho product page** you're testing on

6. **Open DevTools Console** (F12) to verify the new code is running
   - You should see new console logs like:
     - "Found product image candidate:"
     - "Found X valid product images after filtering"
     - "Added product image 1:", "Added product image 2:", etc.

## Testing the Fix:

1. Go to the Meesho product page: https://meesho.com/portronics-adapto-12-24a-12w-fast-wall-charger-for-iphone-11/p/9wjk9h

2. Open DevTools Console (F12)

3. Click the extension icon and click "Import Product"

4. Check the console logs - you should see:
   ✅ Multiple product images found (4+ images)
   ✅ Images filtered by size (promotional banner excluded)
   ✅ High-res URLs being used

5. Verify on your site that the correct white charger images are displayed (not the promotional banner)

## If Images Are Still Wrong:

- Make sure you completed ALL steps above (especially reload + refresh)
- Check console for any error messages
- Verify the console shows "Found X valid product images" with X > 1
