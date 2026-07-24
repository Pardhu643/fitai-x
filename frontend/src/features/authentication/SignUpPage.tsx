import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      addNotification('success', 'Account created successfully');
      navigate('/onboarding');
    } catch (err) {
      addNotification('error', error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B10] py-12 px-4">
      <Card variant="elevated" className="w-full max-w-md bg-[#10151D] border border-white/5 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1.5">Create Account</h1>
          <p className="text-[#A8B0BF] text-xs">Start your AI-powered fitness journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FF5E5E]/10 border border-[#FF5E5E]/20 rounded-xl text-[#FF5E5E] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            className="bg-[#171D26] border-white/5 text-white placeholder-[#6F7887]"
            {...register('name')}
            onChange={() => clearError()}
          />
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
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            className="bg-[#171D26] border-white/5 text-white placeholder-[#6F7887]"
            {...register('confirmPassword')}
            onChange={() => clearError()}
          />
          <Button 
            type="submit" 
            className="w-full bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl py-3 mt-4 text-xs shadow-lg shadow-[#FFC400]/10" 
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#A8B0BF]">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#FFC400] hover:text-[#FFD43B] font-bold">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
