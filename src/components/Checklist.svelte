<script lang="ts">
  import { loadChecklist, saveChecklist, type ChecklistState } from '@/lib/storage.ts';
  import { onMount } from 'svelte';
  import { animate } from 'motion';

  type Item = { id: string; label: string; note?: string };
  type Category = { title: string; icon: string; order: number; items: Item[] };

  let { categories }: { categories: Category[] } = $props();

  let state = $state<ChecklistState>({});
  let hydrated = $state(false);

  onMount(() => {
    const loaded = loadChecklist();
    state = loaded;
    // Set hydrated last so the save-effect never fires before state is loaded.
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated) return;
    saveChecklist(state);
  });

  const allItems = $derived(
    [...categories]
      .sort((a, b) => a.order - b.order)
      .flatMap((c) => c.items)
  );
  const total = $derived(allItems.length);
  const done = $derived(allItems.filter((it) => state[it.id]).length);
  const percent = $derived(total === 0 ? 0 : Math.round((done / total) * 100));

  let progressBarEl: HTMLDivElement | null = $state(null);

  $effect(() => {
    if (!progressBarEl) return;
    const _ = percent;
    progressBarEl.style.width = `${percent}%`;
  });

  function toggle(id: string, checkEl: SVGElement | null) {
    const next = !state[id];
    state = { ...state, [id]: next };
    if (next && checkEl) {
      animate(
        checkEl,
        { opacity: [0, 1], transform: ['scale(0)', 'scale(1.2)', 'scale(1)'] },
        { duration: 0.35, easing: [0.22, 1, 0.36, 1] }
      );
    }
  }

  function handleKey(e: KeyboardEvent, id: string, checkEl: SVGElement | null) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle(id, checkEl);
    }
  }

  function resetAll() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Sicuro di voler azzerare tutta la checklist?');
    if (!ok) return;
    state = {};
  }

  const iconPaths: Record<string, string> = {
    wallet:
      '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M16 15h2"/>',
    smartphone:
      '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    shirt:
      '<path d="M6 3l3 2h6l3-2 3 4-4 3v11H7V10L3 7z"/>',
    'plane-landing':
      '<path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-2 3.05.97L13 3l2 1-3 6 5 1.5 2-1 1 1-2 3-13-2.73z"/>',
    info:
      '<circle cx="12" cy="12" r="10"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/>',
    'check-square':
      '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>',
    luggage:
      '<rect x="6" y="6" width="12" height="15" rx="2"/><path d="M9 6V3h6v3"/><path d="M10 11v6M14 11v6"/>',
    pill:
      '<path d="M10.5 20.5 20 11a4.95 4.95 0 0 0-7-7L3.5 13.5a4.95 4.95 0 0 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  };

  const sortedCategories = $derived([...categories].sort((a, b) => a.order - b.order));
</script>

<section class="checklist" aria-label="Checklist del viaggio">
  <header class="header">
    <div class="header-top">
      <div class="progress-meta">
        <span class="count">{done} / {total}</span>
        <span class="count-label">completati · {percent}%</span>
      </div>
      <button
        type="button"
        class="reset-btn"
        onclick={resetAll}
        aria-label="Azzera tutta la checklist"
      >
        Resetta tutto
      </button>
    </div>
    <div class="progress-track" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Avanzamento checklist">
      <div bind:this={progressBarEl} class="progress-fill"></div>
    </div>
  </header>

  <div class="grid">
    {#each sortedCategories as category (category.title)}
      <article class="card">
        <h3 class="card-title">
          <span class="icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html iconPaths[category.icon] ?? iconPaths.info}
            </svg>
          </span>
          <span>{category.title}</span>
        </h3>
        <ul class="list">
          {#each category.items as item (item.id)}
            {@const checked = !!state[item.id]}
            <li class="item">
              <label class="row" class:checked>
                <input
                  type="checkbox"
                  class="sr"
                  checked={checked}
                  onchange={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    const svg = target.parentElement?.querySelector('.check-svg') as SVGElement | null;
                    toggle(item.id, svg);
                  }}
                  onkeydown={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    const svg = target.parentElement?.querySelector('.check-svg') as SVGElement | null;
                    handleKey(e, item.id, svg);
                  }}
                  aria-label={`${item.label}${item.note ? '. ' + item.note : ''}`}
                />
                <span class="box" aria-hidden="true">
                  <svg class="check-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m5 12 5 5 9-11" />
                  </svg>
                </span>
                <span class="text">
                  <span class="label">{item.label}</span>
                  {#if item.note}
                    <span class="note">{item.note}</span>
                  {/if}
                </span>
              </label>
            </li>
          {/each}
        </ul>
      </article>
    {/each}
  </div>
</section>

<style>
  .checklist {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--color-paper);
    border-radius: 14px;
    box-shadow: var(--shadow-soft, 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06));
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .progress-meta {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .count {
    font-weight: 600;
    font-size: 1.125rem;
    color: var(--color-ink);
  }

  .count-label {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
  }

  .reset-btn {
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-ink-soft) 35%, transparent);
    color: var(--color-ink-soft);
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    cursor: pointer;
    min-height: 36px;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  }
  .reset-btn:hover,
  .reset-btn:focus-visible {
    background: color-mix(in oklab, var(--color-garnet) 8%, transparent);
    color: var(--color-garnet);
    border-color: color-mix(in oklab, var(--color-garnet) 45%, transparent);
    outline: none;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background: color-mix(in oklab, var(--color-gold) 15%, var(--color-paper));
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--color-gold), color-mix(in oklab, var(--color-gold) 70%, #E6C478));
    border-radius: 999px;
    transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .card {
    background: var(--color-paper);
    border-radius: 14px;
    padding: 1.25rem;
    box-shadow: var(--shadow-soft, 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06));
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 0 0 0.875rem;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: color-mix(in oklab, var(--color-gold) 18%, transparent);
    color: var(--color-gold);
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .item {
    margin: 0;
  }

  .row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-height: 44px;
    padding: 0.5rem 0.5rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.18s;
  }
  .row:hover,
  .row:focus-within {
    background: color-mix(in oklab, var(--color-gold) 10%, transparent);
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .sr:focus-visible + .box {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }

  .box {
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid color-mix(in oklab, var(--color-ink-soft) 45%, transparent);
    background: var(--color-cream, #FFFDF7);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .check-svg {
    color: var(--color-gold);
    opacity: 0;
    transform: scale(0);
  }

  .row.checked .box {
    background: color-mix(in oklab, var(--color-gold) 14%, var(--color-cream, #FFFDF7));
    border-color: var(--color-gold);
  }
  .row.checked .check-svg {
    opacity: 1;
    transform: scale(1);
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1 1 auto;
    min-width: 0;
  }

  .label {
    font-size: 0.9375rem;
    color: var(--color-ink);
    line-height: 1.4;
    transition: color 0.2s, text-decoration-color 0.2s;
    text-decoration: none solid transparent;
  }

  .row.checked .label {
    color: var(--color-ink-soft);
    text-decoration: line-through solid color-mix(in oklab, var(--color-ink-soft) 70%, transparent);
  }

  .note {
    font-size: 0.8125rem;
    color: var(--color-ink-soft);
    line-height: 1.35;
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-fill,
    .row,
    .label,
    .box,
    .check-svg {
      transition: none;
    }
  }
</style>
