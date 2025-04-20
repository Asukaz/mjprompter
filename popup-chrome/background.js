/**
 * AI Image Prompter - Chrome Extension
 * Simplified Background Script
 */

// Initialize settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default configuration
  chrome.storage.sync.set({
    // Default data source
    feature_url: "https://raw.githubusercontent.com/Asukaz/mjprompter/refs/heads/main/popup/gpt4o-prompt-samples.json",
    // Cache settings
    cache_enabled: true
  }, () => {
    console.log("AI Image Prompter initialized with default settings");
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle fetch data request
  if (message.action === "fetchFeatureData") {
    fetch(message.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({success: true, data: data});
      })
      .catch(error => {
        console.error("Error fetching feature data:", error);
        sendResponse({success: false, error: error.message});
      });
    return true; // Indicates we'll respond asynchronously
  }
  
  // Handle clipboard copy requests
  else if (message.action === "copyToClipboard") {
    try {
      // Use the clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message.text)
          .then(() => {
            sendResponse({success: true});
          })
          .catch(err => {
            console.error("Clipboard API error:", err);
            
            // Fall back to execCommand
            try {
              // Create a temporary text area in the background page
              const textarea = document.createElement('textarea');
              textarea.value = message.text;
              document.body.appendChild(textarea);
              textarea.select();
              
              const success = document.execCommand('copy');
              document.body.removeChild(textarea);
              
              sendResponse({success: success});
            } catch (e) {
              sendResponse({success: false, error: e.message});
            }
          });
        
        return true; // Will respond asynchronously
      } else {
        // Fall back to execCommand if Clipboard API not available
        const textarea = document.createElement('textarea');
        textarea.value = message.text;
        document.body.appendChild(textarea);
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        sendResponse({success: success});
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      sendResponse({success: false, error: error.message});
    }
    
    return true; // Indicates we'll respond asynchronously
  }
});