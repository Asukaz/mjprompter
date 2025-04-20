/**
 * AI Image Prompter - Chrome Extension
 * Vertical tab-based navigation with no hardcoded elements
 */

// Configuration
const CONFIG = {
  // Data sources in order of preference
  dataSources: [
    // Primary remote source
    "https://raw.githubusercontent.com/jamez-bondos/awesome-gpt4o-images/refs/heads/main/popup/gpt4o-prompt-samples.json",
    // Secondary remote source (fallback)
    "https://raw.githubusercontent.com/Asukaz/mjprompter/refs/heads/main/popup/gpt4o-prompt-samples.json",
    // Local file path
    "conf/gpt4o-prompt-samples.json",
    // Extension package path
    "../conf/gpt4o-prompt-samples.json"
  ],
  defaultImgSrc: "images/fallback.png",
  offlineStorageKey: "cached_feature_data",
  offlineTimestampKey: "cache_timestamp",
  cacheExpiryHours: 24 // How many hours before cache expires
};

// App state
let appState = {
  featureData: null,
  dimensions: [],
  selectedFeatures: {},
  activeMainTab: '',
  activeSubTab: '',
  activeExample: null,
  isExtensionContext: false,
  dataSource: null // Will store which data source was successfully used
};

// Initialize app when document is ready
$(document).ready(function() {
  // Check if we're running in a Chrome extension context
  appState.isExtensionContext = typeof chrome !== 'undefined' && chrome.storage;
  
  // Load configuration
  loadConfiguration()
    .then(() => {
      // Start the data loading sequence
      return loadDataFromSources();
    })
    .catch(error => {
      console.error("Error during startup:", error);
      showMessage("Error starting the application. Please reload.");
      showEmptyState();
    });
});

/**
 * Load configuration from storage or use defaults
 */
async function loadConfiguration() {
  // Check if we're running in a Chrome extension context
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        // Default values if not set
        'feature_url': CONFIG.dataSources[0],
        'cache_enabled': true
      }, (items) => {
        // Use the stored feature URL if available
        if (items.feature_url) {
          CONFIG.dataSources[0] = items.feature_url;
        }
        
        resolve();
      });
    });
  } else {
    // Not in extension context, use defaults
    return Promise.resolve();
  }
}

/**
 * Try to load data from all available sources
 */
async function loadDataFromSources() {
  // First, try to get cached data
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const cachedData = await getCachedData();
      if (cachedData) {
        console.log("Using cached data");
        await handleFeatureData(cachedData);
        
        // Try to refresh cache in the background
        refreshCacheInBackground();
        return;
      }
    }
  } catch (error) {
    console.warn("Failed to load cached data:", error);
    // Continue to try other sources
  }
  
  // Try all sources in sequence
  const sources = CONFIG.dataSources;
  for (let i = 0; i < sources.length; i++) {
    try {
      const data = await fetchDataFromSource(sources[i]);
      if (data) {
        appState.dataSource = sources[i];
        await handleFeatureData(data);
        return; // Successfully loaded data, stop trying
      }
    } catch (error) {
      console.warn(`Failed to load data from source ${sources[i]}:`, error);
      // Continue to next source
    }
  }
  
  // If we get here, all sources failed
  showMessage("Failed to load data from any source. Check your connection.");
  showEmptyState();
}

/**
 * Refresh the cache in the background
 */
async function refreshCacheInBackground() {
  try {
    // Fetch fresh data from primary source
    const data = await fetchDataFromSource(CONFIG.dataSources[0]);
    if (data) {
      // Update cache with fresh data
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({
          'cached_feature_data': data,
          'cache_timestamp': Date.now()
        });
      }
      console.log("Cache refreshed in background");
    }
  } catch (error) {
    console.warn("Failed to refresh cache:", error);
  }
}

/**
 * Get cached data from storage if available and not expired
 */
async function getCachedData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([CONFIG.offlineStorageKey, CONFIG.offlineTimestampKey], (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      const cachedData = items[CONFIG.offlineStorageKey];
      const timestamp = items[CONFIG.offlineTimestampKey];
      
      if (!cachedData || !timestamp) {
        resolve(null);
        return;
      }
      
      // Check if cache is expired
      const now = Date.now();
      const cacheAge = (now - timestamp) / (1000 * 60 * 60); // Convert to hours
      
      if (cacheAge > CONFIG.cacheExpiryHours) {
        console.log("Cache expired, will fetch fresh data");
        // Return the cached data anyway, but we'll try to refresh it
        resolve(cachedData);
      } else {
        console.log("Using valid cached data");
        resolve(cachedData);
      }
    });
  });
}

/**
 * Fetch data from a specific source
 */
async function fetchDataFromSource(source) {
  // Extension API request if applicable
  if (appState.isExtensionContext && source.startsWith('http')) {
    try {
      return await fetchViaExtensionAPI(source);
    } catch (error) {
      console.warn("Extension API fetch failed:", error);
      // Fall back to direct fetch
    }
  }
  
  // Direct fetch for all sources
  return new Promise((resolve, reject) => {
    $.ajax({
      url: source,
      dataType: 'json',
      timeout: 10000, // 10 second timeout
      success: (data) => {
        resolve(data);
      },
      error: (xhr, status, error) => {
        reject(new Error(`Ajax error: ${status} - ${error}`));
      }
    });
  });
}

/**
 * Fetch via Chrome extension API
 */
async function fetchViaExtensionAPI(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "fetchFeatureData", url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error("Failed to fetch via extension API"));
        }
      }
    );
  });
}

/**
 * Show empty state when no data is available
 */
function showEmptyState() {
  // Clear all content areas
  $('#mainTabs').empty().html('<div class="empty-state">No data available</div>');
  $('#subTabs').empty();
  $('#promptExamples').empty();
  $('#promptName').text('No data loaded');
  $('#promptText').text('Failed to load prompt data. Please check your connection and reload.');
  $('#variablesContainer').empty();
  
  // Show reload button
  $('.generate-button-container').html('<button onclick="location.reload()" class="generate-btn">Reload</button>');
}

/**
 * Process and initialize the app with the fetched feature data
 */
async function handleFeatureData(data) {
  try {
    // Parse the JSON data if it's a string
    const featureData = typeof data === 'string' ? JSON.parse(data) : data;
    appState.featureData = featureData;
    
    console.log("Loaded feature data:", featureData);
    
    // Initialize dimensions from the data
    if (featureData.dimension && Array.isArray(featureData.dimension)) {
      initializeDimensions(featureData.dimension);
      
      // Render UI components
      renderMainTabs();
      
      // Set the first tab as active
      if (appState.dimensions.length > 0) {
        setActiveMainTab(appState.dimensions[0].name);
      }
      
      // Set up event listeners
      setupEventListeners();
      
      // Display data version and source
      const sourceInfo = appState.dataSource ? ` from ${appState.dataSource.split('/').pop()}` : '';
      if (featureData.version && featureData.date) {
        showMessage(`Data version: ${featureData.version} (${featureData.date})${sourceInfo}`);
      }
      
      // Save data to chrome storage for offline use
      if (appState.isExtensionContext) {
        try {
          chrome.storage.local.set({
            [CONFIG.offlineStorageKey]: featureData,
            [CONFIG.offlineTimestampKey]: Date.now()
          });
        } catch (e) {
          console.error("Failed to cache data:", e);
        }
      }
      
      return true;
    } else {
      throw new Error("Invalid data format: missing dimension array");
    }
  } catch (error) {
    showMessage(`Error processing feature data: ${error.message}`);
    console.error("Error processing data:", error);
    showEmptyState();
    return false;
  }
}

/**
 * Initialize the dimensions data structure
 */
function initializeDimensions(dimensions) {
  appState.dimensions = dimensions;
  dimensions.forEach(dim => {
    appState.selectedFeatures[dim.name] = [];
  });
  console.log("Initialized dimensions:", appState.dimensions);
}

/**
 * Render main vertical tabs in the sidebar
 */
function renderMainTabs() {
  const $mainTabs = $('#mainTabs');
  $mainTabs.empty();

  appState.dimensions.forEach(dim => {
    const isActive = dim.name === appState.activeMainTab;
    
    // Create a generic SVG icon - no hardcoded icon mapping
    const genericIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
    
    const $tab = $(`
      <div class="main-tab ${isActive ? 'active' : ''}" data-tab="${dim.name}">
        ${isActive ? 
          '<input type="radio" name="main-tab" checked style="display:none;">' : 
          '<input type="radio" name="main-tab" style="display:none;">'}
        <span class="main-tab-icon">${genericIcon}</span>
        <span>${dim.caption || dim.name}</span>
      </div>
    `);
    $mainTabs.append($tab);
  });
}

/**
 * Render sub tabs for the selected main tab
 */
function renderSubTabs() {
  const $subTabs = $('#subTabs');
  $subTabs.empty();
  
  // Title in the header
  const activeTabName = appState.activeMainTab;
  const activeDim = appState.dimensions.find(d => d.name === activeTabName);
  
  $('#promptTitleContainer').html(`
    <h1 class="prompt-title">${activeDim ? (activeDim.caption || activeDim.name) : activeTabName}</h1>
  `);

  // Get feature types (sub tabs) for the active main tab
  const activeTabData = appState.featureData[activeTabName] || {};
  const featureTypes = activeTabData.featureTypes || [];
  
  // If no feature types, show a message
  if (featureTypes.length === 0) {
    $subTabs.html(`<div class="sub-tab-empty">No subcategories available</div>`);
    return;
  }
  
  featureTypes.forEach(featureType => {
    const isActive = featureType.name === appState.activeSubTab;
    const $tab = $(`
      <div class="sub-tab ${isActive ? 'active' : ''}" data-tab="${featureType.name}">
        ${featureType.caption || featureType.name}
      </div>
    `);
    $subTabs.append($tab);
  });
}

/**
 * Render the feature examples for the selected subtab
 */
function renderFeatureExamples() {
  const $promptExamples = $('#promptExamples');
  $promptExamples.empty();
  
  const activeTabName = appState.activeMainTab;
  const activeSubTabName = appState.activeSubTab;
  
  // If no active subtab, show message and return
  if (!activeSubTabName) {
    $promptExamples.html(`<div class="no-examples-message">No category selected</div>`);
    showNoFeatureSelected();
    return;
  }
  
  // Get features for the active sub tab
  const features = appState.featureData[activeTabName][activeSubTabName] || [];
  
  // If no features, show message
  if (features.length === 0) {
    $promptExamples.html(`<div class="no-examples-message">No features available in this category</div>`);
    showNoFeatureSelected();
    return;
  }
  
  // Render each feature example
  features.forEach(feature => {
    const isActive = appState.activeExample && feature.name === appState.activeExample.name;
    
    // Prepare image URL or fallback
    let imageUrl = feature.image || CONFIG.defaultImgSrc;
    
    const $example = $(`
      <div class="prompt-example ${isActive ? 'active' : ''}" data-feature-name="${feature.name}">
        <img src="${imageUrl}" alt="${feature.caption || feature.name}" class="prompt-example-image" onerror="this.src='${CONFIG.defaultImgSrc}'">
        <div class="prompt-example-content">
          <div class="prompt-example-title">${feature.caption || feature.name}</div>
          <div class="prompt-example-description">${truncateText(feature.prompt || feature.name, 60)}</div>
        </div>
      </div>
    `);
    $promptExamples.append($example);
  });
  
  // If no active example is set but we have features, set the first one active
  if (!appState.activeExample && features.length > 0) {
    setActiveExample(features[0]);
  }
}

/**
 * Helper function to truncate text with ellipsis
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Show "No feature selected" state
 */
function showNoFeatureSelected() {
  // Update title and preview
  $('#promptName').text('No feature selected');
  $('#previewImage').attr('src', CONFIG.defaultImgSrc);
  
  // Clear prompt and variables
  $('#promptText').text('');
  $('#variablesContainer').empty();
  
  // Update category tag
  $('.prompt-category').html(`
    <span class="prompt-category-tag">${appState.activeSubTab ? appState.activeSubTab.replace(/_/g, ' ') : ''}</span>
    <span class="separator">•</span>
    <span class="prompt-note">No reference image required</span>
  `);
}

/**
 * Render the details for the currently selected feature
 */
function renderFeatureDetails() {
  const feature = appState.activeExample;
  if (!feature) {
    showNoFeatureSelected();
    return;
  }
  
  // Update basic details
  $('#promptName').text(feature.caption || feature.name);
  
  // Show category tag
  const $categoryTag = $('.prompt-category');
  const subTabCaption = getSubTabCaption(appState.activeSubTab);
  
  $categoryTag.html(`
    <span class="prompt-category-tag">${subTabCaption}</span>
    <span class="separator">•</span>
    <span class="prompt-note">No reference image required</span>
  `);
  
  // Update prompt text
  $('#promptText').text(feature.prompt || '');
  
  // Update preview image
  $('#previewImage').attr('src', feature.image || CONFIG.defaultImgSrc);
  
  // Render variables
  const $variablesContainer = $('#variablesContainer');
  $variablesContainer.empty();
  
  // Extract variables from prompt if they exist
  const variables = extractVariablesFromPrompt(feature.prompt || '');
  
  if (variables.length > 0) {
    variables.forEach(variable => {
      const $variable = $(`
        <div class="variable-item">
          <label class="variable-label">${variable}</label>
          <input type="text" class="variable-input" data-var-name="${variable}" placeholder="Enter ${variable}">
        </div>
      `);
      $variablesContainer.append($variable);
    });
  } else {
    // If no variables found, show a placeholder
    $variablesContainer.append(`
      <div class="variable-item">
        <p class="no-variables-message">No variables to customize for this prompt.</p>
      </div>
    `);
  }
}

/**
 * Get the caption for a sub-tab by name
 */
function getSubTabCaption(subTabName) {
  const activeTabData = appState.featureData[appState.activeMainTab] || {};
  const featureTypes = activeTabData.featureTypes || [];
  const subTab = featureTypes.find(ft => ft.name === subTabName);
  
  return subTab ? (subTab.caption || subTab.name.replace(/_/g, ' ')) : (subTabName ? subTabName.replace(/_/g, ' ') : '');
}

/**
 * Extract variables from prompt text using pattern matching
 * Looks for placeholders like [variable_name]
 */
function extractVariablesFromPrompt(promptText) {
  const variableRegex = /\[([^\]]+)\]/g;
  const variables = [];
  let match;
  
  while ((match = variableRegex.exec(promptText)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Main tab click
  $(document).on('click', '.main-tab', function() {
    const tabName = $(this).data('tab');
    setActiveMainTab(tabName);
  });
  
  // Sub tab click
  $(document).on('click', '.sub-tab', function() {
    const tabName = $(this).data('tab');
    setActiveSubTab(tabName);
  });
  
  // Feature example click
  $(document).on('click', '.prompt-example', function() {
    const featureName = $(this).data('feature-name');
    const features = appState.featureData[appState.activeMainTab][appState.activeSubTab] || [];
    const feature = features.find(f => f.name === featureName);
    
    if (feature) {
      setActiveExample(feature);
    }
  });
  
  // Copy button click
  $(document).on('click', '#copyPromptBtn', function() {
    const promptText = getFormattedPrompt();
    copyToClipboard(promptText);
  });
  
  // Variable input change
  $(document).on('input', '.variable-input', function() {
    updatePromptPreview();
  });
  
  // Generate button click
  $(document).on('click', '#generateBtn', function() {
    const finalPrompt = getFormattedPrompt();
    generateWithAI(finalPrompt);
  });
  
  // Search input
  $('#searchPrompts').on('input', function() {
    const searchTerm = $(this).val().toLowerCase();
    searchFeatures(searchTerm);
  });
}

/**
 * Set the active main tab and update UI
 */
function setActiveMainTab(tabName) {
  console.log("Setting active main tab:", tabName);
  appState.activeMainTab = tabName;
  
  // Get feature types for this tab
  const tabData = appState.featureData[tabName] || {};
  const featureTypes = tabData.featureTypes || [];
  
  // Reset active example
  appState.activeExample = null;
  
  // Set first sub tab as active if available
  if (featureTypes.length > 0) {
    appState.activeSubTab = featureTypes[0].name;
    console.log("Setting first sub tab:", appState.activeSubTab);
  } else {
    appState.activeSubTab = '';
    console.log("No sub tabs available");
  }
  
  // Update UI
  renderMainTabs();
  renderSubTabs();
  renderFeatureExamples();
  renderFeatureDetails();
  
  // Save state to chrome storage
  if (appState.isExtensionContext) {
    try {
      chrome.storage.local.set({
        'last_active_tab': tabName
      });
    } catch (e) {
      console.log("Error saving tab state:", e);
    }
  }
}

/**
 * Set the active sub tab and update UI
 */
function setActiveSubTab(tabName) {
  console.log("Setting active sub tab:", tabName);
  appState.activeSubTab = tabName;
  
  // Reset active example
  appState.activeExample = null;
  
  // Update UI
  renderSubTabs();
  renderFeatureExamples();
  renderFeatureDetails();
  
  // Save state to chrome storage
  if (appState.isExtensionContext) {
    try {
      chrome.storage.local.set({
        'last_active_subtab': tabName
      });
    } catch (e) {
      console.log("Error saving subtab state:", e);
    }
  }
}

/**
 * Set the active feature example and update UI
 */
function setActiveExample(feature) {
  console.log("Setting active example:", feature.name);
  appState.activeExample = feature;
  
  // Update UI
  renderFeatureExamples();
  renderFeatureDetails();
  
  // Save state to chrome storage
  if (appState.isExtensionContext) {
    try {
      chrome.storage.local.set({
        'last_active_example': feature.name
      });
    } catch (e) {
      console.log("Error saving example state:", e);
    }
  }
}

/**
 * Update the prompt preview with variable values
 */
function updatePromptPreview() {
  const promptText = $('#promptText');
  const originalPrompt = appState.activeExample?.prompt || '';
  
  // Replace variable placeholders with input values
  let formattedPrompt = originalPrompt;
  
  $('.variable-input').each(function() {
    const varName = $(this).data('var-name');
    const varValue = $(this).val();
    
    if (varValue) {
      formattedPrompt = formattedPrompt.replace(`[${varName}]`, varValue);
    }
  });
  
  promptText.text(formattedPrompt);
}

/**
 * Get the formatted prompt with variables replaced
 */
function getFormattedPrompt() {
  return $('#promptText').text() || '';
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  if (!text) {
    showMessage('No prompt to copy');
    return;
  }
  
  // Use Chrome API if available
  if (appState.isExtensionContext && chrome.clipboard) {
    chrome.clipboard.writeText(text)
      .then(() => {
        showCopiedFeedback();
      })
      .catch(err => {
        console.error('Failed to copy using Chrome API:', err);
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
  
  // Fallback copy method
  function fallbackCopy() {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      // Execute copy command
      const successful = document.execCommand('copy');
      if (successful) {
        showCopiedFeedback();
      } else {
        console.error('execCommand copy failed');
        showMessage('Failed to copy to clipboard');
      }
    } catch (err) {
      console.error('execCommand error:', err);
      showMessage('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textarea);
  }
  
  // Visual feedback function
  function showCopiedFeedback() {
    const $btn = $('#copyPromptBtn');
    const originalText = $btn.text();
    $btn.text('Copied!');
    setTimeout(() => $btn.text(originalText), 1500);
  }
}

/**
 * Search feature examples
 */
function searchFeatures(searchTerm) {
  if (!searchTerm) {
    // Show all examples if search is empty
    $('.prompt-example').show();
    return;
  }
  
  // Filter examples based on search term
  $('.prompt-example').each(function() {
    const $example = $(this);
    const title = $example.find('.prompt-example-title').text().toLowerCase();
    const description = $example.find('.prompt-example-description').text().toLowerCase();
    
    const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
    $example.toggle(matchesSearch);
  });
}

/**
 * Generate image with AI
 * In Chrome extension context, this could open a new tab or communicate with an API
 */
/**
 * Generate image with AI
 * Simplified version that just copies the prompt and opens ChatGPT
 */
function generateWithAI(prompt) {
  if (!prompt) {
    showMessage('Please select a prompt before generating');
    return;
  }
  
  console.log('Generating with prompt:', prompt);
  
  // Copy the prompt to clipboard
  copyToClipboard(prompt);
  
  // Show message that prompt was copied
  showMessage('Prompt copied to clipboard. Opening GPT-4o...');
  
  // Open ChatGPT in a new tab without trying to prefill the prompt
  try {
    // Check if we're in extension context
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({
        url: "https://chat.openai.com/?model=gpt-4o"
      });
    } else {
      // Not in extension context, just open in a new tab
      window.open("https://chat.openai.com/?model=gpt-4o", "_blank");
    }
  } catch (e) {
    console.error("Error opening new tab:", e);
    showMessage('Prompt copied. Please paste it into GPT-4o manually.');
  }
}

/**
 * Display a message to the user
 */
function showMessage(message) {
  // Create message element if it doesn't exist
  if ($('#message-box').length === 0) {
    $('body').append('<div id="message-box" class="message-box"></div>');
  }
  
  const $messageBox = $('#message-box');
  $messageBox.text(message).fadeIn();
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    $messageBox.fadeOut();
  }, 3000);
}

/**
 * Copy text to clipboard with better extension support
 */
function copyToClipboard(text) {
  if (!text) {
    showMessage('No prompt to copy');
    return;
  }
  
  const isExtensionContext = typeof chrome !== 'undefined' && chrome.runtime;
  
  // Method 1: Try using the Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showCopiedFeedback();
      })
      .catch(err => {
        console.error('Clipboard API error:', err);
        fallbackToMethod2();
      });
  } else {
    fallbackToMethod2();
  }
  
  // Method 2: Try using chrome.tabs.executeScript for extension context
  function fallbackToMethod2() {
    if (isExtensionContext && chrome.tabs) {
      try {
        // Create a temporary background script function
        chrome.runtime.sendMessage(
          { action: "copyToClipboard", text: text },
          function(response) {
            if (response && response.success) {
              showCopiedFeedback();
            } else {
              fallbackToMethod3();
            }
          }
        );
      } catch (e) {
        console.error('Chrome runtime error:', e);
        fallbackToMethod3();
      }
    } else {
      fallbackToMethod3();
    }
  }
  
  // Method 3: Old-school execCommand method
  function fallbackToMethod3() {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Make the textarea non-editable to avoid focus issues
      textarea.setAttribute('readonly', '');
      
      // Make it invisible
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      
      document.body.appendChild(textarea);
      
      // On iOS, select has to happen after the element is added to the DOM
      textarea.focus();
      textarea.select();
      
      // Execute the copy command
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        showCopiedFeedback();
      } else {
        console.error('execCommand copy failed');
        showMessage('Failed to copy to clipboard');
      }
    } catch (err) {
      console.error('Fallback clipboard error:', err);
      showMessage('Failed to copy to clipboard. Please try selecting and copying manually.');
    }
  }
  
  // Visual feedback function
  function showCopiedFeedback() {
    const $btn = $('#copyPromptBtn');
    const originalText = $btn.text();
    $btn.text('Copied!');
    setTimeout(() => $btn.text(originalText), 1500);
  }
}