import { v } from 'convex/values';
import { mutation, query } from '@/convex/_generated/server';

const messageArgs = v.object({
  role: v.union(v.literal('user'), v.literal('assistant')),
  content: v.string(),
  images: v.optional(v.array(v.string())),
  createdAt: v.number(),
});

export const getThreadsByAssistant = query({
  args: {
    userId: v.id('users'),
    assistantId: v.id('userAiAssistants'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('chatThreads')
      .withIndex('by_user_assistant', (q) =>
        q.eq('userId', args.userId).eq('assistantId', args.assistantId)
      )
      .order('desc')
      .collect();
  },
});

export const getThread = query({
  args: {
    threadId: v.id('chatThreads'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

export const createThread = mutation({
  args: {
    userId: v.id('users'),
    assistantId: v.id('userAiAssistants'),
    title: v.string(),
    messages: v.array(messageArgs),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('chatThreads', {
      userId: args.userId,
      assistantId: args.assistantId,
      title: args.title,
      messages: args.messages,
      updatedAt: Date.now(),
    });
  },
});

export const appendMessages = mutation({
  args: {
    threadId: v.id('chatThreads'),
    newMessages: v.array(messageArgs),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return;
    await ctx.db.patch(args.threadId, {
      messages: [...thread.messages, ...args.newMessages],
      updatedAt: Date.now(),
    });
  },
});

export const updateThreadTitle = mutation({
  args: {
    threadId: v.id('chatThreads'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, { title: args.title });
  },
});

export const deleteThread = mutation({
  args: {
    threadId: v.id('chatThreads'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.threadId);
  },
});

export const deleteThreadsByAssistant = mutation({
  args: {
    userId: v.id('users'),
    assistantId: v.id('userAiAssistants'),
  },
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query('chatThreads')
      .withIndex('by_user_assistant', (q) =>
        q.eq('userId', args.userId).eq('assistantId', args.assistantId)
      )
      .collect();
    await Promise.all(threads.map((t) => ctx.db.delete(t._id)));
  },
});
