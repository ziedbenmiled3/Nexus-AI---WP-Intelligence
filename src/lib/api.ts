import axios from 'axios';

const api = axios.create({
  timeout: 600000, // 600 seconds (10 minutes) for heavy AI processing
});

api.interceptors.request.use(
  (config) => {
    try {
      const userEmail = localStorage.getItem('nexus_user_email');
      if (userEmail) {
        config.headers['x-user-email'] = userEmail;
      }

      const savedConfig = localStorage.getItem('wp_config');
      if (savedConfig) {
        const wpConfig = JSON.parse(savedConfig);
        if (wpConfig.geminiApiKey) {
          config.headers['x-gemini-key'] = wpConfig.geminiApiKey;
        }
      }
    } catch (e) {
      console.warn('Could not attach custom gemini key from local storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const serverError = error.response.data.error;
      const suggestion = error.response.data.suggestion;
      
      let message = serverError || error.message;
      if (suggestion) {
        message += `\n\nSuggestion: ${suggestion}`;
      }
      
      error.message = message;
    }
    return Promise.reject(error);
  }
);

export default api;
