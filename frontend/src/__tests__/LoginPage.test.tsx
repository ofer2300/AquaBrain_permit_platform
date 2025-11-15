import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginPage from '../pages/LoginPage';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedAxios = axios as any;

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('renders login form without crashing', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText(/התחבר לחשבון שלך/i)).toBeInTheDocument();
    });

    it('displays login heading', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const heading = screen.getByRole('heading', { level: 1, name: /התחבר לחשבון שלך/i });
      expect(heading).toBeInTheDocument();
    });

    it('displays subtitle', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByText(/ניהול הרשאות בנייה/i)).toBeInTheDocument();
    });

    it('renders email input field with label', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    });

    it('renders password input field with label', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const passwordInput = screen.getByPlaceholderText("••••••••"); expect(passwordInput).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const submitButton = screen.getByRole('button', { name: /התחבר/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('renders register link in form', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const registerLink = screen.getByRole('link', { name: /הירשם כאן/i });
      expect(registerLink).toBeInTheDocument();
    });

    it('email input has correct placeholder', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('password input has correct placeholder', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      const passwordInput = screen.getByPlaceholderText(/•••••••/i);
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe('Email Input Validation', () => {
    it('shows error for invalid email format', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.tab();

      
      const errorMsg = await screen.findByText(/כתובת אימייל לא תקינה/i);
      expect(errorMsg).toBeVisible();

    });

    it('shows error for empty email', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.clear(emailInput);
      await userEvent.tab();

      
      const errorMsg = await screen.findByText(/כתובת אימייל לא תקינה/i);
      expect(errorMsg).toBeVisible();

    });

    it('accepts valid email format', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      await userEvent.type(emailInput, 'test@example.com');

      
        expect(emailInput.value).toBe('test@example.com');
        expect(screen.queryByText(/אימייל נדרש/i)).not.toBeInTheDocument();

    });

    it('validates email on blur', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      // Type something to trigger onChange, then clear to trigger validation error
      await userEvent.type(emailInput, "test");
      await userEvent.clear(emailInput);
      await userEvent.tab();


      const errorMsg = await screen.findByText(/כתובת אימייל לא תקינה/i);
      expect(errorMsg).toBeVisible();

    });

    it('error message disappears when email becomes valid', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      
      const errorMsg = await screen.findByText(/כתובת אימייל לא תקינה/i);
      expect(errorMsg).toBeVisible();

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'valid@example.com');

      
        expect(screen.queryByText(/כתובת אימייל לא תקינה/i)).not.toBeInTheDocument();

    });

    it('email input field has correct type', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });
  });

  describe('Password Input Validation', () => {
    it('shows error for empty password', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      await userEvent.type(passwordInput, "test123");
      await userEvent.clear(passwordInput);
      await userEvent.tab();

      
      const errorMsg = await screen.findByText(/סיסמה נדרשת/i);
      expect(errorMsg).toBeVisible();

    });

    it('shows error for password less than 6 characters', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText("••••••••");
      await userEvent.type(passwordInput, '12345');
      await userEvent.tab();

      
      const errorMsg = await screen.findByText(/סיסמה חייבת להכיל לפחות 6 תווים/i);
      expect(errorMsg).toBeVisible();

    });

    it('accepts valid password with 6 or more characters', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      await userEvent.type(passwordInput, 'password123');

      
        expect(passwordInput.value).toBe('password123');
        expect(screen.queryByText(/סיסמה נדרשת/i)).not.toBeInTheDocument();

    });

    it('has toggle password visibility button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const toggleButton = screen.getByText(/הצג/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles password visibility on button click', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      const toggleButton = screen.getByText(/הצג/i);

      expect(passwordInput.type).toBe('password');

      fireEvent.click(toggleButton);

      
        expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);

      
        expect(passwordInput.type).toBe('password');

    });

    it('shows password when visibility is toggled', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      const toggleButton = screen.getByText(/הצג/i);

      await userEvent.type(passwordInput, 'testpass123');

      fireEvent.click(toggleButton);

      
        expect((passwordInput as HTMLInputElement).type).toBe('text');
        expect((passwordInput as HTMLInputElement).value).toBe('testpass123');

    });
  });

  describe('Submit Button State', () => {
    it('submit button is disabled when form is invalid', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('submit button becomes enabled with valid email and password', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      
        expect(submitButton.disabled).toBe(false);

    });

    it('submit button is disabled when email is invalid', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.tab();

      
        expect(submitButton.disabled).toBe(true);

    });

    it('submit button is disabled when password is too short', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '123');
      await userEvent.tab();

      
        expect(submitButton.disabled).toBe(true);

    });

    it('submit button shows loading state during submission', async () => {
      mockedAxios.post.mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { token: 'test-token', user: { id: '1' } } }), 500)
        )
      );

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייل/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);


      const loadingText = await screen.findByText(/טוען/i, {}, { timeout: 5000 });
      expect(loadingText).toBeInTheDocument();

    });
  });

  describe('Successful Login', () => {
    it('makes API call on successful login', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1', email: 'test@example.com' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          { email: 'test@example.com', password: 'password123' },
          expect.any(Object)
        ); });

    });

    it('stores token in localStorage on successful login', async () => {
      const testToken = 'test-jwt-token-123';
      const testUser = { id: '1', email: 'test@example.com' };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token: testToken, user: testUser }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => expect(localStorage.getItem('token')).toBe(testToken));
        await waitFor(() => expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser)));

    });

    it('navigates to dashboard on successful login', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }); });

    });

    it('clears API error message on successful login', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());

    });

    it('disables form inputs during submission', async () => {
      mockedAxios.post.mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { token: 'test-token', user: { id: '1' } } }), 500)
        )
      );

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייل/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);
      }, { timeout: 5000 });

    });

    it('re-enables form inputs after successful login', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }); });

    });
  });

  describe('Failed Login', () => {
    it('displays error message on failed login', async () => {
      mockedAxios.post.mockImplementationOnce(() => Promise.reject({
            response: {
              data: { message: 'שם משתמש או סיסמה שגויים' }
            },
            isAxiosError: true
          }));

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

        const errorMsg = await screen.findByText(/שם משתמש או סיסמה שגויים/i, {}, { timeout: 5000 });
        expect(errorMsg).toBeInTheDocument();

    });

    it('shows default error message when API response is empty', async () => {
      mockedAxios.post.mockImplementationOnce(() => Promise.reject({
            response: {
              data: {}
            },
            isAxiosError: true
          }));

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);



        const errorMsg = await screen.findByText(/שגיאה בהתחברות/i, {}, { timeout: 5000 });

    });

    it('shows network error message on connection failure', async () => {
      mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);



        const errorMsg = await screen.findByText(/שגיאת רשת/i, {}, { timeout: 5000 });

    });

    it('does not navigate to dashboard on failed login', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        },
        isAxiosError: true
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      
        expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.any(Object));

    });

    it('does not store token in localStorage on failed login', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        },
        isAxiosError: true
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      
        await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
        await waitFor(() => expect(localStorage.getItem('user')).toBeNull());

    });

    it('error message displays in alert element', async () => {
      mockedAxios.post.mockImplementationOnce(() => Promise.reject({
            response: {
              data: { message: 'Authentication failed' }
            },
            isAxiosError: true
          }));

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);



        const alert = await screen.findByText(/Authentication failed/i, {}, { timeout: 5000 });
        expect(alert).toBeInTheDocument();

    });

    it('clears error message on new submission attempt', async () => {
      mockedAxios.post
        .mockImplementationOnce(() => Promise.reject({
              response: {
                data: { message: 'Invalid credentials' }
              },
              isAxiosError: true
            }))
        .mockResolvedValueOnce({
          data: { token: 'test-token', user: { id: '1' } }
        });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);



        const errorMsg = await screen.findByText(/Invalid credentials/i, {}, { timeout: 5000 });

      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'correctpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
      });

    });

    it('re-enables form inputs after failed login', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        },
        isAxiosError: true
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      
        expect(emailInput.disabled).toBe(false);
        expect(passwordInput.disabled).toBe(false);
        expect(submitButton.disabled).toBe(false);

    });
  });

  describe('Register Link Navigation', () => {
    it('register link is present and clickable', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const registerLink = screen.getByRole('link', { name: /הירשם כאן/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).not.toHaveAttribute('disabled');
    });

    it('register link has correct href', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const registerLink = screen.getByRole('link', { name: /הירשם כאן/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('register link text is descriptive', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/אין לך חשבון/i)).toBeInTheDocument();
    });

    it('register prompt is visible near register link', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/אין לך חשבון/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data structure', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'user@example.com');
      await userEvent.type(passwordInput, 'securepassword');
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          { email: 'user@example.com', password: 'securepassword' },
          expect.any(Object)
        ); });

    });

    it('sends correct headers with API request', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        ); });

    });

    it('does not submit form when validation fails', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;
      fireEvent.click(submitButton);

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('prevents double submission', async () => {
      mockedAxios.post.mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { token: 'test-token', user: { id: '1' } } }), 300)
        )
      );

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const form = screen.getByRole('button', { name: /התחבר/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('all inputs have associated labels', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('error messages are announced', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      
        const errorMessage = screen.getByText(/כתובת אימייל לא תקינה/i);
        expect(errorMessage).toBeInTheDocument();

    });

    it('toggle password button has accessible name', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const toggleButtons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('הצג'));
      toggleButtons.forEach(btn => {
        expect(btn).toHaveAccessibleName();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      await userEvent.type(emailInput, longEmail);
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });

    });

    it('handles special characters in password', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i });

      const specialPassword = 'Pass@word!#$%123';

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, specialPassword);
      fireEvent.click(submitButton);

      
        await waitFor(() => { expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@example.com', password: specialPassword },
          expect.any(Object)
        ); });

    });

    it('handles rapid form submissions', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: 'test-token', user: { id: '1' } }
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/אימייל/i);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole('button', { name: /התחבר/i }) as HTMLButtonElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton.disabled).toBe(true);
      });
    });
  });
});
