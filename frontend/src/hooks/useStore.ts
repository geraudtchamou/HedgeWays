import { create } from 'zustand';
import type { User, Portfolio, FinancialProduct, TokenizedAsset } from '@/types';

interface AppState {
  user: User | null;
  portfolio: Portfolio | null;
  products: FinancialProduct[];
  tokens: TokenizedAsset[];
  isAuthenticated: boolean;
  currentTheme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  setPortfolio: (portfolio: Portfolio | null) => void;
  setProducts: (products: FinancialProduct[]) => void;
  setTokens: (tokens: TokenizedAsset[]) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  portfolio: null,
  products: [],
  tokens: [],
  isAuthenticated: false,
  currentTheme: 'light',
  
  setUser: (user) => set({ user }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setProducts: (products) => set({ products }),
  setTokens: (tokens) => set({ tokens }),
  
  login: (user, token) => {
    localStorage.setItem('auth_token', token);
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, portfolio: null, isAuthenticated: false });
  },
  
  toggleTheme: () => set((state) => ({ 
    currentTheme: state.currentTheme === 'light' ? 'dark' : 'light' 
  })),
}));
