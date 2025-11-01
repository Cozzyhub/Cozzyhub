// Popup script to handle UI and communication
let productData = null;

// DOM elements
const notProductPage = document.getElementById('notProductPage');
const productPreview = document.getElementById('productPreview');
const loading = document.getElementById('loading');
const addProductBtn = document.getElementById('addProductBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

// Load saved API URL
chrome.storage.local.get(['apiUrl'], (result) => {
  if (result.apiUrl) {
    document.getElementById('apiUrl').value = result.apiUrl;
  }
});

// Save API URL when changed
document.getElementById('apiUrl').addEventListener('change', (e) => {
  chrome.storage.local.set({ apiUrl: e.target.value });
});

// Initialize popup
async function init() {
  loading.classList.remove('hidden');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on Meesho
    if (!tab.url.includes('meesho.com')) {
      loading.classList.add('hidden');
      notProductPage.classList.remove('hidden');
      return;
    }

    // Try to get stored product data first
    chrome.storage.local.get(['currentProduct'], async (result) => {
      if (result.currentProduct) {
        displayProduct(result.currentProduct);
        loading.classList.add('hidden');
      } else {
        // Extract product from page
        chrome.tabs.sendMessage(tab.id, { action: 'extractProduct' }, (response) => {
          loading.classList.add('hidden');
          
          if (response && response.success && response.data) {
            displayProduct(response.data);
          } else {
            notProductPage.classList.remove('hidden');
          }
        });
      }
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    loading.classList.add('hidden');
    notProductPage.classList.remove('hidden');
  }
}

// Display product preview
function displayProduct(data) {
  productData = data;
  
  if (!data || !data.title) {
    notProductPage.classList.remove('hidden');
    return;
  }

  document.getElementById('productTitle').textContent = data.title;
  document.getElementById('productPrice').textContent = data.price || '0';
  document.getElementById('productCategory').textContent = data.category || 'Uncategorized';
  
  if (data.images && data.images.length > 0) {
    document.getElementById('productImage').src = data.images[0];
  }

  productPreview.classList.remove('hidden');
}

// Add product to store
async function addProduct() {
  if (!productData) return;

  const stock = parseInt(document.getElementById('stock').value) || 100;
  const apiUrl = document.getElementById('apiUrl').value || 'http://localhost:3000';

  // Disable button and show loader
  addProductBtn.disabled = true;
  btnText.textContent = 'Adding...';
  btnLoader.classList.remove('hidden');
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');

  try {
    const response = await fetch(`${apiUrl}/api/products/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        stock,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.classList.remove('hidden');
      btnText.textContent = 'Added ✓';
      
      // Reset after 2 seconds
      setTimeout(() => {
        btnText.textContent = 'Add to Store';
        addProductBtn.disabled = false;
        btnLoader.classList.add('hidden');
      }, 2000);
    } else {
      // More detailed error message
      let errorMsg = result.error || 'Failed to add product';
      if (result.details) {
        errorMsg += ': ' + result.details;
      }
      if (result.code) {
        errorMsg += ' (Code: ' + result.code + ')';
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error adding product:', error);
    console.error('Product data sent:', productData);
    errorText.textContent = error.message;
    errorMessage.classList.remove('hidden');
    btnText.textContent = 'Add to Store';
    addProductBtn.disabled = false;
    btnLoader.classList.add('hidden');
  }
}

// Event listeners
addProductBtn.addEventListener('click', addProduct);

// Retry button
const retryBtn = document.getElementById('retryBtn');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    loading.classList.remove('hidden');
    notProductPage.classList.add('hidden');
    setTimeout(() => {
      init();
    }, 500);
  });
}

// Initialize on load
init();
