import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  access_token: string;
}

function getAuthState() {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userStr || !token) {
    return { user: null, isAuthenticated: false };
  }

  try {
    const user = JSON.parse(userStr);
    return { user, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterDto) => apiClient.register(data),
    onSuccess: (data: AuthResponse) => {

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('auth-change'));
        window.location.href = '/';
      }
      queryClient.setQueryData(['auth', 'user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => apiClient.login(data),
    onSuccess: (data: AuthResponse) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('auth-change'));
        window.location.href = '/';
      }
      queryClient.setQueryData(['auth', 'user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return {
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
      }
      queryClient.clear();
      window.location.href = '/login';
    },
  };
}

export function useAuth() {
  const [authState, setAuthState] = useState<{ user: any; isAuthenticated: boolean }>(() => {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false };
    }
    return getAuthState();
  });

  useEffect(() => {
    setAuthState(getAuthState());

    const handleStorageChange = () => {
      setAuthState(getAuthState());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  return authState;
}

