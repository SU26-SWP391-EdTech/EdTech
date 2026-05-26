import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/auth/AuthLayout';
import { useAuthStore, getPostLoginPath } from '../../stores/auth.store';
import { getAuthErrorMessage } from '../../utils/auth.errors';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const user = await login({ email: email.trim(), password }, rememberMe);
      toast.success('Logged in successfully');
      navigate(from ?? getPostLoginPath(user.roleName), { replace: true });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900">Log in</h1>
        <p className="mt-2 text-gray-500">
          Please login to continue to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              autoComplete="email"
              className="peer input input-bordered w-full rounded-xl border-2 border-gray-200 px-4 pt-5 pb-2 focus:border-primary focus:outline-none"
            />
            <label
              htmlFor="email"
              className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-primary transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="input input-bordered w-full rounded-xl border-2 border-gray-200 px-4 pr-12 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span className="text-sm text-gray-800">Keep me logged in</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full rounded-xl border-none bg-primary text-base font-semibold text-white hover:bg-primary/90"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Need an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline hover:text-primary/80"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
