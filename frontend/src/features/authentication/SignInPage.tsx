import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await login(data.email, data.password);
      addNotification('success', 'Login successful');
      const updatedUser = useAuthStore.getState().user;
      if (updatedUser?.hasCompletedOnboarding) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      addNotification('error', error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B10] py-12 px-4">
      <Card variant="elevated" className="w-full max-w-md bg-[#10151D] border border-white/5 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1.5">Welcome Back</h1>
          <p className="text-[#A8B0BF] text-xs">Sign in to your FitAI X account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FF5E5E]/10 border border-[#FF5E5E]/20 rounded-xl text-[#FF5E5E] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            className="bg-[#171D26] border-white/5 text-white placeholder-[#6F7887]"
            {...register('email')}
            onChange={() => clearError()}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="bg-[#171D26] border-white/5 text-white placeholder-[#6F7887]"
            {...register('password')}
            onChange={() => clearError()}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center text-xs text-[#A8B0BF] select-none cursor-pointer">
              <input type="checkbox" className="mr-2 bg-[#171D26] border-white/5 rounded focus:ring-0 focus:ring-offset-0 text-[#FFC400]" />
              Remember me
            </label>
            <a href="#" className="text-xs text-[#FFC400] hover:text-[#FFD43B] font-bold">
              Forgot password?
            </a>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl py-3 mt-4 text-xs shadow-lg shadow-[#FFC400]/10" 
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#A8B0BF]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#FFC400] hover:text-[#FFD43B] font-bold">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
