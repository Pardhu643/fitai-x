import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { onboardingService } from '../../services/onboarding.service';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import type { OnboardingData } from '../../types/onboarding';

const onboardingSchema = z.object({
  personal: z.object({
    age: z.number().min(13).max(120),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    heightCm: z.number().min(100).max(250),
    weightKg: z.number().min(30).max(300),
  }),
  fitness: z.object({
    goal: z.enum(['FAT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'ATHLETIC_PERFORMANCE', 'GENERAL_FITNESS']),
    fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  }),
  schedule: z.object({
    workoutDaysPerWeek: z.number().min(1).max(7),
    workoutDurationMinutes: z.number().min(15).max(180),
    preferredTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  }),
  equipment: z.object({
    equipment: z.array(z.enum(['GYM', 'DUMBBELLS', 'RESISTANCE_BANDS', 'PULL_UP_BAR', 'BENCH', 'HOME_ONLY', 'NO_EQUIPMENT'])).min(1),
  }),
  medical: z.object({
    injuries: z.array(z.object({
      type: z.enum(['BACK_PAIN', 'SHOULDER_PAIN', 'KNEE_PAIN', 'OTHER']),
      details: z.string().optional(),
    })),
  }),
  diet: z.object({
    dietType: z.enum(['VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN', 'EGGETARIAN']),
    budget: z.string().optional(),
    cookingSkill: z.string().optional(),
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'Fitness Goal' },
  { id: 3, title: 'Experience' },
  { id: 4, title: 'Workout Schedule' },
  { id: 5, title: 'Equipment' },
  { id: 6, title: 'Medical' },
  { id: 7, title: 'Diet' },
  { id: 8, title: 'Confirmation' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const updateOnboardingStatus = useAuthStore((state) => state.updateOnboardingStatus);
  const [currentStep, setCurrentStep] = useState(1);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      personal: { age: 25, gender: 'MALE', heightCm: 175, weightKg: 70 },
      fitness: { goal: 'GENERAL_FITNESS', fitnessLevel: 'BEGINNER' },
      schedule: { workoutDaysPerWeek: 3, workoutDurationMinutes: 30, preferredTime: 'MORNING' },
      equipment: { equipment: ['NO_EQUIPMENT'] },
      medical: { injuries: [] },
      diet: { dietType: 'NON_VEGETARIAN', budget: '', cookingSkill: '' },
    },
  });

  const { handleSubmit, watch, formState: { isSubmitting } } = methods;
  const formData = watch();

  const nextStep = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    try {
      await onboardingService.completeOnboarding(data);
      updateOnboardingStatus(true);
      addNotification('success', 'Onboarding completed successfully');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      addNotification('error', error.response?.data?.message || 'Onboarding failed');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetailsStep register={methods.register} watch={methods.watch} />;
      case 2:
        return <FitnessGoalStep register={methods.register} watch={methods.watch} />;
      case 3:
        return <ExperienceStep register={methods.register} watch={methods.watch} />;
      case 4:
        return <ScheduleStep register={methods.register} watch={methods.watch} />;
      case 5:
        return <EquipmentStep register={methods.register} watch={methods.watch} setValue={methods.setValue} />;
      case 6:
        return <MedicalStep register={methods.register} watch={methods.watch} setValue={methods.setValue} />;
      case 7:
        return <DietStep register={methods.register} watch={methods.watch} />;
      case 8:
        return <ConfirmationStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FitAI X</h1>
          <p className="text-gray-600">Let's personalize your fitness journey</p>
        </div>

        <Card variant="elevated" className="mb-6">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.id
                        ? 'bg-primary-600 text-white'
                        : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.id}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden sm:block">{step.title}</span>
                </div>
                {step.id < STEPS.length && (
                  <div className="flex-1 h-1 mx-2 bg-gray-200">
                    <div
                      className={`h-full bg-primary-600 transition-all ${
                        currentStep > step.id ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">{renderStep()}</div>

              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft size={20} className="mr-2" />
                    Previous
                  </Button>
                )}
                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isSubmitting} className="ml-auto">
                    Complete Onboarding
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
}

function PersonalDetailsStep({ register }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Age" type="number" {...register('personal.age', { valueAsNumber: true })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select {...register('personal.gender')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <Input label="Height (cm)" type="number" {...register('personal.heightCm', { valueAsNumber: true })} />
        <Input label="Weight (kg)" type="number" {...register('personal.weightKg', { valueAsNumber: true })} />
      </div>
    </div>
  );
}

function FitnessGoalStep({ register, watch }: any) {
  const goals = [
    { value: 'FAT_LOSS', label: 'Fat Loss', icon: '🔥' },
    { value: 'MUSCLE_GAIN', label: 'Muscle Gain', icon: '💪' },
    { value: 'STRENGTH', label: 'Strength', icon: '⚡' },
    { value: 'ENDURANCE', label: 'Endurance', icon: '🏃' },
    { value: 'ATHLETIC_PERFORMANCE', label: 'Athletic Performance', icon: '🏆' },
    { value: 'GENERAL_FITNESS', label: 'General Fitness', icon: '❤️' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">What's your primary fitness goal?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <label
            key={goal.value}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              watch('fitness.goal') === goal.value
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input type="radio" {...register('fitness.goal')} value={goal.value} className="sr-only" />
            <div className="text-3xl mb-2">{goal.icon}</div>
            <div className="font-medium">{goal.label}</div>
          </label>
        ))}
      </div>
    </div>
  );
}

function ExperienceStep({ register, watch }: any) {
  const levels = [
    { value: 'BEGINNER', label: 'Beginner', description: 'New to fitness or returning after a long break' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Regularly workout for 6+ months' },
    { value: 'ADVANCED', label: 'Advanced', description: 'Experienced with consistent training' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">What's your fitness experience?</h2>
      <div className="space-y-3">
        {levels.map((level) => (
          <label
            key={level.value}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              watch('fitness.fitnessLevel') === level.value
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input type="radio" {...register('fitness.fitnessLevel')} value={level.value} className="sr-only" />
            <div className="font-medium">{level.label}</div>
            <div className="text-sm text-gray-600">{level.description}</div>
          </label>
        ))}
      </div>
    </div>
  );
}

function ScheduleStep({ register }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Workout Schedule</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days per week</label>
          <select {...register('schedule.workoutDaysPerWeek', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration per workout (minutes)</label>
          <select {...register('schedule.workoutDurationMinutes', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {[15, 30, 45, 60, 90, 120, 150, 180].map((min) => (
              <option key={min} value={min}>{min} minutes</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred time</label>
          <select {...register('schedule.preferredTime')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="MORNING">Morning</option>
            <option value="AFTERNOON">Afternoon</option>
            <option value="EVENING">Evening</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EquipmentStep({ watch, setValue }: any) {
  const equipmentOptions = [
    { value: 'GYM', label: 'Gym Access', icon: '🏋️' },
    { value: 'DUMBBELLS', label: 'Dumbbells', icon: '🏋️‍♂️' },
    { value: 'RESISTANCE_BANDS', label: 'Resistance Bands', icon: '🎽' },
    { value: 'PULL_UP_BAR', label: 'Pull-up Bar', icon: '🔩' },
    { value: 'BENCH', label: 'Bench', icon: '🪑' },
    { value: 'HOME_ONLY', label: 'Home Only', icon: '🏠' },
    { value: 'NO_EQUIPMENT', label: 'No Equipment', icon: '🤸' },
  ];

  const toggleEquipment = (value: string) => {
    const current = watch('equipment.equipment') || [];
    if (current.includes(value)) {
      setValue('equipment.equipment', current.filter((v: string) => v !== value));
    } else {
      setValue('equipment.equipment', [...current, value]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">What equipment do you have?</h2>
      <p className="text-gray-600">Select all that apply</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {equipmentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleEquipment(option.value)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              watch('equipment.equipment')?.includes(option.value)
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{option.icon}</div>
            <div className="font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MedicalStep({ watch, setValue }: any) {
  const injuryTypes = [
    { value: 'BACK_PAIN', label: 'Back Pain' },
    { value: 'SHOULDER_PAIN', label: 'Shoulder Pain' },
    { value: 'KNEE_PAIN', label: 'Knee Pain' },
    { value: 'OTHER', label: 'Other' },
  ];

  const toggleInjury = (type: string) => {
    const current = watch('medical.injuries') || [];
    if (current.find((i: any) => i.type === type)) {
      setValue('medical.injuries', current.filter((i: any) => i.type !== type));
    } else {
      setValue('medical.injuries', [...current, { type, details: '' }]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
      <p className="text-gray-600">Do you have any previous injuries?</p>
      <div className="space-y-3">
        {injuryTypes.map((injury) => (
          <label key={injury.value} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={!!watch('medical.injuries')?.find((i: any) => i.type === injury.value)}
              onChange={() => toggleInjury(injury.value)}
              className="w-5 h-5 text-primary-600"
            />
            <span>{injury.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DietStep({ register }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Dietary Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
          <select {...register('diet.dietType')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="VEGAN">Vegan</option>
            <option value="NON_VEGETARIAN">Non-Vegetarian</option>
            <option value="EGGETARIAN">Eggetarian</option>
          </select>
        </div>
        <Input label="Budget (optional)" {...register('diet.budget')} placeholder="e.g., Low, Medium, High" />
        <Input label="Cooking Skill (optional)" {...register('diet.cookingSkill')} placeholder="e.g., Beginner, Intermediate, Expert" />
      </div>
    </div>
  );
}

function ConfirmationStep({ formData }: { formData: OnboardingFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Confirm Your Details</h2>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Personal</h3>
          <p>Age: {formData.personal.age}</p>
          <p>Gender: {formData.personal.gender}</p>
          <p>Height: {formData.personal.heightCm} cm</p>
          <p>Weight: {formData.personal.weightKg} kg</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Fitness</h3>
          <p>Goal: {formData.fitness.goal}</p>
          <p>Level: {formData.fitness.fitnessLevel}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Schedule</h3>
          <p>Days/week: {formData.schedule.workoutDaysPerWeek}</p>
          <p>Duration: {formData.schedule.workoutDurationMinutes} min</p>
          <p>Time: {formData.schedule.preferredTime}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Equipment</h3>
          <p>{formData.equipment.equipment.join(', ')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Diet</h3>
          <p>Type: {formData.diet.dietType}</p>
        </div>
      </div>
    </div>
  );
}
