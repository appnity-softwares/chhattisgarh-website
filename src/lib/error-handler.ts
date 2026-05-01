import { ZodError } from 'zod';

export interface UserFriendlyError {
  message: string;
  isUserFriendly: boolean;
  originalError?: unknown;
}

export function handleApiError(error: unknown): UserFriendlyError {
  // If it's already a user-friendly error, return it
  if (error && typeof error === 'object' && 'isUserFriendly' in error) {
    return error as UserFriendlyError;
  }

  // Handle different error types
  if (error instanceof ZodError) {
    return {
      message: 'Invalid data provided. Please check your input and try again.',
      isUserFriendly: true,
      originalError: error
    };
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // JWT/Authentication errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return {
        message: 'Session expired. Please login again.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Permission errors
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return {
        message: 'Access denied. You don\'t have permission to perform this action.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Not found errors
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return {
        message: 'The requested resource was not found.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Rate limit errors
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return {
        message: 'Server error. Please try again later.',
        isUserFriendly: true,
        originalError: error
      };
    }

    // Generic validation errors
    if (error.message.includes('validation') || error.message.includes('required')) {
      return {
        message: 'Please check your input and try again.',
        isUserFriendly: true,
        originalError: error
      };
    }
  }

  // Handle axios errors with response data
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as unknown;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (data?.message) {
      return {
        message: data.message,
        isUserFriendly: true,
        originalError: error
      };
    }

    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          message: 'Invalid request. Please check your input.',
          isUserFriendly: true,
          originalError: error
        };
      case 401:
        return {
          message: 'Session expired. Please login again.',
          isUserFriendly: true,
          originalError: error
        };
      case 403:
        return {
          message: 'Access denied. You don\'t have permission to perform this action.',
          isUserFriendly: true,
          originalError: error
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          isUserFriendly: true,
          originalError: error
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          isUserFriendly: true,
          originalError: error
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again later.',
          isUserFriendly: true,
          originalError: error
        };
      default:
        return {
          message: 'An error occurred. Please try again.',
          isUserFriendly: true,
          originalError: error
        };
    }
  }

  // Fallback for unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    isUserFriendly: true,
    originalError: error
  };
}

// Development-only error logging
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    const prefix = context ? ` (${context})` : ':';
    console.error(`[ERROR]${prefix}`, error);
  } else {
    // In production, you might want to send to error tracking service
    // errorTracking.captureException(error, { context });
  }
}

// Safe error handler that returns user-friendly message
export function getErrorMessage(error: unknown): string {
  const handled = handleApiError(error);
  return handled.message;
}
