// src/utils/promptUtils.js
export const extractVariablesFromPrompt = (promptText) => {
    const variableRegex = /\[([^\]]+)\]/g;
    const variables = [];
    let match;
    
    while ((match = variableRegex.exec(promptText)) !== null) {
      variables.push(match[1]);
    }
    
    return [...new Set(variables)]; // Remove duplicates
  };
  
  // src/utils/clipboardUtils.js
  import Clipboard from '@react-native-clipboard/clipboard';
  
  export const copyToClipboard = (text) => {
    Clipboard.setString(text);
  };