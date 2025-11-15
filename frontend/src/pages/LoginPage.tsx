import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .min(1, 'אימייל נדרש'),
  password: z.string()
    .min(1, 'סיסמה נדרשת')
    .min(6, 'סיסמה חייבת להכיל לפחות 6 תווים')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ApiError {
  message: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const email = watch('email');
  const password = watch('password');
  const canSubmit = isValid && email && password && !isLoading;

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setApiError('');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/login`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('התחברת בהצלחה!');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        const errorMessage = apiError?.message || 'שגיאה בהתחברות. בדוק את פרטיך ונסה שוב.';
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = 'שגיאת רשת. אנא בדוק את החיבור שלך ונסה שוב.';
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 p-3 rounded-lg">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            התחבר לחשבון שלך
          </h1>
          <p className="text-center text-gray-600 mb-8">
            ניהול הרשאות בנייה בקלות וביעילות
          </p>

          {apiError && (
            <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.email
                    ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.password
                      ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? 'הסתר' : 'הצג'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  טוען...
                </span>
              ) : (
                'התחבר'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              אין לך חשבון?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:underline"
              >
                הירשם כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
