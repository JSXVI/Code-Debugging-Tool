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

  // Handle standard error objects
  const message = error?.message || '';
  const status = error?.status || error?.code;

  // Rate limiting
  if (status === 429 || message.includes('429') || message.includes('quota')) {
    return "### ⏳ Rate Limit Exceeded\nYou've reached the current API quota. Please wait a moment before sending another message.";
  }

  // Safety filters
  if (message.includes('SAFETY') || message.includes('blocked')) {
    return "### 🛡️ Content Filtered\nThe request was blocked by safety filters. Please try rephrasing your prompt.";
  }

  // Authentication issues
  if (status === 401 || message.includes('API_KEY_INVALID')) {
    return "### 🔑 Authentication Error\nInvalid API key detected. Please check your environment configuration.";
  }

  // Permission issues
  if (status === 403 || message.includes('PERMISSION_DENIED')) {
    if (message.includes('googleSearch') || message.includes('tool')) {
      return "### 🚫 Tool Restricted\nThe Google Search tool is restricted for this API key. Try sending a normal message without the `/search` command.";
    }
    return "### 🚫 Permission Denied\nThe neural engine has restricted access. This usually happens if the model (Gemini 3) or a specific feature is not yet enabled for your API key or region.";
  }

  // Model availability
  if (status === 404 || message.includes('NOT_FOUND')) {
    return "### 🛰️ Model Unavailable\nThe neural engine is currently unreachable or the model version has changed. Retrying...";
  }

  // Token limits
  if (message.includes('limit') || message.includes('token')) {
    return "### 📊 Context Limit Reached\nThe conversation history is too long for the current model. Try starting a new chat.";
  }

  // Network/Transient issues
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return "### 🌐 Network Instability\nI'm having trouble reaching the neural network. Please check your internet connection.";
  }

  // Default fallback
  return "### ⚠️ Neural Engine Error\nAn unexpected error occurred while processing your request. I'm attempting to recover...";
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
