<script lang="ts">
  import { EXCHANGE } from '@/lib/constants.ts';
  import { animate } from 'motion';

  const rate = EXCHANGE.eurToTl;
  const presets = [5, 10, 20, 50] as const;

  let eurStr = $state('10');
  let tlStr = $state(String(10 * rate));
  let syncing = false;

  let eurOutEl: HTMLSpanElement | null = $state(null);
  let tlOutEl: HTMLSpanElement | null = $state(null);
  let swapBtnEl: HTMLButtonElement | null = $state(null);
  let swapRotated = false;

  function round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  function pulse(el: HTMLElement | null) {
    if (!el) return;
    animate(
      el,
      { opacity: [0, 1], transform: ['translateY(-4px)', 'translateY(0)'] },
      { duration: 0.28, easing: [0.22, 1, 0.36, 1] }
    );
  }

  function onEurInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    let v = target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1]?.length > 2) v = parts[0] + '.' + parts[1].slice(0, 2);
    eurStr = v;
    const eur = parseFloat(v);
    if (syncing) return;
    syncing = true;
    if (!isNaN(eur) && eur >= 0) {
      tlStr = String(Math.round(eur * rate));
      pulse(tlOutEl);
    } else if (v === '') {
      tlStr = '';
    }
    queueMicrotask(() => (syncing = false));
  }

  function onTlInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    let v = target.value.replace(/[^0-9]/g, '');
    tlStr = v;
    const tl = parseInt(v, 10);
    if (syncing) return;
    syncing = true;
    if (!isNaN(tl) && tl >= 0) {
      eurStr = String(round2(tl / rate));
      pulse(eurOutEl);
    } else if (v === '') {
      eurStr = '';
    }
    queueMicrotask(() => (syncing = false));
  }

  function applyPreset(eur: number) {
    syncing = true;
    eurStr = String(eur);
    tlStr = String(Math.round(eur * rate));
    queueMicrotask(() => (syncing = false));
    pulse(eurOutEl);
    pulse(tlOutEl);
  }

  function swap() {
    if (!swapBtnEl) return;
    swapRotated = !swapRotated;
    animate(
      swapBtnEl,
      { transform: [swapRotated ? 'rotate(0deg)' : 'rotate(180deg)', swapRotated ? 'rotate(180deg)' : 'rotate(360deg)'] },
      { duration: 0.45, easing: [0.22, 1, 0.36, 1] }
    );
    // Swap: reinterpret eur input as tl value and vice versa
    const prevEur = eurStr;
    const prevTl = tlStr;
    syncing = true;
    // Treat the previous tl as new eur, previous eur as new tl
    const newEur = parseFloat(prevTl);
    const newTl = parseFloat(prevEur);
    if (!isNaN(newEur)) eurStr = String(round2(newEur));
    if (!isNaN(newTl)) tlStr = String(Math.round(newTl));
    queueMicrotask(() => (syncing = false));
    pulse(eurOutEl);
    pulse(tlOutEl);
  }
</script>

<section class="converter" aria-label="Calcolatore valuta euro lira turca">
  <div class="row">
    <div class="field">
      <label for="eur-input" class="label">Euro</label>
      <div class="input-wrap">
        <span class="prefix">€</span>
        <input
          id="eur-input"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          value={eurStr}
          oninput={onEurInput}
          aria-label="Importo in euro"
        />
      </div>
      <span class="out" aria-live="polite">
        <span bind:this={eurOutEl}>{eurStr === '' ? '—' : `€ ${eurStr}`}</span>
      </span>
    </div>

    <button
      bind:this={swapBtnEl}
      type="button"
      class="swap"
      onclick={swap}
      aria-label="Inverti valute"
      title="Inverti"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3 4 7l4 4" />
        <path d="M4 7h16" />
        <path d="m16 21 4-4-4-4" />
        <path d="M20 17H4" />
      </svg>
    </button>

    <div class="field">
      <label for="tl-input" class="label">Lira turca</label>
      <div class="input-wrap">
        <span class="prefix">₺</span>
        <input
          id="tl-input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          value={tlStr}
          oninput={onTlInput}
          aria-label="Importo in lire turche"
        />
      </div>
      <span class="out" aria-live="polite">
        <span bind:this={tlOutEl}>{tlStr === '' ? '—' : `₺ ${tlStr}`}</span>
      </span>
    </div>
  </div>

  <div class="presets" role="group" aria-label="Importi rapidi in euro">
    {#each presets as p}
      <button
        type="button"
        class="chip"
        onclick={() => applyPreset(p)}
        aria-label={`Imposta ${p} euro`}
      >
        {p} €
      </button>
    {/each}
  </div>

  <p class="disclaimer">
    Tasso indicativo 1 € = {rate} TL. {EXCHANGE.disclaimer}
  </p>
</section>

<style>
  .converter {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-paper);
    border-radius: 14px;
    box-shadow: var(--shadow-soft, 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06));
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.75rem;
    align-items: center;
  }

  @media (max-width: 480px) {
    .row {
      grid-template-columns: 1fr;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-ink-soft);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .prefix {
    position: absolute;
    left: 0.75rem;
    color: var(--color-gold);
    font-weight: 600;
    pointer-events: none;
    font-size: 1.125rem;
  }

  .input-wrap input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.125rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-cream, #FFFDF7);
    border: 1.5px solid color-mix(in oklab, var(--color-gold) 28%, transparent);
    border-radius: 10px;
    min-height: 48px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-wrap input:focus {
    outline: none;
    border-color: var(--color-gold);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-gold) 25%, transparent);
  }

  .out {
    font-size: 0.8125rem;
    color: var(--color-ink-soft);
    min-height: 1em;
  }

  .swap {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    background: color-mix(in oklab, var(--color-gold) 18%, transparent);
    color: var(--color-gold);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, transform 0.2s;
    justify-self: center;
  }
  .swap:hover,
  .swap:focus-visible {
    background: color-mix(in oklab, var(--color-gold) 30%, transparent);
    outline: none;
  }

  @media (max-width: 480px) {
    .swap {
      justify-self: center;
      margin: 0.25rem 0;
    }
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-gold) 35%, transparent);
    color: var(--color-ink);
    padding: 0.4rem 0.875rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    min-height: 36px;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  }
  .chip:hover,
  .chip:focus-visible {
    background: color-mix(in oklab, var(--color-gold) 16%, transparent);
    border-color: var(--color-gold);
    outline: none;
  }

  .disclaimer {
    font-size: 0.8125rem;
    color: var(--color-ink-soft);
    margin: 0;
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .input-wrap input,
    .swap,
    .chip {
      transition: none;
    }
  }
</style>
