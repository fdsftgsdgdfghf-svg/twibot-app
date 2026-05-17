import type {
  CatalogResponse,
  ChatDetail,
  LikeResponse,
  ReportResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

function authHeaders(): Record<string, string> {
  const raw = sessionStorage.getItem('twibot_user_id');
  if (!raw) return {};
  return { 'X-User-Id': raw };
}

export function fetchCatalog(
  categories: number[],
  sort: string,
  limit: number,
  offset: number,
): Promise<CatalogResponse> {
  const params = new URLSearchParams();
  if (categories.length) params.set('categories', categories.join(','));
  params.set('sort', sort);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return request<CatalogResponse>(`/api/catalog/chats?${params}`);
}

export function fetchChatDetail(chatId: number): Promise<ChatDetail> {
  return request<ChatDetail>(`/api/catalog/chat/${chatId}`);
}

export function toggleLike(chatId: number): Promise<LikeResponse> {
  return request<LikeResponse>(`/api/catalog/like/${chatId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export function updateDescription(
  chatId: number,
  description: string,
): Promise<{ status: string; description: string }> {
  return request(`/api/catalog/description/${chatId}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
}

export function reportChat(chatId: number): Promise<ReportResponse> {
  return request<ReportResponse>(`/api/catalog/report/${chatId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}
