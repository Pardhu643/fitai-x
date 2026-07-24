import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'demo@fitaix.com' },
    update: {},
    create: {
      email: 'demo@fitaix.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
      hasCompletedOnboarding: false,
    },
  });

  const exercises = [
    {
      name: 'Push-ups',
      category: 'Push',
      primaryMuscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Place hands shoulder-width apart', 'Lower chest to the ground keeping core tight', 'Push back up to starting position'],
      contraindications: ['SHOULDER_PAIN']
    },
    {
      name: 'Barbell Bench Press',
      category: 'Push',
      primaryMuscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      equipment: ['GYM'],
      difficulty: 'INTERMEDIATE',
      instructions: ['Lie on bench, grip barbell slightly wider than shoulder-width', 'Lower bar to mid-chest slowly', 'Push bar back up forcefully'],
      contraindications: ['SHOULDER_PAIN']
    },
    {
      name: 'Dumbbell Shoulder Press',
      category: 'Push',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: ['Triceps'],
      equipment: ['DUMBBELLS', 'GYM'],
      difficulty: 'INTERMEDIATE',
      instructions: ['Sit or stand, hold dumbbells at shoulder height', 'Press dumbbells straight overhead until arms lock', 'Lower weights back to shoulders slowly'],
      contraindications: ['SHOULDER_PAIN']
    },
    {
      name: 'Pull-ups',
      category: 'Pull',
      primaryMuscle: 'Back',
      secondaryMuscles: ['Biceps', 'Shoulders'],
      equipment: ['PULL_UP_BAR', 'GYM'],
      difficulty: 'ADVANCED',
      instructions: ['Grip pull-up bar wider than shoulders', 'Pull body up until chin clears the bar', 'Lower down slowly to full extension'],
      contraindications: ['SHOULDER_PAIN']
    },
    {
      name: 'Barbell Back Squats',
      category: 'Legs',
      primaryMuscle: 'Quads',
      secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back'],
      equipment: ['GYM'],
      difficulty: 'ADVANCED',
      instructions: ['Rest barbell on upper traps, feet shoulder-width apart', 'Squat down until thighs are parallel to floor', 'Drive up through heels to start position'],
      contraindications: ['KNEE_PAIN', 'BACK_PAIN']
    },
    {
      name: 'Glute Bridges',
      category: 'Lower Body',
      primaryMuscle: 'Glutes',
      secondaryMuscles: ['Hamstrings', 'Core'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Lie on back with knees bent, feet flat on floor', 'Squeeze glutes and lift hips toward ceiling', 'Lower hips back down with control'],
      contraindications: []
    },
    {
      name: 'Dumbbell Lunges',
      category: 'Legs',
      primaryMuscle: 'Quads',
      secondaryMuscles: ['Glutes', 'Hamstrings'],
      equipment: ['DUMBBELLS', 'GYM'],
      difficulty: 'INTERMEDIATE',
      instructions: ['Stand holding dumbbells, step forward with one foot', 'Lower hips until back knee is near floor', 'Push off front foot to stand back up'],
      contraindications: ['KNEE_PAIN']
    },
    {
      name: 'Plank',
      category: 'Core',
      primaryMuscle: 'Abs',
      secondaryMuscles: ['Shoulders', 'Lower Back'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Hold pushup position resting on forearms', 'Keep body in straight line from head to heels', 'Hold position for desired duration'],
      contraindications: ['BACK_PAIN']
    },
    {
      name: 'Russian Twists',
      category: 'Core',
      primaryMuscle: 'Obliques',
      secondaryMuscles: ['Abs'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Sit with knees bent, lean torso back slightly', 'Clasp hands and rotate torso from side to side', 'Touch floor on each side'],
      contraindications: ['BACK_PAIN']
    },
    {
      name: 'Burpees',
      category: 'Cardio',
      primaryMuscle: 'Full Body',
      secondaryMuscles: ['Chest', 'Quads', 'Cardio'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'INTERMEDIATE',
      instructions: ['Drop into squat, kick feet back to pushup position', 'Perform pushup, jump feet back to squat', 'Jump up with hands overhead'],
      contraindications: ['KNEE_PAIN', 'BACK_PAIN']
    },
    {
      name: 'Resistance Band Rows',
      category: 'Pull',
      primaryMuscle: 'Back',
      secondaryMuscles: ['Biceps'],
      equipment: ['RESISTANCE_BANDS', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Wrap band around post, hold handles with arms straight', 'Pull handles towards ribcage, squeezing shoulder blades', 'Return arms slowly to start position'],
      contraindications: []
    },
    {
      name: 'Leg Press',
      category: 'Legs',
      primaryMuscle: 'Quads',
      secondaryMuscles: ['Glutes', 'Hamstrings'],
      equipment: ['BENCH', 'GYM'],
      difficulty: 'BEGINNER',
      instructions: ['Sit in machine, place feet on platform', 'Lower platform slowly towards chest by bending knees', 'Push platform away extending legs'],
      contraindications: ['KNEE_PAIN']
    },
    {
      name: 'Cat Cow Stretch',
      category: 'Mobility',
      primaryMuscle: 'Lower Back',
      secondaryMuscles: ['Core', 'Neck'],
      equipment: ['NO_EQUIPMENT', 'HOME_ONLY'],
      difficulty: 'BEGINNER',
      instructions: ['Get on all fours, arch back up towards ceiling (Cat)', 'Lower belly towards floor while looking up (Cow)', 'Flow smoothly between positions'],
      contraindications: []
    }
  ];

  for (const ex of exercises) {
    await prisma.exerciseLibrary.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        category: ex.category,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
        equipment: ex.equipment as any,
        difficulty: ex.difficulty,
        instructions: ex.instructions,
        contraindications: ex.contraindications as any,
      },
    });
  }
  
  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
