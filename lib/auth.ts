// Mock authentication utility for demo purposes only.
// Uses localStorage to persist auth state across refreshes.
// In a real app, replace with real API calls and secure storage.

export type User = {
  name: string;
  email: string;
};

const AUTH_KEY = 'optibro_auth_user';

// Get the current user from localStorage, or null if not logged in
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
}

// Mock login: accepts any email/password, stores user in localStorage
export function login(email: string, password: string): User {
  // In a real app, validate credentials with backend
  const user = { name: 'Demo User', email };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

// Mock register: accepts name/email/password, stores user in localStorage
export function register(name: string, email: string, password: string): User {
  // In a real app, create user in backend
  const user = { name, email };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

// Logout: remove user from localStorage
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getCurrentUser();
} 