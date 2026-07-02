import { v } from 'convex/values';
import { mutation, query } from '@/convex/_generated/server';

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
  },
  handler: async (ctx, args) => {
    // If user already exist in table
    const result = await ctx.db
      .query('users')
      .filter((c) => c.eq(c.field('email'), args.email))
      .collect();
    const [user] = result ?? [];

    if (!user) {
      // If not, then add user
      const userData = {
        name: args.name,
        email: args.email,
        picture: args.picture,
        credits: 5000,
      };
      const userId = await ctx.db.insert('users', userData);
      return { ...userData, _id: userId };
    }

    return user;
  },
});

export const GetUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .collect();
    const [user] = result ?? [];

    return user;
  },
});

export const GetUserByStripeCustomerId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('stripeCustomerId'), args.stripeCustomerId))
      .collect();
    const [user] = result ?? [];

    return user;
  },
});

export const UpdateUserTokens = mutation({
  args: {
    userId: v.id('users'),
    credits: v.number(),
    orderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      credits: args.credits,
      topupCredits: 0,
      ...(args.orderId && { orderId: args.orderId }),
    });

    const sessions = await ctx.db
      .query('stripeSessions')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return args.userId;
  },
});

export const DeductUserTokens = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const amount = Math.max(0, Math.ceil(args.amount));
    if (amount === 0) {
      return user.credits;
    }

    const credits = Math.max(0, user.credits - amount);
    await ctx.db.patch(args.userId, { credits });

    return credits;
  },
});

export const AddUserTokens = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const amount = Math.max(0, Math.ceil(args.amount));
    const credits = user.credits + amount;
    await ctx.db.patch(args.userId, { credits });

    return credits;
  },
});

/** Idempotent token top-up — safe to call from webhook and success-page fallback. */
export const ApplyTokenTopup = mutation({
  args: {
    userId: v.id('users'),
    sessionId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('stripeSessions')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (existing) {
      const topupCredits = user.topupCredits ?? 0;
      return { credits: user.credits, topupCredits, alreadyProcessed: true };
    }

    const amount = Math.max(0, Math.ceil(args.amount));
    const credits = user.credits + amount;
    const topupCredits = (user.topupCredits ?? 0) + amount;

    await ctx.db.patch(args.userId, { credits, topupCredits });
    await ctx.db.insert('stripeSessions', {
      sessionId: args.sessionId,
      userId: args.userId,
      type: 'token_topup',
      amount,
      processedAt: Date.now(),
    });

    return { credits, topupCredits, alreadyProcessed: false };
  },
});

/** Backfill topupCredits from stripeSessions for users who topped up before the field existed. */
export const EnsureTopupCreditsSynced = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || (user.topupCredits ?? 0) > 0) {
      return user?.topupCredits ?? 0;
    }

    const sessions = await ctx.db
      .query('stripeSessions')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();

    const total = sessions
      .filter((s) => s.type === 'token_topup')
      .reduce((sum, s) => sum + s.amount, 0);

    if (total > 0) {
      await ctx.db.patch(args.userId, { topupCredits: total });
    }

    return total;
  },
});

export const UpdateUserStripeCustomerId = mutation({
  args: {
    userId: v.id('users'),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });

    return result;
  },
});

export const ClearUserOrderId = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.userId, {
      orderId: undefined,
    });

    return result;
  },
});

export const SetUserOrderId = mutation({
  args: {
    userId: v.id('users'),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { orderId: args.orderId });
    return args.orderId;
  },
});
