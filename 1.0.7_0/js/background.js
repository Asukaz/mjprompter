
console.log('Extension "Image Prompter" starts ...');

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getCurrentTabUrl') {
      // Use the tabs API to get the current tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // Send the URL back to the content script
        sendResponse({ url: tabs[0].url });
      });
      // Return true to indicate that the response will be sent asynchronously
      return true;
    }
});