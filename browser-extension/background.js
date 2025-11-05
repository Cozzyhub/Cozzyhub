// Background service worker for the extension
// Handles communication between content script and popup

let currentProductData = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "productExtracted") {
    // Store the extracted product data
    currentProductData = request.data;
    chrome.storage.local.set({ currentProduct: request.data });
  }
});

// Listen for tab updates to clear data when navigating away
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Check if still on Meesho
    if (!tab.url?.includes("meesho.com")) {
      currentProductData = null;
      chrome.storage.local.remove("currentProduct");
    }
  }
});
