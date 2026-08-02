import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { useAuthStore } from '../stores/authStore';
import { useLocaleStore } from '../stores/localeStore';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../stores/authStore', async () => {
  const actual = await vi.importActual<typeof import('../stores/authStore')>('../stores/authStore');
  return {
    ...actual,
    useAuthStore: vi.fn(),
  };
});

describe('Login page', () => {
  const authenticate = vi.fn();
  const mockAuthState = {
    user: null,
    loading: false,
    login: vi.fn(),
    authenticate,
    register: vi.fn(),
    refreshUser: vi.fn(),
    logout: vi.fn(),
    restoreSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useLocaleStore.setState({ locale: 'en' });
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector(mockAuthState)
    );
  });

  it('renders login form fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows error message when authentication fails', async () => {
    authenticate.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'wronguser');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates home after successful login', async () => {
    authenticate.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'demo');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(authenticate).toHaveBeenCalledWith({ Username: 'demo', Password: 'password' });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
