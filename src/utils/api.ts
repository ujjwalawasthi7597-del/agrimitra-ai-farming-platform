const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('agrimitra_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('agrimitra_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('agrimitra_token');
  localStorage.removeItem('agrimitra_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  getDbStatus: () => request<{ database: string; connected: boolean; readyState: number; host: string | null; error: string | null }>('/db-status'),
  auth: {
    login: (credentials: any) => request<{ message: string; token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => request<{ message: string; token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request<{ user: any }>('/auth/me'),
    updateProfile: (data: any) => request<{ message: string; user: any }>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  farms: {
    getAll: () => request<{ farms: any[] }>('/farms'),
    create: (farm: any) => request<any>('/farms', { method: 'POST', body: JSON.stringify(farm) }),
    update: (id: string, farm: any) => request<any>(`/farms/${id}`, { method: 'PUT', body: JSON.stringify(farm) }),
    delete: (id: string) => request<any>(`/farms/${id}`, { method: 'DELETE' }),
  },
  crops: {
    getAll: () => request<{ crops: any[] }>('/crops'),
    create: (crop: any) => request<any>('/crops', { method: 'POST', body: JSON.stringify(crop) }),
    update: (id: string, crop: any) => request<any>(`/crops/${id}`, { method: 'PUT', body: JSON.stringify(crop) }),
    delete: (id: string) => request<any>(`/crops/${id}`, { method: 'DELETE' }),
    getCalendar: () => request<{ activities: any[] }>('/crops/calendar/all'),
    addActivity: (activity: any) => request<any>('/crops/calendar/activity', { method: 'POST', body: JSON.stringify(activity) }),
    updateActivity: (id: string, data: any) => request<any>(`/crops/calendar/activity/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteActivity: (id: string) => request<any>(`/crops/calendar/activity/${id}`, { method: 'DELETE' }),
  },
  disease: {
    getSamples: () => request<{ samples: any[] }>('/disease-detection/samples'),
    analyze: (payload: { imageBase64?: string; sampleId?: string; cropNameHint?: string; preferredLanguage?: string }) =>
      request<{ success: boolean; report: any }>('/disease-detection/analyze', { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: () => request<{ reports: any[] }>('/disease-detection/history'),
    deleteReport: (id: string) => request<any>(`/disease-detection/${id}`, { method: 'DELETE' }),
  },
  ai: {
    chat: (payload: { message: string; conversationHistory?: any[]; preferredLanguage?: string }) =>
      request<{ reply: string; timestamp: string }>('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: () => request<{ conversations: any[] }>('/ai/history'),
    clearHistory: () => request<any>('/ai/history', { method: 'DELETE' }),
  },
  weather: {
    get: (district?: string) => request<any>(`/weather${district ? `?district=${encodeURIComponent(district)}` : ''}`),
    getLocations: () => request<{ locations: any[] }>('/weather/locations'),
  },
  irrigation: {
    calculate: (params: any) => request<any>('/irrigation/calculate', { method: 'POST', body: JSON.stringify(params) }),
  },
  finance: {
    getExpenses: () => request<{ expenses: any[] }>('/finance/expenses'),
    createExpense: (expense: any) => request<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(expense) }),
    deleteExpense: (id: string) => request<any>(`/finance/expenses/${id}`, { method: 'DELETE' }),
    getHarvests: () => request<{ harvests: any[] }>('/finance/harvests'),
    createHarvest: (harvest: any) => request<any>('/finance/harvests', { method: 'POST', body: JSON.stringify(harvest) }),
    deleteHarvest: (id: string) => request<any>(`/finance/harvests/${id}`, { method: 'DELETE' }),
    getAnalytics: () => request<any>('/finance/analytics/summary'),
  },
  schemes: {
    getAll: (params?: { category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.search) q.append('search', params.search);
      return request<{ schemes: any[] }>(`/schemes?${q.toString()}`);
    },
    getOne: (id: string) => request<{ scheme: any }>(`/schemes/${id}`),
    ask: (question: string, preferredLanguage?: string) =>
      request<{ answer: string; sourceLinks: string[] }>('/schemes/ask', {
        method: 'POST',
        body: JSON.stringify({ question, preferredLanguage }),
      }),
  },
  consultations: {
    getAll: () => request<{ consultations: any[] }>('/consultations'),
    create: (ticket: any) => request<any>('/consultations', { method: 'POST', body: JSON.stringify(ticket) }),
    update: (id: string, data: any) => request<any>(`/consultations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
};
