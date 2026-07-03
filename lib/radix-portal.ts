/** Returns true when the event target is inside a Radix portaled layer (select, popover, etc.). */
export function isRadixPortaledTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return !!(
    target.closest('[data-radix-select-content]') ||
    target.closest('[data-radix-popover-content]') ||
    target.closest('[role="listbox"]')
  );
}
