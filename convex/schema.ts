import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const aiAssistant = {
  id: v.string(),
  name: v.string(),
  title: v.string(),
  image: v.string(),
  instruction: v.string(),
  userInstruction: v.string(),
  sampleQuestions: v.array(v.string()),
  aiModelId: v.optional(v.string()),
  userId: v.id('users'),
};

const chatMessage = {
  role: v.union(v.literal('user'), v.literal('assistant')),
  content: v.string(),
  images: v.optional(v.array(v.string())),
  createdAt: v.number(),
};

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    credits: v.number(),
    orderId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    /** One-time top-up tokens for the current billing period (resets on renewal). */
    topupCredits: v.optional(v.number()),
  }),
  userAiAssistants: defineTable(aiAssistant),
  chatThreads: defineTable({
    userId: v.id('users'),
    assistantId: v.id('userAiAssistants'),
    title: v.string(),
    messages: v.array(v.object(chatMessage)),
    updatedAt: v.number(),
  })
    .index('by_user_assistant', ['userId', 'assistantId'])
    .index('by_user', ['userId']),
  stripeSessions: defineTable({
    sessionId: v.string(),
    userId: v.id('users'),
    type: v.string(),
    amount: v.number(),
    processedAt: v.number(),
  }).index('by_session', ['sessionId']),
});
