import * as Clipboard from 'expo-clipboard';

export function extractVariablesFromPrompt(promptText) {
  if (!promptText) return [];
  
  const variableRegex = /\[([^\]]+)\]/g;
  const variables = [];
  let match;
  
  while ((match = variableRegex.exec(promptText)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

export async function copyToClipboard(text) {
  if (text) {
    await Clipboard.setStringAsync(text);
    return true;
  }
  return false;
}