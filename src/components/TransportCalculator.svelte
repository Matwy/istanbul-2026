<script lang="ts">
  import { ISTANBULKART, EXCHANGE } from '@/lib/constants.ts';
  import { animate } from 'motion';

  const MIN = 1;
  const MAX = 30;

  let rides = $state(8);

  // Single ticket total: use singleTable lookup where available, else linear fallback
  function singleTotal(n: number): number {
    if (n <= 0) return 0;
    const exact = ISTANBULKART.singleTable.find((r) => r.rides === n);
    if (exact) return exact.tl;
    return n * ISTANBULKART.singleRide;
  }

  function cardTotal(n: number): number {
    if (n <= 0) return ISTANBULKART.cardCost;
    return ISTANBULKART.cardCost + n * ISTANBULKART.perRide;
  }

  function tlToEur(tl: number): number {
    return Math.round((tl / EXCHANGE.eurToTl) * 100) / 100;
  }

  const singleCost = $derived(singleTotal(rides));
  const cardCost = $derived(cardTotal(rides));
  const savings = $derived(singleCost - cardCost);
  const savingsEur = $derived(tlToEur(Math.abs(savings)));

  // Break-even calc: rides where card becomes cheaper
  // cardCost + n * perRide < n * singleRide  =>  n > cardCost / (singleRide - perRide)
  const breakEven = $derived(
    Math.ceil(ISTANBULKART.cardCost / (ISTANBULKART.singleRide - ISTANBULKART.perRide))
  );

  const tableRows = [1, 2, 3, 5, 10, 15, 20] as const;

  function onRange(e: Event) {
    const t = e.currentTarget as HTMLInputElement;
    const n = parseInt(t.value, 10);
    if (!isNaN(n)) rides = Math.min(MAX, Math.max(MIN, n));
  }

  function onNum(e: Event) {
    const t = e.currentTarget as HTMLInputElement;
    const n = parseInt(t.value, 10);
    if (!isNaN(n)) rides = Math.min(MAX, Math.max(MIN, n));
    else if (t.value === '') rides = MIN;
  }

  let singleEl: HTMLDivElement | null = $state(null);
  let cardEl: HTMLDivElement | null = $state(null);
  let savingsEl: HTMLDivElement | null = $state(null);

  $effect(() => {
    const _ = rides;
    [singleEl, cardEl, savingsEl].forEach((el) => {
      if (!el) return;
      animate(
        el,
        { opacity: [0.6, 1], transform: ['translateY(-2px)', 'translateY(0)'] },
        { duration: 0.25, easing: [0.22, 1, 0.36, 1] }
      );
    });
  });
</script>

<section class="transport" aria-label="Calcolatore trasporti Istanbul">
  <div class="controls">
    <label for="rides-range" class="label">
      Quante corse pensi di fare in totale?
    </label>
    <div class="input-group">
      <input
        id="rides-range"
        type="range"
        min={MIN}
        max={MAX}
        step="1"
        value={rides}
        oninput={onRange}
        aria-valuetext={`${rides} ${rides === 1 ? 'corsa' : 'corse'}`}
        class="range"
      />
      <input
        type="number"
        min={MIN}
        max={MAX}
        step="1"
        value={rides}
        oninput={onNum}
        aria-label="Numero di corse (immissione diretta)"
        class="number"
      />
      <span class="unit" aria-hidden="true">{rides === 1 ? 'corsa' : 'corse'}</span>
    </div>
  </div>

  <div class="cards" aria-live="polite">
    <div bind:this={singleEl} class="card card-single">
      <span class="card-label">Senza carta</span>
      <span class="card-value">₺ {singleCost}</span>
      <span class="card-sub">≈ € {tlToEur(singleCost).toFixed(2)}</span>
      <span class="card-hint">Biglietti singoli</span>
    </div>

    <div bind:this={cardEl} class="card card-kart">
      <span class="card-label">Con Istanbulkart</span>
      <span class="card-value">₺ {cardCost}</span>
      <span class="card-sub">≈ € {tlToEur(cardCost).toFixed(2)}</span>
      <span class="card-hint">Carta ₺{ISTANBULKART.cardCost} + ₺{ISTANBULKART.perRide}/corsa</span>
    </div>

    <div bind:this={savingsEl} class="card card-saving" class:negative={savings < 0}>
      <span class="card-label">{savings >= 0 ? 'Risparmio' : 'Spesa extra'}</span>
      <span class="card-value">₺ {Math.abs(savings)}</span>
      <span class="card-sub">≈ € {savingsEur.toFixed(2)}</span>
      <span class="card-hint">
        {#if savings > 0}
          Con {rides} {rides === 1 ? 'corsa' : 'corse'} conviene la carta
        {:else if savings === 0}
          Pareggia con {rides} corse
        {:else}
          Non conviene per poche corse
        {/if}
      </span>
    </div>
  </div>

  <p class="breakeven">
    <strong>Punto di pareggio:</strong> da {breakEven} corse in su, la Istanbulkart
    diventa più economica dei biglietti singoli
    (carta ₺{ISTANBULKART.cardCost} ÷ (₺{ISTANBULKART.singleRide} − ₺{ISTANBULKART.perRide}) ≈ {breakEven}).
  </p>

  <div class="table-wrap">
    <table class="table">
      <caption>Confronto costi per numero di corse</caption>
      <thead>
        <tr>
          <th scope="col">Corse</th>
          <th scope="col">Singoli (₺)</th>
          <th scope="col">Con carta (₺)</th>
          <th scope="col">Risparmio</th>
        </tr>
      </thead>
      <tbody>
        {#each tableRows as r}
          {@const s = singleTotal(r)}
          {@const c = cardTotal(r)}
          {@const diff = s - c}
          <tr class:highlight={r === rides}>
            <th scope="row">{r}</th>
            <td>₺ {s}</td>
            <td>₺ {c}</td>
            <td class:positive={diff > 0} class:neg={diff < 0}>
              {diff > 0 ? '+' : ''}₺ {diff}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .transport {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    background: var(--color-paper);
    border-radius: 14px;
    box-shadow: var(--shadow-soft, 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06));
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .range {
    flex: 1 1 auto;
    min-width: 0;
    height: 44px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  .range::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-gold), color-mix(in oklab, var(--color-gold) 50%, var(--color-cream, #FFFDF7)));
  }
  .range::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-gold), color-mix(in oklab, var(--color-gold) 50%, var(--color-cream, #FFFDF7)));
  }
  .range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-gold);
    border: 3px solid var(--color-cream, #FFFDF7);
    box-shadow: 0 2px 6px color-mix(in oklab, var(--color-gold) 45%, transparent);
    margin-top: -8px;
  }
  .range::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-gold);
    border: 3px solid var(--color-cream, #FFFDF7);
    box-shadow: 0 2px 6px color-mix(in oklab, var(--color-gold) 45%, transparent);
  }
  .range:focus-visible {
    outline: none;
  }
  .range:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-gold) 30%, transparent);
  }

  .number {
    width: 4.5rem;
    padding: 0.5rem 0.625rem;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    color: var(--color-ink);
    background: var(--color-cream, #FFFDF7);
    border: 1.5px solid color-mix(in oklab, var(--color-gold) 28%, transparent);
    border-radius: 10px;
    min-height: 40px;
  }
  .number:focus {
    outline: none;
    border-color: var(--color-gold);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-gold) 25%, transparent);
  }

  .unit {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
    min-width: 3rem;
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  @media (min-width: 640px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border-radius: 12px;
    background: var(--color-cream, #FFFDF7);
    border: 1px solid color-mix(in oklab, var(--color-gold) 20%, transparent);
  }

  .card-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-ink-soft);
  }

  .card-value {
    font-size: 1.625rem;
    font-weight: 700;
    color: var(--color-ink);
    line-height: 1.1;
  }

  .card-sub {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
  }

  .card-hint {
    font-size: 0.75rem;
    color: var(--color-ink-soft);
    margin-top: 0.25rem;
    line-height: 1.35;
  }

  .card-kart {
    background: color-mix(in oklab, var(--color-gold) 12%, var(--color-cream, #FFFDF7));
    border-color: color-mix(in oklab, var(--color-gold) 45%, transparent);
  }

  .card-saving {
    background: color-mix(in oklab, #2f8f5b 10%, var(--color-cream, #FFFDF7));
    border-color: color-mix(in oklab, #2f8f5b 40%, transparent);
  }
  .card-saving .card-value {
    color: #1e6a42;
  }
  .card-saving.negative {
    background: color-mix(in oklab, var(--color-ink-soft) 10%, var(--color-cream, #FFFDF7));
    border-color: color-mix(in oklab, var(--color-ink-soft) 35%, transparent);
  }
  .card-saving.negative .card-value {
    color: var(--color-garnet);
  }

  .breakeven {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
    margin: 0;
    line-height: 1.5;
    padding: 0.75rem 1rem;
    background: color-mix(in oklab, var(--color-iznik) 6%, transparent);
    border-left: 3px solid var(--color-iznik);
    border-radius: 0 8px 8px 0;
  }
  .breakeven strong {
    color: var(--color-ink);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .table caption {
    caption-side: top;
    text-align: left;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-ink-soft);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .table th,
  .table td {
    padding: 0.625rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid color-mix(in oklab, var(--color-ink-soft) 15%, transparent);
  }

  .table thead th {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-ink-soft);
    font-weight: 600;
    border-bottom: 2px solid color-mix(in oklab, var(--color-gold) 40%, transparent);
  }

  .table tbody th {
    font-weight: 600;
    color: var(--color-ink);
  }

  .table td.positive {
    color: #1e6a42;
    font-weight: 600;
  }
  .table td.neg {
    color: var(--color-garnet);
  }

  .table tr.highlight {
    background: color-mix(in oklab, var(--color-gold) 12%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    .range::-webkit-slider-thumb {
      transition: none;
    }
  }
</style>
