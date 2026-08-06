const ACCESS_TOKEN_KEY = 'charge-claim-access-token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(accessToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function removeAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}