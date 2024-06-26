import { AuthState } from 'src/stores/auth';

export function decodeAuthState(state: string): AuthState {
  if (!state) {
    return { environment: 'desktop' };
  }
  return JSON.parse(state) as AuthState;
}
