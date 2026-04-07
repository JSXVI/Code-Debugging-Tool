/**
 * API Utilities for Lumina AI
 * Implements robust error handling and retry mechanisms
 */

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Categorizes API errors into user-friendly messages
 */
export function getErrorMessage(error: any): string {
  console.error('Detailed API Error:', error);

  const message = (error?.message || error?.toString() || '').toLowerCase();
  const status = error?.status || error?.code || error?.httpCode;

  // Empty / missing API key
  if (!process.env.GEMINI_API_KEY || message.includes('api key not valid') || message.includes('api_key_invalid') || message.includes('invalid_argument') || (message.includes('400') && message.includes('key'))) {
    return "### 🔑 Authentication Error\nThe API key is missing or invalid. Please check the environment configuration on Vercel (`GEMINI_API_KEY`)."
  }

  // Rate limiting
  if (status === 429 || message.includes('429') || message.includes('quota') || message.includes('rate limit') || message.includes('resource_exhausted')) {
    return "### ⏳ Rate Limit Exceeded\nYou've reached the current API quota. Please wait a moment before sending another message.";
  }

  // Safety filters
  if (message.includes('safety') || message.includes('blocked') || message.includes('harm')) {
    return "### 🛡️ Content Filtered\nThe request was blocked by safety filters. Please try rephrasing your prompt.";
  }

  // Authentication issues
  if (status === 401 || message.includes('401') || message.includes('unauthorized') || message.includes('unauthenticated')) {
    return "### 🔑 Authentication Error\nInvalid API key detected. Please check your environment configuration.";
  }

  // Permission issues
  if (status === 403 || message.includes('403') || message.includes('permission_denied') || message.includes('forbidden')) {
    if (message.includes('googlesearch') || message.includes('tool')) {
      return "### 🚫 Tool Restricted\nThe Google Search tool is restricted for this API key. Try sending a normal message without the `/search` command.";
    }
    return "### 🚫 Permission Denied\nThe neural engine has restricted access. This usually happens if the model (Gemini 3) or a specific feature is not yet enabled for your API key or region.";
  }

  // Model availability
  if (status === 404 || message.includes('not found for api') || message.includes('not_found') || (message.includes('404') && !message.includes('page'))) {
    return "### 🛰️ Model Unavailable\nThe neural engine is currently unreachable or the model version has changed. Please try again.";
  }

  // Token limits
  if (message.includes('limit') || message.includes('token') || message.includes('context') || message.includes('too long')) {
    return "### 📊 Context Limit Reached\nThe conversation history is too long. Try starting a new chat.";
  }

  // Network / transient issues
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout') || message.includes('econnreset') || message.includes('503') || message.includes('502') || message.includes('service unavailable')) {
    return "### 🌐 Network Instability\nI'm having trouble reaching the neural network. Please check your internet connection or try again.";
  }

  // Default fallback
  return `### ⚠️ Neural Engine Error\nAn unexpected error occurred: ${error?.message || 'Unknown error'}. Please try again.`;
}

/**
 * Exponential backoff retry wrapper
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors (4xx except 429/408)
      const status = error?.status || error?.code;
      const isTransient = 
        !status || 
        status === 429 || 
        status === 408 || 
        status >= 500 ||
        error.message?.includes('fetch') ||
        error.message?.includes('network');

      if (!isTransient || attempt === maxRetries - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`API attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
