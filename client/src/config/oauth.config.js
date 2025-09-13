// OAuth Configuration
export const OAUTH_CONFIG = {
  // Base URLs
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
  
  // OAuth Endpoints - Fixed to match backend routing
  GOOGLE_OAUTH_URL: '/api/v1/auth/oauth/google',
  FACEBOOK_OAUTH_URL: '/api/v1/auth/oauth/facebook',
  TWITTER_OAUTH_URL: '/api/v1/auth/oauth/twitter',
  
  // Callback URLs
  SUCCESS_CALLBACK_URL: '/oauth-success',
  ERROR_CALLBACK_URL: '/oauth-error',
  
  // OAuth Scopes
  GOOGLE_SCOPES: ['profile', 'email'],
  FACEBOOK_SCOPES: ['email'],
  TWITTER_SCOPES: []
};

// Helper function to build OAuth URLs
export const buildOAuthUrl = (provider) => {
  const baseUrl = OAUTH_CONFIG.API_BASE_URL;
  
  switch (provider) {
    case 'google':
      return `${baseUrl}${OAUTH_CONFIG.GOOGLE_OAUTH_URL}`;
    case 'facebook':
      return `${baseUrl}${OAUTH_CONFIG.FACEBOOK_OAUTH_URL}`;
    case 'twitter':
      return `${baseUrl}${OAUTH_CONFIG.TWITTER_OAUTH_URL}`;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

// Helper function to get callback URL
export const getCallbackUrl = (type = 'success') => {
  const baseUrl = OAUTH_CONFIG.FRONTEND_URL;
  
  if (type === 'success') {
    return `${baseUrl}${OAUTH_CONFIG.SUCCESS_CALLBACK_URL}`;
  } else if (type === 'error') {
    return `${baseUrl}${OAUTH_CONFIG.ERROR_CALLBACK_URL}`;
  }
  
  throw new Error(`Invalid callback type: ${type}`);
}; 