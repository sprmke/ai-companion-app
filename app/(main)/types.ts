import { Id } from '@/convex/_generated/dataModel';

export type AiAssistant = {
  _id: Id<'userAiAssistants'>;
  id: string;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  aiModelId?: string;
  userId?: string;
  _creationTime?: number;
};

export type AiAssistants = AiAssistant[];

export type User = {
  name: string;
  email: string;
  picture: string;
  credits: number;
  _id: Id<'users'>;
  _creationTime: number;
  orderId?: string;
  stripeCustomerId?: string;
  topupCredits?: number;
};
