import { useMemo } from 'react';

export function useAuth() {
  const user = useMemo(() => ({ id: "mock-user-id", email: "test@example.com" }), []);
  const loadingUser = false;

  return { user, loadingUser };
}