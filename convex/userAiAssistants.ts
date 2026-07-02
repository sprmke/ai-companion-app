import { v } from 'convex/values';
import { mutation, query } from '@/convex/_generated/server';
import { aiAssistant } from '@/convex/schema';

export const getAllUserAssistants = query({
  args: {
    userId: v.id('users'),
  },
  handler: async ({ db }, { userId }) => {
    const userAiAssistants = await db
      .query('userAiAssistants')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc')
      .collect();

    return userAiAssistants;
  },
});

export const addAssistants = mutation({
  args: {
    aiAssistants: v.array(v.object(aiAssistant)),
  },
  handler: async ({ db }, { aiAssistants }) => {
    const insertedIds = await Promise.all(
      aiAssistants.map(
        async (aiAssistant) => await db.insert('userAiAssistants', aiAssistant)
      )
    );
    return insertedIds;
  },
});

export const updateUserAiAssistant = mutation({
  args: {
    id: v.id('userAiAssistants'),
    userInstruction: v.string(),
    aiModelId: v.optional(v.string()),
    sampleQuestions: v.optional(v.array(v.string())),
  },
  handler: async ({ db }, { id, userInstruction, aiModelId, sampleQuestions }) => {
    const patch: {
      userInstruction: string;
      aiModelId?: string;
      sampleQuestions?: string[];
    } = { userInstruction };

    if (aiModelId !== undefined) {
      patch.aiModelId = aiModelId;
    }

    if (sampleQuestions !== undefined) {
      patch.sampleQuestions = sampleQuestions;
    }

    await db.patch(id, patch);
  },
});

export const deleteAssistant = mutation({
  args: {
    id: v.id('userAiAssistants'),
  },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});
