import { notify } from '../components/ui/NotificationSystem';

let isInitialized = false;

export function initializeGlobalErrorHandling() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Don't show notifications for development hot reload errors
    if (process.env.NODE_ENV === 'development' && 
        event.reason?.message?.includes('Loading chunk')) {
      return;
    }

    // Don't show notifications for network errors that might be handled elsewhere
    if (event.reason?.name === 'NetworkError' || 
        event.reason?.name === 'TypeError' && event.reason?.message?.includes('fetch')) {
      return;
    }

    // Show user-friendly notification
    notify.error(
      'Unexpected Error',
      'Something went wrong in the background. The page should continue to work normally.',
      {
        duration: 6000,
      }
    );

    // Prevent the default browser error logging
    event.preventDefault();
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Skip script loading errors and other non-critical errors
    if (event.filename && 
        (event.filename.includes('_next') || 
         event.filename.includes('webpack') ||
         event.message.includes('Loading chunk'))) {
      return;
    }

    // Only show notifications for actual application errors
    if (event.error && event.error.stack) {
      notify.error(
        'Application Error',
        'A JavaScript error occurred. Please refresh the page if you experience issues.',
        {
          duration: 8000,
        }
      );
    }
  });

  // Handle fetch failures that weren't caught
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      // Log the error for debugging
      console.error('Uncaught fetch error:', error, 'URL:', args[0]);
      
      // Re-throw the error so it can be handled by the calling code
      throw error;
    });
  };

  isInitialized = true;
}

export function handleCriticalError(error, context = '') {
  console.error(`Critical error${context ? ` in ${context}` : ''}:`, error);
  
  notify.error(
    'Critical Error',
    `A critical error occurred${context ? ` in ${context}` : ''}. Please refresh the page.`,
    {
      duration: 10000,
      autoClose: false,
    }
  );
}

export default initializeGlobalErrorHandling;