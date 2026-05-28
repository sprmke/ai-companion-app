import { aiAssistantsList } from '@/services/AiAssistantsList';

export type HeroCompanionDemo = {
  id: string;
  name: string;
  title: string;
  image: string;
  userInstruction: string;
  accent: string;
  demo: {
    question: string;
    answer: string;
  };
};

const heroCompanionIds = [
  'template-code-writer',
  'template-email-writer',
  'template-fitness-coach',
  'template-bug-finder',
  'template-personal-tutor',
] as const;

const heroDemoAnswers: Record<(typeof heroCompanionIds)[number], string> = {
  'template-code-writer':
    "Here's a clean solution:\n\nfunction reverseString(str) {\n  return str.split('').reverse().join('');\n}\n\nOr the one-liner: str => [...str].reverse().join('')",
  'template-email-writer':
    'Dear Hiring Manager,\n\nI am writing to express my interest in the [Position] role at [Company]. With my experience in [field], I am confident I would contribute meaningfully to your team.\n\nBest regards,\n[Your Name]',
  'template-fitness-coach':
    'Focus on compound lifts — squats, deadlifts, bench press, and rows. Aim for 3–4 sets of 8–12 reps with progressive overload each week, and target ~1.6g protein per kg of bodyweight.',
  'template-bug-finder':
    'Common causes:\n\n1. Missing return in your component\n2. Component not exported properly\n3. Conditional render hiding output\n4. State update after unmount\n\nShare your code and I will pinpoint the issue.',
  'template-personal-tutor':
    'In a right triangle, a² + b² = c²\n\nWhere a and b are the legs and c is the hypotenuse. Example: legs of 3 and 4 give c = √(9 + 16) = 5.',
};

const heroAccents: Record<(typeof heroCompanionIds)[number], string> = {
  'template-code-writer': 'from-violet-500/30 via-primary/20 to-chart-5/25',
  'template-email-writer': 'from-rose-500/25 via-primary/20 to-chart-3/20',
  'template-fitness-coach':
    'from-orange-500/25 via-chart-5/20 to-emerald-500/20',
  'template-bug-finder': 'from-amber-500/25 via-primary/15 to-chart-2/20',
  'template-personal-tutor': 'from-sky-500/25 via-primary/20 to-violet-500/20',
};

export const heroCompanions: HeroCompanionDemo[] = heroCompanionIds
  .map((id) => {
    const companion = aiAssistantsList.find((a) => a.id === id);
    if (!companion) return null;

    return {
      id: companion.id,
      name: companion.name,
      title: companion.title,
      image: companion.image,
      userInstruction: companion.userInstruction,
      accent: heroAccents[id],
      demo: {
        question: companion.sampleQuestions[0],
        answer: heroDemoAnswers[id],
      },
    };
  })
  .filter((c): c is HeroCompanionDemo => Boolean(c));
