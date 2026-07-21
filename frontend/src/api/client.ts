const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('moneypal_token');
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired — clear session and force re-login
    localStorage.removeItem('moneypal_token');
    localStorage.removeItem('moneypal_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return {} as Promise<T>;
}

export function getExportUrl(start?: string, end?: string): string {
  const token = getToken();
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (token) params.append('token', token); // fallback for direct URL downloads
  const query = params.toString();
  return `${BASE_URL}/export/csv${query ? `?${query}` : ''}`;
}
