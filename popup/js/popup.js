/**
 * AI Image Prompter - Chrome Extension
 * Vertical tab-based navigation with no hardcoded elements
 */

// Configuration
const CONFIG = {
  feature_url: "https://raw.githubusercontent.com/Asukaz/mjprompter/refs/heads/main/popup/gpt4o-prompt-samples.json",
  // Alternative path for local testing
  local_feature_url: "conf/gpt4o-prompt-samples.json",
  defaultImgSrc: "images/fallback.png"
};

// App state
let appState = {
  featureData: null,
  dimensions: [],
  selectedFeatures: {},
  activeMainTab: '',
  activeSubTab: '',
  activeExample: null
};

// Initialize app when document is ready
$(document).ready(function() {
  // Load the data from the URL
  fetchFeatureData();
});

/**
 * Fetch feature data from JSON configuration
 */
function fetchFeatureData() {
  $.ajax({
    url: CONFIG.feature_url,
    success: handleFeatureData,
    error: function(xhr, status, error) {
      // Try to load local file if remote fails
      console.error("Failed to load remote data:", error);
      
      $.ajax({
        url: CONFIG.local_feature_url,
        success: handleFeatureData,
        error: function(xhr, status, error) {
          // If both remote and local fail, show error
          console.error("Failed to load local data:", error);
          showMessage("Failed to load feature data. Please check your connection.");
          // No hardcoded fallback - just show error state
          showEmptyState();
        }
      });
    }
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
function handleFeatureData(data, status) {
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
      
      // Display data version
      if (featureData.version && featureData.date) {
        showMessage(`Data version: ${featureData.version} (${featureData.date})`);
      }
    } else {
      throw new Error("Invalid data format: missing dimension array");
    }
  } catch (error) {
    showMessage(`Error processing feature data: ${error.message}`);
    console.error("Error processing data:", error);
    showEmptyState();
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
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // Temporary visual feedback
      const $btn = $('#copyPromptBtn');
      const originalText = $btn.text();
      $btn.text('Copied!');
      setTimeout(() => $btn.text(originalText), 1500);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showMessage('Failed to copy to clipboard');
    });
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
 * Generate image with AI (placeholder function)
 */
function generateWithAI(prompt) {
  if (!prompt) {
    showMessage('Please select a prompt before generating');
    return;
  }
  
  console.log('Generating with prompt:', prompt);
  showMessage('Generating image with prompt: ' + truncateText(prompt, 30));
  // In a real implementation, this would call an API
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
