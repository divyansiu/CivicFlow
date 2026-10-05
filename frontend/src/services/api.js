/**
 * Base API Client for CivicFlow
 * Connects frontend to the CivicFlow FastAPI Backend (Member 3 API contract).
 * Handles baseUrl, query parameters, network timeouts, and JSON parsing.
 */

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Custom API Error class preserving status code and backend error details
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Builds full URL with optional query string
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, String(val));
    }
  });
  return url.toString();
}

/**
 * Base fetch wrapper with timeout and standardized error handling
 */
async function request(endpoint, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : {};
    }

    if (!response.ok) {
      const errorMsg = data?.detail || `HTTP Error ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out while contacting backend server.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network error: Unable to reach backend API.', 0);
  }
}

export const apiClient = {
  baseUrl: BASE_URL,

  async get(endpoint, params = {}) {
    const url = buildUrl(endpoint, params);
    return request(url, { method: 'GET' });
  },

  async post(endpoint, data = {}) {
    const url = buildUrl(endpoint);
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkHealth() {
    try {
      // Backend exposes /api/health and /health
      return await this.get('/health');
    } catch {
      return null;
    }
  }
};

export default apiClient;
