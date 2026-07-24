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

const onboardingSchema = z.object({
  personal: z.object({
    age: z.number().min(13, 'Age must be at least 13').max(120, 'Age must be less than 120'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    heightCm: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be less than 250cm'),
    weightKg: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg'),
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
    equipment: z.array(z.string()).min(1, 'Please select at least one option'),
  }),
  medical: z.object({
    injuries: z.array(
      z.object({
        type: z.string(),
        details: z.string().optional(),
      })
    ),
  }),
  diet: z.object({
    dietType: z.enum(['VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN', 'EGGETARIAN']),
    budget: z.string().optional(),
    cookingSkill: z.string().optional(),
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { id: 1, title: 'Personal' },
  { id: 2, title: 'Goal' },
  { id: 3, title: 'Experience' },
  { id: 4, title: 'Schedule' },
  { id: 5, title: 'Equipment' },
  { id: 6, title: 'Medical' },
  { id: 7, title: 'Diet' },
  { id: 8, title: 'Confirm' },
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

  const { handleSubmit, trigger, watch, formState: { isSubmitting } } = methods;
  const formData = watch();

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['personal'];
    if (currentStep === 2) fieldsToValidate = ['fitness.goal'];
    if (currentStep === 3) fieldsToValidate = ['fitness.fitnessLevel'];
    if (currentStep === 4) fieldsToValidate = ['schedule'];
    if (currentStep === 5) fieldsToValidate = ['equipment'];
    if (currentStep === 6) fieldsToValidate = ['medical'];
    if (currentStep === 7) fieldsToValidate = ['diet'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await onboardingService.completeOnboarding(data as any);
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
    <div className="min-h-screen bg-[#090909] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Welcome to FitAI X</h1>
          <p className="text-gray-400 text-sm">Let's personalize your fitness journey</p>
        </div>

        <Card variant="elevated" className="bg-[#151515] border border-white/5 p-8 rounded-2xl mb-6 shadow-xl">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 select-none">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center flex-1 min-w-[50px]">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      currentStep === step.id
                        ? 'bg-[#FFC400] text-black shadow-md shadow-[#FFC400]/20'
                        : currentStep > step.id
                        ? 'bg-[#7CFF4D] text-black'
                        : 'bg-[#1B1B1B] text-gray-500 border border-white/5'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={16} className="stroke-[3]" /> : step.id}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider hidden sm:block ${
                    currentStep === step.id ? 'text-[#FFC400]' : 'text-gray-500'
                  }`}>{step.title}</span>
                </div>
                {step.id < STEPS.length && (
                  <div className="flex-1 h-[2px] mx-2 bg-[#1B1B1B]">
                    <div
                      className={`h-full bg-[#FFC400] transition-all duration-300 ${
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
              <div className="mb-8">{renderStep()}</div>

              <div className="flex justify-between border-t border-white/5 pt-6">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="border-white/5 hover:bg-[#1B1B1B] text-gray-300"
                  >
                    <ChevronLeft size={16} className="mr-1.5" />
                    Previous
                  </Button>
                )}
                {currentStep < STEPS.length ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="ml-auto bg-[#FFC400] text-black hover:bg-[#e0ad00]"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1.5" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting} 
                    className="ml-auto bg-[#FFC400] text-black hover:bg-[#e0ad00]"
                  >
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Age" type="number" {...register('personal.age', { valueAsNumber: true })} />
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Gender</label>
          <select 
            {...register('personal.gender')} 
            className="w-full h-[48px] px-3 py-2 bg-[#1B1B1B] text-white border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
          >
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">What's your primary fitness goal?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const isSelected = watch('fitness.goal') === goal.value;
          return (
            <label
              key={goal.value}
              className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center select-none ${
                isSelected
                  ? 'border-[#FFC400] bg-[#FFC400]/5 text-white'
                  : 'border-white/5 bg-[#1B1B1B] hover:border-gray-700 text-gray-300'
              }`}
            >
              <input type="radio" {...register('fitness.goal')} value={goal.value} className="sr-only" />
              <div className="text-3xl mb-3">{goal.icon}</div>
              <div className="font-bold text-xs uppercase tracking-wide">{goal.label}</div>
            </label>
          );
        })}
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">What's your fitness experience?</h2>
      <div className="space-y-4">
        {levels.map((level) => {
          const isSelected = watch('fitness.fitnessLevel') === level.value;
          return (
            <label
              key={level.value}
              className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 block select-none ${
                isSelected
                  ? 'border-[#FFC400] bg-[#FFC400]/5 text-white'
                  : 'border-white/5 bg-[#1B1B1B] hover:border-gray-700 text-gray-300'
              }`}
            >
              <input type="radio" {...register('fitness.fitnessLevel')} value={level.value} className="sr-only" />
              <div className="font-bold text-xs uppercase tracking-wider text-[#FFC400]">{level.label}</div>
              <div className="text-xs text-gray-400 mt-1 leading-relaxed">{level.description}</div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleStep({ register }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Workout Schedule</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Days per week</label>
          <select 
            {...register('schedule.workoutDaysPerWeek', { valueAsNumber: true })} 
            className="w-full h-[48px] px-3 py-2 bg-[#1B1B1B] text-white border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Duration per workout (minutes)</label>
          <select 
            {...register('schedule.workoutDurationMinutes', { valueAsNumber: true })} 
            className="w-full h-[48px] px-3 py-2 bg-[#1B1B1B] text-white border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
          >
            {[15, 30, 45, 60, 90, 120, 150, 180].map((min) => (
              <option key={min} value={min}>{min} minutes</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preferred time</label>
          <select 
            {...register('schedule.preferredTime')} 
            className="w-full h-[48px] px-3 py-2 bg-[#1B1B1B] text-white border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
          >
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">What equipment do you have?</h2>
        <p className="text-gray-400 text-xs mt-1">Select all that apply</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {equipmentOptions.map((option) => {
          const isSelected = watch('equipment.equipment')?.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleEquipment(option.value)}
              className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 select-none text-center flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-[#FFC400] bg-[#FFC400]/5 text-white'
                  : 'border-white/5 bg-[#1B1B1B] hover:border-gray-700 text-gray-300'
              }`}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <div className="font-bold text-xs uppercase tracking-wide">{option.label}</div>
            </button>
          );
        })}
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Medical Information</h2>
        <p className="text-gray-400 text-xs mt-1">Do you have any previous injuries?</p>
      </div>
      <div className="space-y-3">
        {injuryTypes.map((injury) => {
          const isChecked = !!watch('medical.injuries')?.find((i: any) => i.type === injury.value);
          return (
            <label key={injury.value} className="flex items-center space-x-3 bg-[#1B1B1B] border border-white/5 p-4 rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleInjury(injury.value)}
                className="w-5 h-5 text-[#FFC400] focus:ring-0 focus:ring-offset-0 bg-[#1D1F24] border-white/5 rounded"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{injury.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DietStep({ register }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dietary Preferences</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Diet Type</label>
          <select 
            {...register('diet.dietType')} 
            className="w-full h-[48px] px-3 py-2 bg-[#1B1B1B] text-white border border-white/5 rounded-xl focus:outline-none focus:border-[#FFC400] text-xs font-bold transition-colors color-scheme-dark"
          >
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
      <h2 className="text-xl font-bold text-white">Confirm Your Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 text-gray-300">
          <h3 className="font-extrabold text-[#FFC400] mb-3 uppercase tracking-wider">Personal</h3>
          <div className="space-y-1">
            <p><span className="text-gray-500 font-bold">Age:</span> {formData.personal.age}</p>
            <p><span className="text-gray-500 font-bold">Gender:</span> {formData.personal.gender}</p>
            <p><span className="text-gray-500 font-bold">Height:</span> {formData.personal.heightCm} cm</p>
            <p><span className="text-gray-500 font-bold">Weight:</span> {formData.personal.weightKg} kg</p>
          </div>
        </div>
        <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 text-gray-300">
          <h3 className="font-extrabold text-[#FFC400] mb-3 uppercase tracking-wider">Fitness</h3>
          <div className="space-y-1">
            <p><span className="text-gray-500 font-bold">Goal:</span> {formData.fitness.goal}</p>
            <p><span className="text-gray-500 font-bold">Level:</span> {formData.fitness.fitnessLevel}</p>
          </div>
        </div>
        <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 text-gray-300">
          <h3 className="font-extrabold text-[#FFC400] mb-3 uppercase tracking-wider">Schedule</h3>
          <div className="space-y-1">
            <p><span className="text-gray-500 font-bold">Days/week:</span> {formData.schedule.workoutDaysPerWeek}</p>
            <p><span className="text-gray-500 font-bold">Duration:</span> {formData.schedule.workoutDurationMinutes} min</p>
            <p><span className="text-gray-500 font-bold">Time:</span> {formData.schedule.preferredTime}</p>
          </div>
        </div>
        <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 text-gray-300">
          <h3 className="font-extrabold text-[#FFC400] mb-3 uppercase tracking-wider">Equipment</h3>
          <p className="mt-1 leading-relaxed">{formData.equipment.equipment.join(', ')}</p>
        </div>
        <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 text-gray-300 md:col-span-2">
          <h3 className="font-extrabold text-[#FFC400] mb-3 uppercase tracking-wider">Diet</h3>
          <p><span className="text-gray-500 font-bold">Type:</span> {formData.diet.dietType}</p>
        </div>
      </div>
    </div>
  );
}
