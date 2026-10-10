import { User, ShortenedUrl } from '../types';

const USERS_KEY = 'linkzip_users';
const CURRENT_USER_KEY = 'linkzip_current_user';
const URLS_KEY = 'linkzip_urls';

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existing = users.findIndex(u => u.id === user.id);
  if (existing >= 0) {
    users[existing] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getUrls(userId?: string): ShortenedUrl[] {
  const data = localStorage.getItem(URLS_KEY);
  const urls: ShortenedUrl[] = data ? JSON.parse(data) : [];
  if (userId) {
    return urls.filter(u => u.userId === userId);
  }
  return urls;
}

export function saveUrl(url: ShortenedUrl): void {
  const urls = getUrls();
  urls.push(url);
  localStorage.setItem(URLS_KEY, JSON.stringify(urls));
}

export function incrementClicks(shortCode: string): void {
  const urls = getUrls();
  const idx = urls.findIndex(u => u.shortCode === shortCode);
  if (idx >= 0) {
    urls[idx].clicks += 1;
    localStorage.setItem(URLS_KEY, JSON.stringify(urls));
  }
}

export function deleteUrl(id: string): void {
  const urls = getUrls().filter(u => u.id !== id);
  localStorage.setItem(URLS_KEY, JSON.stringify(urls));
}

export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
