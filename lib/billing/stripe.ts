/** True when `id` is a Stripe subscription ID (e.g. sub_xxx). */
export function isStripeSubscriptionId(
  id: string | undefined | null
): id is string {
  return typeof id === 'string' && id.startsWith('sub_');
}
