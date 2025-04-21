// src/api/promptService.js
import axios from 'axios';

const CONFIG = {
  feature_url: "https://raw.githubusercontent.com/Asukaz/mjprompter/refs/heads/main/popup/gpt4o-prompt-samples.json",
  defaultImgSrc: require('../assets/images/fallback.png')
};

export const fetchFeatureData = async () => {
  try {
    const response = await axios.get(CONFIG.feature_url);
    return response.data;
  } catch (error) {
    console.error("Failed to load data:", error);
    throw error;
  }
};