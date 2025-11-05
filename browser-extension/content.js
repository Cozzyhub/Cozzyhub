// Content script that runs on Meesho product pages
// Extracts product information from the page

function extractProductData() {
  try {
    console.log("Extracting product data from Meesho...");

    // Check if we're on Meesho
    if (!window.location.href.includes("meesho.com")) {
      console.log("Not on Meesho");
      return null;
    }

    // Wait a bit for page to load
    const pageTitle = document.title;
    console.log("Page title:", pageTitle);

    // Extract title from page title (most reliable)
    let title = pageTitle.split("|")[0].trim();
    if (title.includes(" - ")) {
      title = title.split(" - ")[0].trim();
    }

    // If title is too generic, try h1
    if (
      !title ||
      title.toLowerCase().includes("buy") ||
      title.toLowerCase().includes("meesho")
    ) {
      const h1 = document.querySelector("h1");
      if (h1) {
        title = h1.textContent.trim();
      }
    }

    console.log("Extracted title:", title);

    // Extract price - Look for price in specific elements first (more accurate)
    let price = 0;

    // Strategy 1: Look for large price elements (h1-h5, specific price classes)
    const priceSelectors = [
      "h1, h2, h3, h4, h5",
      '[class*="price"]',
      '[class*="Price"]',
      'span[class*="Text"]',
    ];

    const validPrices = [];

    for (const selector of priceSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.includes("₹")) {
          // Match prices in this specific element
          const matches = text.match(/₹\s*(\d{1,6}(?:,\d{3})*)/g);
          if (matches) {
            matches.forEach((match) => {
              const priceStr = match.replace(/₹|,/g, "").trim();
              const priceNum = parseInt(priceStr);
              // Meesho prices are typically 50+ rupees, filter out very small numbers
              if (priceNum >= 50 && priceNum <= 100000) {
                validPrices.push(priceNum);
                console.log(
                  "Found price in element:",
                  priceNum,
                  "from",
                  el.tagName,
                  text.substring(0, 50),
                );
              }
            });
          }
        }
      });
    }

    // Strategy 2: If no prices found, scan full page text
    if (validPrices.length === 0) {
      console.log("No prices found in elements, scanning full page...");
      const bodyText = document.body.textContent;
      const priceMatches = bodyText.match(/₹\s*(\d{1,6}(?:,\d{3})*)/g);

      if (priceMatches) {
        priceMatches.forEach((match) => {
          const priceStr = match.replace(/₹|,/g, "").trim();
          const priceNum = parseInt(priceStr);
          if (priceNum >= 50 && priceNum <= 100000) {
            validPrices.push(priceNum);
          }
        });
      }
    }

    // The lowest price is usually the actual selling price (after discount)
    if (validPrices.length > 0) {
      price = Math.min(...validPrices);
      console.log(
        "All found prices:",
        validPrices,
        "→ Selected lowest:",
        price,
      );
    } else {
      console.log("No valid prices found");
    }

    // Fallback: look for specific price elements
    if (price === 0) {
      const priceElements = document.querySelectorAll("h4, h5, span, div");
      for (const el of priceElements) {
        const text = el.textContent?.trim();
        if (text && text.includes("₹") && !text.includes("₹0")) {
          const match = text.match(/₹\s*(\d{1,6}(?:,\d{3})*)/);
          if (match) {
            const priceNum = parseInt(match[1].replace(/,/g, ""));
            if (priceNum >= 10 && priceNum <= 100000) {
              price = priceNum;
              console.log("Found price in element:", price);
              break;
            }
          }
        }
      }
    }

    console.log("Final price:", price);

    // Extract description
    const metaDesc = document.querySelector('meta[property="og:description"]');
    const description = metaDesc?.content || title || "Product from Meesho";

    // Extract images - prioritize product gallery images and filter out banners
    const images = [];
    const seenUrls = new Set();

    // Helper function to check if image is promotional/banner
    function isPromotionalImage(img, allowSmall = false) {
      const src = img.src?.toLowerCase() || "";
      const alt = img.alt?.toLowerCase() || "";

      // Filter out marketing/promotional images by URL patterns
      if (
        src.includes("marketing") ||
        src.includes("banner") ||
        src.includes("promo")
      ) {
        console.log("Filtered marketing image:", src);
        return true;
      }

      // Filter by alt text
      if (
        alt.includes("offer") ||
        alt.includes("discount") ||
        alt.includes("sale") ||
        alt.includes("%")
      ) {
        console.log("Filtered promotional alt text:", alt);
        return true;
      }

      // Check if image has dark background (promotional banners usually have dark backgrounds)
      // by checking if the image is in a container with dark styling
      const parent = img.closest('div[style*="background"]');
      if (parent) {
        const bgStyle =
          parent.style.background || parent.style.backgroundColor || "";
        if (
          bgStyle.includes("rgb(0") ||
          bgStyle.includes("#0") ||
          bgStyle.includes("black")
        ) {
          console.log(
            "Filtered image with dark background (likely promotional)",
          );
          return true;
        }
      }

      // Filter out very wide banners (aspect ratio check)
      if (img.width > 0 && img.height > 0) {
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 2.5 || aspectRatio < 0.5) {
          console.log("Filtered by aspect ratio:", aspectRatio);
          return true;
        }
      }

      // Filter out small icons/thumbnails (but allow if this is a gallery thumbnail)
      if (!allowSmall && (img.width < 150 || img.height < 150)) {
        return true;
      }

      return false;
    }

    // Helper function to clean and get high-res URL
    function getHighResUrl(url) {
      url = url.split("?")[0]; // Remove query params
      url = url.replace(/\/resize\/\d+/, "/resize/1200");
      url = url.replace(/\/w_\d+/, "/w_1200");
      url = url.replace(/\/h_\d+/, "/h_1200");
      return url;
    }

    // First, look for product images specifically (usually have 'products' in URL)
    const allImgs = document.querySelectorAll("img");

    console.log(`Scanning ${allImgs.length} total images on page...`);

    // Step 1: Collect all product image URLs (both large and thumbnails)
    const productImageCandidates = [];

    allImgs.forEach((img) => {
      if (
        img.src &&
        img.src.includes("images.meesho") &&
        img.src.includes("/products/")
      ) {
        // Check if this is a promotional image (but allow small thumbnails)
        if (!isPromotionalImage(img, true)) {
          const highResUrl = getHighResUrl(img.src);
          const area = img.width * img.height;

          productImageCandidates.push({
            url: highResUrl,
            area: area,
            width: img.width,
            height: img.height,
            element: img,
          });

          console.log(
            "Found product image candidate:",
            highResUrl,
            `Size: ${img.width}x${img.height}, Area: ${area}`,
          );
        }
      }
    });

    // Step 2: Deduplicate by URL (same image at different sizes)
    const uniqueProducts = new Map();
    productImageCandidates.forEach((candidate) => {
      if (!uniqueProducts.has(candidate.url)) {
        uniqueProducts.set(candidate.url, candidate);
      } else {
        // Keep the one with larger area
        const existing = uniqueProducts.get(candidate.url);
        if (candidate.area > existing.area) {
          uniqueProducts.set(candidate.url, candidate);
        }
      }
    });

    // Step 3: Sort by area and pick the best images
    // Filter out images that are TOO large (likely promotional banners with graphics)
    const sortedImages = Array.from(uniqueProducts.values())
      .filter((img) => {
        // Remove images that are suspiciously large (promotional banners)
        // Real product photos on Meesho are typically under 800x800 in the DOM
        return img.width <= 1000 && img.height <= 1000;
      })
      .sort((a, b) => b.area - a.area);

    console.log(
      `Found ${sortedImages.length} valid product images after filtering`,
    );

    // Step 4: Add images to final list (up to 6 images)
    sortedImages.forEach((imgData, index) => {
      if (images.length < 6 && !seenUrls.has(imgData.url)) {
        images.push(imgData.url);
        seenUrls.add(imgData.url);
        console.log(
          `Added product image ${index + 1}:`,
          imgData.url,
          `(${imgData.width}x${imgData.height})`,
        );
      }
    });

    // Step 5: If we still need more images, get other Meesho images (excluding promotional)
    if (images.length < 3) {
      allImgs.forEach((img) => {
        if (img.src && img.src.includes("images.meesho")) {
          if (
            !isPromotionalImage(img) &&
            img.width > 150 &&
            img.height > 150 &&
            img.width <= 800
          ) {
            const url = getHighResUrl(img.src);
            if (!seenUrls.has(url) && images.length < 6) {
              images.push(url);
              seenUrls.add(url);
              console.log("Added additional image:", url);
            }
          }
        }
      });
    }

    console.log("Found images:", images.length);

    // Extract product highlights and additional details
    let productHighlights = "";
    let additionalDetails = "";
    let color = "";

    // Try to find Product Highlights section
    const highlightsSection = document.querySelector("h2, h3, h4, div");
    const allText = document.body.textContent;

    // Extract color information
    const colorMatch = allText.match(/Color[:\s]*(\w+)/i);
    if (colorMatch) {
      color = colorMatch[1];
      console.log("Found color:", color);
    }

    // Look for Product Highlights section
    if (allText.includes("Product Highlights")) {
      const highlightsIdx = allText.indexOf("Product Highlights");
      const additionalIdx = allText.indexOf("Additional Details");

      if (highlightsIdx > -1 && additionalIdx > highlightsIdx) {
        // Extract text between Product Highlights and Additional Details
        const highlightsText = allText
          .substring(highlightsIdx + 18, additionalIdx)
          .trim();
        productHighlights = highlightsText.substring(0, 500); // Limit length
      }
    }

    // Look for Additional Details section
    if (allText.includes("Additional Details")) {
      const detailsIdx = allText.indexOf("Additional Details");
      // Extract next ~800 characters after "Additional Details"
      const detailsText = allText
        .substring(detailsIdx + 18, detailsIdx + 800)
        .trim();

      // Clean up the text - extract key details
      const lines = detailsText.split("\n").filter((line) => {
        const trimmed = line.trim();
        // Keep lines that look like key-value pairs or important info
        return (
          trimmed.length > 3 &&
          !trimmed.includes("Product may be regulated") &&
          !trimmed.startsWith("http")
        );
      });

      additionalDetails = lines.slice(0, 15).join("\n"); // Limit to 15 lines
      console.log("Found additional details");
    }

    // Extract category from URL or breadcrumbs
    let category = "Fashion";
    const urlParts = window.location.pathname.split("/");
    if (urlParts.length > 1) {
      category = urlParts[1].replace(/-/g, " ");
      category = category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Validate we have minimum required data
    if (!title || title.length < 3) {
      console.log("Invalid title:", title);
      return null;
    }

    if (price === 0) {
      console.log("Price not found");
      return null;
    }

    if (images.length === 0) {
      console.log("No images found");
      return null;
    }

    const productData = {
      title,
      price,
      description,
      images,
      category,
      color,
      productHighlights,
      additionalDetails,
      sourceUrl: window.location.href,
      source: "Meesho",
    };

    console.log("Product data extracted successfully:", productData);
    return productData;
  } catch (error) {
    console.error("Error extracting product data:", error);
    return null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractProduct") {
    const productData = extractProductData();
    sendResponse({ success: true, data: productData });
  }
  return true;
});

// Auto-extract when page loads and store in background
window.addEventListener("load", () => {
  const productData = extractProductData();
  if (productData) {
    chrome.runtime.sendMessage({
      action: "productExtracted",
      data: productData,
    });
  }
});
