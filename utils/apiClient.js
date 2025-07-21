import { notify } from '../components/ui/NotificationSystem';
import { getCookie } from './cookies';

// Default configuration
const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 2,
  retryDelay: 1000, // 1 second
  showErrorNotifications: true,
  showSuccessNotifications: false,
};

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  AUTH: 'AUTH',
  SERVER: 'SERVER',
  RATE_LIMIT: 'RATE_LIMIT',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN',
};

// Custom error class
export class ApiError extends Error {
  constructor(message, type, status, response) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.response = response;
  }
}

// Helper function to determine error type
function getErrorType(error, response) {
  if (!navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (error.name === 'AbortError') {
    return ERROR_TYPES.TIMEOUT;
  }
  
  if (response) {
    if (response.status === 401 || response.status === 403) {
      return ERROR_TYPES.AUTH;
    }
    if (response.status === 429) {
      return ERROR_TYPES.RATE_LIMIT;
    }
    if (response.status >= 400 && response.status < 500) {
      return ERROR_TYPES.VALIDATION;
    }
    if (response.status >= 500) {
      return ERROR_TYPES.SERVER;
    }
  }
  
  return ERROR_TYPES.UNKNOWN;
}

// Helper function to get user-friendly error message
function getUserFriendlyErrorMessage(error, type) {
  switch (type) {
    case ERROR_TYPES.NETWORK:
      return 'Please check your internet connection and try again.';
    case ERROR_TYPES.TIMEOUT:
      return 'The request took too long to complete. Please try again.';
    case ERROR_TYPES.AUTH:
      return 'Your session has expired. Please refresh the page and log in again.';
    case ERROR_TYPES.RATE_LIMIT:
      return 'Too many requests. Please wait a moment before trying again.';
    case ERROR_TYPES.SERVER:
      return 'Our servers are experiencing issues. Please try again later.';
    case ERROR_TYPES.VALIDATION:
      return error.message || 'Please check your input and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Sleep utility for retries
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main API client function
export async function apiRequest(url, options = {}, config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const controller = new AbortController();
  
  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);
  
  // Prepare request options
  const requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  // Add authentication token if available
  const token = getCookie('token');
  if (token && token !== 'undefined') {
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }

  let lastError;
  let response;

  // Retry logic
  for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
    try {
      response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle rate limiting with retry-after
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter && attempt < finalConfig.retries) {
          const delay = parseInt(retryAfter) * 1000;
          await sleep(Math.min(delay, 10000)); // Max 10 second delay
          continue;
        }
      }

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Check if response indicates success
      if (response.ok) {
        // Show success notification if configured
        if (finalConfig.showSuccessNotifications && finalConfig.successMessage) {
          notify.success('Success', finalConfig.successMessage);
        }
        return data;
      } else {
        // Handle server errors
        const errorType = getErrorType(null, response);
        const errorMessage = data?.message || data?.error || response.statusText;
        
        throw new ApiError(
          errorMessage,
          errorType,
          response.status,
          data
        );
      }
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof ApiError) {
        if (error.type === ERROR_TYPES.AUTH || error.type === ERROR_TYPES.VALIDATION) {
          break;
        }
      }

      // Don't retry on the last attempt
      if (attempt === finalConfig.retries) {
        break;
      }

      // Wait before retrying
      await sleep(finalConfig.retryDelay * (attempt + 1));
    }
  }

  // Handle the final error
  const errorType = lastError instanceof ApiError 
    ? lastError.type 
    : getErrorType(lastError, response);
  
  const finalError = lastError instanceof ApiError 
    ? lastError 
    : new ApiError(lastError.message, errorType, response?.status, null);

  // Show error notification if configured
  if (finalConfig.showErrorNotifications) {
    const userMessage = getUserFriendlyErrorMessage(finalError, errorType);
    
    notify.error(
      'Request Failed',
      userMessage,
      {
        duration: errorType === ERROR_TYPES.AUTH ? 10000 : 6000,
        autoClose: errorType !== ERROR_TYPES.AUTH,
      }
    );
  }

  // Handle authentication errors specially
  if (errorType === ERROR_TYPES.AUTH) {
    // Clear the invalid token
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  }

  throw finalError;
}

// Convenience methods for different HTTP methods
export const api = {
  get: (url, config = {}) => apiRequest(url, { method: 'GET' }, config),
  
  post: (url, data = {}, config = {}) => apiRequest(url, {
    method: 'POST',
    body: typeof data === 'string' ? data : JSON.stringify(data),
  }, config),
  
  put: (url, data = {}, config = {}) => apiRequest(url, {
    method: 'PUT',
    body: typeof data === 'string' ? data : JSON.stringify(data),
  }, config),
  
  delete: (url, config = {}) => apiRequest(url, { method: 'DELETE' }, config),
  
  patch: (url, data = {}, config = {}) => apiRequest(url, {
    method: 'PATCH',
    body: typeof data === 'string' ? data : JSON.stringify(data),
  }, config),
};

// Legacy fetch wrapper for existing code that uses old patterns
export async function safeFetch(url, options = {}, showNotifications = true) {
  try {
    return await apiRequest(url, options, {
      showErrorNotifications: showNotifications,
    });
  } catch (error) {
    if (!showNotifications) {
      throw error;
    }
    // Error notification already shown by apiRequest
    return null;
  }
}

// Helper for Discord API calls specifically
export const discordApi = {
  async getUser(token) {
    return api.get('https://discordapp.com/api/users/@me', {
      showErrorNotifications: false, // Handle errors manually for auth flow
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });
  },

  async getUserGuilds(token) {
    return api.get('https://discordapp.com/api/v6/users/@me/guilds', {
      showErrorNotifications: false, // Handle errors manually for auth flow
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });
  },
};

export default api;