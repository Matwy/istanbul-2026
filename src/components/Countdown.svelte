<script lang="ts">
  import { daysUntilTrip } from '@/lib/date.ts';
  import { onMount } from 'svelte';
  import { animate } from 'motion';

  const tripStart = new Date('2026-04-29T00:00:00');
  const tripEnd = new Date('2026-05-03T23:59:59');

  function computeDays(): number {
    const now = new Date();
    if (now > tripEnd) return -2;
    if (now >= tripStart) return -1;
    return daysUntilTrip(now);
  }

  let days = $state(computeDays());
  let numberEl: HTMLElement | null = $state(null);
  let rootEl: HTMLElement | null = $state(null);

  const label = $derived.by(() => {
    if (days === -2) return 'viaggio concluso';
    if (days === -1) return 'siamo in viaggio!';
    if (days === 0) return 'è oggi! 🎉';
    if (days === 1) return 'giorno alla partenza';
    return 'giorni alla partenza';
  });

  const display = $derived.by(() => {
    if (days === -2) return '✈︎';
    if (days === -1) return '🧳';
    return String(days);
  });

  onMount(() => {
    const interval = setInterval(() => {
      const next = computeDays();
      if (next !== days) days = next;
    }, 60 * 60 * 1000);

    if (rootEl) {
      animate(
        rootEl,
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
        { duration: 0.7, easing: [0.22, 1, 0.36, 1] }
      );
    }
    if (numberEl) {
      animate(
        numberEl,
        { transform: ['scale(0.85)', 'scale(1)'] },
        { duration: 0.9, easing: [0.22, 1, 0.36, 1], delay: 0.15 }
      );
    }

    return () => clearInterval(interval);
  });

  $effect(() => {
    if (numberEl && days >= 0) {
      animate(
        numberEl,
        { transform: ['scale(1)', 'scale(1.06)', 'scale(1)'] },
        { duration: 0.45 }
      );
    }
  });
</script>

<div
  bind:this={rootEl}
  class="flex flex-col items-center gap-2 text-center"
  aria-live="polite"
  role="status"
>
  <span
    bind:this={numberEl}
    class="countdown-number font-[var(--font-display)] text-7xl font-semibold leading-none text-[var(--color-gold-bright)] md:text-8xl"
  >
    {display}
  </span>
  <span class="text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--color-paper)_85%,transparent)]">
    {label}
  </span>
</div>

<style>
  .countdown-number {
    text-shadow:
      0 2px 16px rgba(201, 169, 97, 0.4),
      0 0 32px rgba(201, 169, 97, 0.25);
    animation: pulse-gold 3s ease-in-out infinite;
  }
  @keyframes pulse-gold {
    0%, 100% { text-shadow: 0 2px 16px rgba(201, 169, 97, 0.4), 0 0 32px rgba(201, 169, 97, 0.25); }
    50% { text-shadow: 0 2px 24px rgba(201, 169, 97, 0.55), 0 0 48px rgba(201, 169, 97, 0.4); }
  }
  @media (prefers-reduced-motion: reduce) {
    .countdown-number { animation: none; }
  }
</style>
