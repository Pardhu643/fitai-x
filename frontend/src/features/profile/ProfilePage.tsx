import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { authService } from '../../services/auth.service';
import { User, Dumbbell, Save, Shield } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  age: z.number().min(13, 'Age must be at least 13').max(120, 'Age must be less than 120').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  heightCm: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be less than 250cm').optional(),
  weightKg: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg').optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  primaryGoal: z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'STRENGTH', 'FLEXIBILITY', 'GENERAL_FITNESS']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      age: user?.age || undefined,
      gender: user?.gender || undefined,
      heightCm: user?.heightCm || undefined,
      weightKg: user?.weightKg || undefined,
      fitnessLevel: user?.fitnessLevel || undefined,
      primaryGoal: user?.primaryGoal || undefined,
    },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('age', user.age || undefined);
      setValue('gender', user.gender || undefined);
      setValue('heightCm', user.heightCm || undefined);
      setValue('weightKg', user.weightKg || undefined);
      setValue('fitnessLevel', user.fitnessLevel || undefined);
      setValue('primaryGoal', user.primaryGoal || undefined);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await authService.updateProfile(data);
      addNotification('success', 'Profile updated successfully');
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1100px] mx-auto bg-[#090909]">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Settings</span>
        <h1 className="text-3xl font-extrabold text-[#F5F5F5] mt-1">Profile & Settings</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Manage your personal information and fitness preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Summary Card */}
          <div className="space-y-6">
            <Card variant="bordered" className="bg-[#17191F] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#FFC400] text-black font-extrabold flex items-center justify-center text-2xl shadow-lg shadow-[#FFC400]/10 mb-4 select-none">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">{user?.name}</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{user?.email}</p>
              
              <div className="mt-4 flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-xl">
                <Shield size={14} className="text-[#FFC400]" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Pro Member</span>
              </div>
            </Card>
          </div>

          {/* Right Column: Detailed Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card variant="bordered" className="bg-[#17191F] border border-white/5 p-6 rounded-2xl space-y-6">
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2 border-b border-white/5 pb-3">
                <User size={18} className="text-[#FFC400]" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    className="bg-[#1D1F24] border-white/5 text-[#F5F5F5] placeholder-[#6B7280]"
                    {...register('name')}
                  />
                </div>

                <div>
                  <Input
                    label="Age"
                    type="number"
                    placeholder="25"
                    error={errors.age?.message}
                    className="bg-[#1D1F24] border-white/5 text-[#F5F5F5] placeholder-[#6B7280]"
                    {...register('age', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full h-[48px] px-3 py-2 bg-[#1D1F24] text-[#F5F5F5] border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#1D1F24] text-[#9CA3AF]">Select gender</option>
                    <option value="MALE" className="bg-[#1D1F24] text-[#F5F5F5]">Male</option>
                    <option value="FEMALE" className="bg-[#1D1F24] text-[#F5F5F5]">Female</option>
                    <option value="OTHER" className="bg-[#1D1F24] text-[#F5F5F5]">Other</option>
                    <option value="PREFER_NOT_TO_SAY" className="bg-[#1D1F24] text-[#F5F5F5]">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1.5 text-xs text-[#FF5E5E]">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Height (cm)"
                    type="number"
                    placeholder="175"
                    error={errors.heightCm?.message}
                    className="bg-[#1D1F24] border-white/5 text-[#F5F5F5] placeholder-[#6B7280]"
                    {...register('heightCm', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Input
                    label="Weight (kg)"
                    type="number"
                    placeholder="70"
                    error={errors.weightKg?.message}
                    className="bg-[#1D1F24] border-white/5 text-[#F5F5F5] placeholder-[#6B7280]"
                    {...register('weightKg', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Card>

            {/* Fitness Preferences */}
            <Card variant="bordered" className="bg-[#17191F] border border-white/5 p-6 rounded-2xl space-y-6">
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2 border-b border-white/5 pb-3">
                <Dumbbell size={18} className="text-[#FFC400]" />
                Fitness Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Fitness Level</label>
                  <select
                    {...register('fitnessLevel')}
                    className="w-full h-[48px] px-3 py-2 bg-[#1D1F24] text-[#F5F5F5] border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#1D1F24] text-[#9CA3AF]">Select fitness level</option>
                    <option value="BEGINNER" className="bg-[#1D1F24] text-[#F5F5F5]">Beginner</option>
                    <option value="INTERMEDIATE" className="bg-[#1D1F24] text-[#F5F5F5]">Intermediate</option>
                    <option value="ADVANCED" className="bg-[#1D1F24] text-[#F5F5F5]">Advanced</option>
                  </select>
                  {errors.fitnessLevel && (
                    <p className="mt-1.5 text-xs text-[#FF5E5E]">{errors.fitnessLevel.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Primary Goal</label>
                  <select
                    {...register('primaryGoal')}
                    className="w-full h-[48px] px-3 py-2 bg-[#1D1F24] text-[#F5F5F5] border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#1D1F24] text-[#9CA3AF]">Select primary goal</option>
                    <option value="WEIGHT_LOSS" className="bg-[#1D1F24] text-[#F5F5F5]">Weight Loss</option>
                    <option value="MUSCLE_GAIN" className="bg-[#1D1F24] text-[#F5F5F5]">Muscle Gain</option>
                    <option value="ENDURANCE" className="bg-[#1D1F24] text-[#F5F5F5]">Endurance</option>
                    <option value="STRENGTH" className="bg-[#1D1F24] text-[#F5F5F5]">Strength</option>
                    <option value="FLEXIBILITY" className="bg-[#1D1F24] text-[#F5F5F5]">Flexibility</option>
                    <option value="GENERAL_FITNESS" className="bg-[#1D1F24] text-[#F5F5F5]">General Fitness</option>
                  </select>
                  {errors.primaryGoal && (
                    <p className="mt-1.5 text-xs text-[#FF5E5E]">{errors.primaryGoal.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Save Section */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-8 py-3.5 flex items-center gap-2 text-xs shadow-lg shadow-[#FFC400]/10"
              >
                <Save size={16} />
                Save Changes
              </Button>
            </div>
            
          </div>
        </div>
      </form>
    </div>
  );
}
