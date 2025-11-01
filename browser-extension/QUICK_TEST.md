# 🚀 Quick Test Guide - Meesho Extension

## ✅ Extension Completely Rewritten!

### What's Fixed:
- ✅ Extracts title from page title (most reliable)
- ✅ Searches entire page for price with ₹ symbol
- ✅ Gets ALL images from the page
- ✅ Works on ANY Meesho page
- ✅ Added retry button if extraction fails
- ✅ Console logging for debugging

---

## 🔄 Update Extension First!

1. Go to `chrome://extensions/`
2. Find "Meesho to Cozzyhub Importer"
3. Click **Reload** 🔄 button
4. Extension is now updated!

---

## 📝 How to Use:

### Step 1: Go to ANY Meesho Product Page

Examples:
- `meesho.com/jaipuri-rayon-anarkali-kurti/p/9o5fBr`
- `meesho.com/large-acrylic-jewelry-organizer-with-10-compartment/...`
- ANY product URL from Meesho

### Step 2: Click Extension Icon

The extension will automatically extract:
- ✅ Product title
- ✅ Price (₹)
- ✅ Images
- ✅ Category

### Step 3: Review & Add

- Check if title and price look correct
- Set stock quantity (default: 100)
- Click "Add to Store"
- Product is added! 🎉

---

## 🐛 If It Shows "Could not detect product"

Click the **🔄 Retry Extraction** button!

This will:
1. Wait 500ms for page to fully load
2. Try extraction again
3. Should work on second try

---

## 🔍 Debug Mode

To see what's happening:

1. Right-click on Meesho page
2. Click "Inspect" (or press F12)
3. Go to "Console" tab
4. Click extension icon
5. See extraction logs:
   ```
   Extracting product data from Meesho...
   Page title: JAIPURI RAYON ANARKALI KURTI
   Extracted title: JAIPURI RAYON ANARKALI KURTI
   Found price: 311
   Final price: 311
   Found images: 4
   Product data extracted successfully
   ```

---

## ✅ Expected Results

When working correctly, you should see:
- **Title**: Actual product name (not "Product from Meesho")
- **Price**: Actual price (not ₹0)
- **Image**: Product image thumbnail
- **Category**: Extracted from URL

---

## 💡 Pro Tips

### Tip 1: Wait for Page to Load
- Don't click extension immediately after page loads
- Wait 1-2 seconds for content to render
- Then click extension icon

### Tip 2: Check Your Dev Server
Make sure your Cozzyhub site is running:
```bash
npm run dev
```

Should see:
```
Ready on http://localhost:3000
```

### Tip 3: Check URL in Extension
Make sure it says:
```
http://localhost:3000
```

Not:
```
https://yoursite.com
```

---

## 🎯 Test Products

Try these Meesho products to test:

1. **Kurtis**: Search "women kurtis"
2. **Jewelry**: Search "jewelry organizer"  
3. **Sarees**: Search "saree"
4. **Shoes**: Search "women shoes"

Pick any product, click it, then use extension!

---

## 🔧 Still Not Working?

### Check 1: Is Dev Server Running?
```bash
# In your project folder
npm run dev
```

### Check 2: Check Console for Errors
Press F12 on Meesho page, look for red errors

### Check 3: Reload Extension
`chrome://extensions/` → Click reload

### Check 4: Check Extension Console
1. Go to `chrome://extensions/`
2. Click "service worker" under your extension
3. See error logs

---

## 📊 What Gets Extracted

| Field | How It's Extracted |
|-------|-------------------|
| **Title** | From page `<title>` tag |
| **Price** | Searches entire page for ₹ symbol |
| **Images** | All images with "images.meesho" in URL |
| **Description** | From meta tags or title |
| **Category** | From URL path |

---

## ✅ Success Checklist

- [ ] Extension reloaded after update
- [ ] On Meesho product page
- [ ] Page fully loaded (2 seconds wait)
- [ ] Dev server running (`npm run dev`)
- [ ] Clicked extension icon
- [ ] See product preview with correct title & price
- [ ] Clicked "Add to Store"
- [ ] Success message appears
- [ ] Check your site - product added!

---

## 🎉 You're Ready!

The extension is now much more reliable. It will work on almost any Meesho product page!

If you still have issues, check the console logs (F12) to see what's being extracted.
