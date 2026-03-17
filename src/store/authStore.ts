import { create } from 'zustand';
import { User } from '../types';

const ADMIN_ACCOUNT = {
  username: 'Dương Minh Trí',
  password: '12345',
};

const ADMIN_USER: User = {
  id: 'u1',
  name: 'Dương Minh Trí',
  email: 'duongminhtri@ypct.edu.vn',
};

const AUTH_STORAGE_KEY = 'auth_user';

export type Profile = User;

interface AuthState {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
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

  signIn: async (username: string, password: string) => {
    if (
      username.trim() !== ADMIN_ACCOUNT.username ||
      password !== ADMIN_ACCOUNT.password
    ) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(ADMIN_USER));
    set({ user: ADMIN_USER, profile: ADMIN_USER });
    return {};
  },

  signOut: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ user: null, profile: null });
  },
}));
