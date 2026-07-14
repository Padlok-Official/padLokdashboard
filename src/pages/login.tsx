import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Spinner from '@/components/shared/Spinner';
import { Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { loginSchema } from '@/schemas/auth-schema';
import type { LoginFormData } from '@/schemas/auth-schema';
import { useAuthStore } from '@/stores/auth-store';
import authService from '@/services/auth-service';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (formData: LoginFormData) => {
    try {
      const response = await authService.login(formData);
      if (response.success && response.data) {
        // authService.login unwraps padlok-api's native shape into
        // { token, user } before we see it. setAuth's third arg is the
        // refresh token — authService stashes that in its own localStorage
        // slot, so we don't pass one through here.
        const { token, user } = response.data;
        setAuth(token, user);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        navigate('/');
      } else {
        toast.error(response.message ?? 'Login failed');
      }
    } catch (err: unknown) {
      // Surface the backend's error message when possible.
      const apiErr = err as { response?: { data?: { message?: string } } };
      const backendMessage = apiErr.response?.data?.message;
      if (backendMessage) {
        toast.error(backendMessage);
        return;
      }

      // DEV-ONLY fallback when the backend is unreachable. Gated behind
      // import.meta.env.DEV so Vite dead-code-eliminates it from production
      // builds — never ship a hardcoded credential bypass, and never advertise
      // the credentials in a user-facing toast.
      if (
        import.meta.env.DEV &&
        formData.email === 'admin@padlok.com' &&
        formData.password === 'admin123'
      ) {
        setAuth('dev-token-123', {
          id: '1',
          name: 'Moni Roy',
          email: 'admin@padlok.com',
          is_admin: true,
          avatar_url: null,
        });
        toast.success('Welcome back! (dev mode — API unreachable)');
        navigate('/');
        return;
      }

      toast.error('Backend unreachable. Check the admin API is running.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E8EAF0] font-sans">
      {/* Left Side — Form */}
      <div className="flex w-full flex-col justify-center px-10 py-12 md:w-1/2 md:px-16 lg:px-24">
        <div className="w-full max-w-md">
          <h1 className="mb-20 text-3xl font-extrabold tracking-tight text-brand-deep-navy md:text-4xl">
            WELCOME TO PADLOK
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div>
              <label className="mb-2.5 block text-sm font-medium text-[#2D4A2D]">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B8A8]">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full rounded-2xl bg-[#F0EDE6]/60 py-4 pl-12 pr-4 text-sm text-gray-800 placeholder-[#C5B99B] outline-none transition focus:ring-2 focus:ring-brand-accent/30"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2.5 block text-sm font-medium text-[#2D4A2D]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className="w-full rounded-2xl bg-[#F0EDE6]/60 py-4 pl-5 pr-12 text-sm text-gray-800 placeholder-[#C5B99B] outline-none transition focus:ring-2 focus:ring-brand-accent/30"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-20 items-center justify-center rounded-xl bg-brand-deep-navy text-white transition hover:bg-brand-navy disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Spinner size="md" />
                ) : (
                  <ArrowRight size={24} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side — Brand Panel */}
      <div className="hidden w-1/2 items-center justify-center p-6 md:flex">
        <div className="relative flex h-full w-full flex-col justify-between rounded-3xl bg-brand-deep-navy px-14 py-14 lg:px-16 lg:py-16">
          {/* Security — top left */}
          <div>
            <h2 className="text-4xl font-bold text-white lg:text-5xl">Security</h2>
          </div>

          {/* Speed — center */}
          <div className="flex justify-center">
            <h2 className="text-4xl font-bold text-white lg:text-5xl">Speed</h2>
          </div>

          {/* Trust — bottom right */}
          <div className="flex justify-end">
            <h2 className="text-4xl font-bold text-white lg:text-5xl">Trust</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
