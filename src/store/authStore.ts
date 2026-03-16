import { create } from 'zustand';
import { User } from '../types';
import { initialData } from '../data/mockData';

const MOCK_CREDENTIALS: Record<string, string> = {
  'admin@clinic.com': '123456',
  'thukho@clinic.com': '123456',
  'yta@clinic.com': '123456',
};

const AUTH_STORAGE_KEY = 'auth_user';

export type Profile = User;

interface AuthState {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  initAuth: () => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved) as User;
        set({ user, profile: user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const expectedPassword = MOCK_CREDENTIALS[email.toLowerCase()];
    if (!expectedPassword || expectedPassword !== password) {
      return { error: 'Email hoặc mật khẩu không đúng.' };
    }

    const user = initialData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return { error: 'Không tìm thấy tài khoản.' };
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    set({ user, profile: user });
    return {};
  },

  signOut: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ user: null, profile: null });
  },
}));
