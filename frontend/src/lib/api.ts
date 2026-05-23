import type { AdminCustomer, AuthSession, AuthUser, Branding, MenuItem, Order, Role } from '../types';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}, token?: string) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed');
  }

  return payload as T;
}

export async function login(role: Role, email: string, password: string) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, email, password })
  });
}

export async function registerCustomer(payload: { name: string; email: string; password: string; phone?: string }) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function refreshSession(refreshToken: string) {
  return request<AuthSession>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

export async function logoutSession(refreshToken: string) {
  return request<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

export async function forgotPassword(email: string) {
  return request<{ message: string; resetToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return request<{ success: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
}

export async function fetchMe(token: string) {
  return request<{ user: AuthUser }>('/auth/me', {}, token);
}

export async function fetchMenu() {
  return request<{ items: MenuItem[] }>('/menu');
}

export async function fetchBranding() {
  return request<{ branding: Branding }>('/branding');
}

export async function fetchOrders(token: string) {
  return request<{ orders: Order[] }>('/orders', {}, token);
}

export async function placeOrder(token: string, payload: { items: Array<{ menuItemId: string; quantity: number }>; address: string; paymentMethod: string; paymentMode?: 'cash' | 'online'; qrCodeUrl?: string; transactionNo?: string }) {
  return request<{ order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, token);
}

export async function fetchAdminSummary(token: string) {
  return request<{ summary: { customers: number; admins: number; items: number; orders: number; revenue: number } }>('/admin/summary', {}, token);
}

export async function fetchAdminUsers(token: string) {
  return request<{ users: AdminCustomer[] }>('/admin/users', {}, token);
}

export async function fetchAdminOrders(token: string) {
  return request<{ orders: Order[] }>('/admin/orders', {}, token);
}

export async function fetchAdminMenu(token: string) {
  return request<{ items: MenuItem[] }>('/admin/menu', {}, token);
}

export async function fetchAdminBranding(token: string) {
  return request<{ branding: Branding }>('/admin/branding', {}, token);
}

export async function updateAdminBranding(token: string, payload: Partial<Branding>) {
  return request<{ branding: Branding }>('/admin/branding', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, token);
}

export async function uploadAdminImage(token: string, file: File) {
  const form = new FormData();
  form.append('image', file);

  const response = await fetch(`${apiBase}/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? 'Image upload failed');
  }

  return payload as { imageUrl: string };
}

export async function createMenuItem(token: string, payload: Omit<MenuItem, 'id'>) {
  return request<{ item: MenuItem }>('/admin/menu', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, token);
}

export async function updateMenuItem(token: string, itemId: string, payload: Partial<Omit<MenuItem, 'id'>>) {
  return request<{ item: MenuItem }>(`/admin/menu/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }, token);
}

export async function deleteMenuItem(token: string, itemId: string) {
  return request<{ success: boolean }>(`/admin/menu/${itemId}`, {
    method: 'DELETE'
  }, token);
}

export async function updateOrderStatus(token: string, orderId: string, status: Order['status']) {
  return request<{ order: Order }>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }, token);
}

export async function fetchProfile(token: string) {
  return request<{ user: AuthUser; orders: Order[] }>('/profile', {}, token);
}

export async function updateProfile(token: string, payload: Partial<Omit<AuthUser, 'id' | 'email' | 'role'>>) {
  return request<{ user: AuthUser }>('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, token);
}

export async function verifyOrder(token: string, orderId: string, verificationCode: string) {
  return request<{ order: Order }>(`/orders/${orderId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ verificationCode })
  }, token);
}
