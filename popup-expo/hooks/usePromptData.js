import { useState, useEffect } from 'react';
import axios from 'axios';

// Configuration
const CONFIG = {
  feature_url: "https://raw.githubusercontent.com/Asukaz/mjprompter/refs/heads/main/popup/gpt4o-prompt-samples.json",
  fallbackImageSource: require('../assets/fallback.png')
};

export default function usePromptData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(CONFIG.feature_url);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return { data, loading, error };
}