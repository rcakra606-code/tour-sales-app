// Configuration for different environments
const CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    FRONTEND_URL: 'http://localhost:8080'
  },
  production: {
    API_BASE_URL: '/api',
    FRONTEND_URL: window.location.origin
  }
};

const ENVIRONMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'development' 
  : 'production';

const CURRENT_CONFIG = CONFIG[ENVIRONMENT];
window.APP_CONFIG = CURRENT_CONFIG;
