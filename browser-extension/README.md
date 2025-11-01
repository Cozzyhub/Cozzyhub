# Meesho to Cozzyhub Importer Browser Extension

A Chrome/Edge browser extension that allows you to import products directly from Meesho.com to your Cozzyhub store with one click.

## Features

- 🚀 One-click product import from Meesho
- 📸 Automatic image extraction and upload
- 💰 Price and description extraction
- 📦 Customizable stock quantity
- ✨ Beautiful, user-friendly interface

## Installation

### Step 1: Create Extension Icons

The extension needs icons in three sizes. You can use any icon creator tool or AI image generator:

1. Create 3 PNG images with sizes: 16x16, 48x48, and 128x128 pixels
2. Name them: `icon16.png`, `icon48.png`, `icon128.png`
3. Save them in the `browser-extension/icons/` folder

**Quick option:** Use an online tool like [favicon.io](https://favicon.io/) or just use placeholder colors for testing.

### Step 2: Load Extension in Browser

#### For Chrome:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension icon should appear in your toolbar

#### For Edge:
1. Open Edge and go to `edge://extensions/`
2. Enable "Developer mode" (toggle in left sidebar)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension icon should appear in your toolbar

### Step 3: Setup Your Site

1. Make sure your Cozzyhub site is running (`npm run dev`)
2. Log in to your Cozzyhub account (required for adding products)
3. The default API URL is `http://localhost:3000` - update this in the extension if needed

## Usage

1. **Navigate to Meesho:** Go to any product page on [meesho.com](https://www.meesho.com)
2. **Click Extension Icon:** Click the Meesho Importer extension icon in your browser toolbar
3. **Review Product:** The extension will automatically extract:
   - Product title
   - Price
   - Images
   - Description
   - Category
4. **Set Stock:** Enter the quantity you want to stock (default: 100)
5. **Click "Add to Store":** The product will be imported to your Cozzyhub store!

## Configuration

### Change API URL

If you're running your site on a different port or domain:

1. Click the extension icon
2. Update the "Your Cozzyhub URL" field
3. The extension will remember this setting

### Update for Production

When deploying to production, update the `host_permissions` in `manifest.json`:

```json
"host_permissions": [
  "https://www.meesho.com/*",
  "https://your-domain.com/*"
]
```

## How It Works

1. **Content Script** (`content.js`) runs on Meesho pages and extracts product data
2. **Background Script** (`background.js`) manages communication between components
3. **Popup** (`popup.html/js/css`) provides the user interface
4. **API Endpoint** (`/api/products/import`) receives and processes the product data
5. **Image Processing:** Downloads images from Meesho and uploads to your Supabase storage

## Troubleshooting

### Extension not showing product data
- Make sure you're on a Meesho product page (URL contains `/product/`)
- Refresh the page and try again
- Check browser console for errors (F12)

### "Unauthorized" error
- Make sure you're logged in to your Cozzyhub account
- The extension uses your active session to add products

### Images not uploading
- Check your Supabase storage bucket configuration
- Ensure the `products` bucket exists and is publicly accessible
- Verify storage permissions in Supabase dashboard

### API connection failed
- Verify your Cozzyhub site is running
- Check the API URL in the extension settings
- Ensure CORS is not blocking requests (should work with localhost)

## Security Notes

⚠️ **Important:**
- This extension is for personal use only
- Always respect Meesho's Terms of Service
- Don't use for commercial scraping or bulk imports
- Ensure you have rights to use any imported content

## Development

To modify the extension:

1. Edit the files in `browser-extension/`
2. Go to `chrome://extensions/` or `edge://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## File Structure

```
browser-extension/
├── manifest.json       # Extension configuration
├── content.js         # Product data extraction
├── background.js      # Service worker
├── popup.html         # Extension UI
├── popup.css          # Styles
├── popup.js           # UI logic
├── icons/             # Extension icons
└── README.md          # This file
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all files are in the correct location
3. Ensure your Supabase database has the correct schema
4. Make sure the API endpoint is accessible

## License

For personal use with Cozzyhub platform.
