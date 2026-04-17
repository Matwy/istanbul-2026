<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type * as LeafletNS from 'leaflet';
  import { buildPinSvg, ISTANBUL_CENTER } from '../lib/map-utils';

  export type Point = {
    lat: number;
    lng: number;
    name: string;
    id: string;
    dayId: string | 'optional';
    googleMapsUrl: string;
  };

  let {
    points,
    dayColors,
  }: { points: Point[]; dayColors: Record<string, string> } = $props();

  const DAY_LABELS: Record<string, string> = {
    g1: 'Giorno 1',
    g2: 'Giorno 2',
    g3: 'Giorno 3',
    g4: 'Giorno 4',
    g5: 'Giorno 5',
    optional: 'Opzionali',
  };

  // Collect unique dayIds present in data, preserving a stable order
  const orderedKeys = ['g1', 'g2', 'g3', 'g4', 'g5', 'optional'];
  const presentDays: string[] = orderedKeys.filter((k) =>
    points.some((p) => p.dayId === k)
  );

  // Reactive filter state: which day toggles are active
  let activeDays = $state<Set<string>>(new Set(presentDays));

  // Counts per day (total in dataset)
  const totalsByDay: Record<string, number> = {};
  for (const k of presentDays) {
    totalsByDay[k] = points.filter((p) => p.dayId === k).length;
  }

  // Derived visible points for legend / stats / markers
  const visiblePoints = $derived(
    points.filter((p) => activeDays.has(p.dayId))
  );

  let container: HTMLDivElement | undefined = $state(undefined);
  let map: LeafletNS.Map | undefined = undefined;
  let L: typeof LeafletNS | undefined = undefined;
  let markersLayer: LeafletNS.LayerGroup | undefined = undefined;
  let ready = $state(false);

  onMount(async () => {
    if (typeof window === 'undefined' || !container) return;

    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(ISTANBUL_CENTER, isMobile ? 12 : 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    ready = true;
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = undefined;
    }
    markersLayer = undefined;
    L = undefined;
  });

  // Re-render markers when filters change (or once map is ready)
  $effect(() => {
    // depend on these
    const visible = visiblePoints;
    if (!ready || !L || !map || !markersLayer) return;

    markersLayer.clearLayers();

    visible.forEach((p) => {
      if (!L || !markersLayer) return;
      const color = dayColors[p.dayId] ?? '#8A8A8A';
      const svg = buildPinSvg(color);
      const icon = L.divIcon({
        html: svg,
        className: 'full-map-pin',
        iconSize: [32, 42],
        iconAnchor: [16, 41],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([p.lat, p.lng], {
        icon,
        title: p.name,
        alt: p.name,
      });

      const safeName = escapeHtml(p.name);
      const safeUrl = escapeAttr(p.googleMapsUrl);
      marker.bindPopup(
        `<div class="popup-inner">
          <h3>${safeName}</h3>
          <a class="popup-btn" href="${safeUrl}" target="_blank" rel="noopener">Apri in Maps &rarr;</a>
        </div>`,
        { closeButton: true, maxWidth: 260 }
      );

      marker.addTo(markersLayer);
    });
  });

  function toggleDay(day: string): void {
    const next = new Set(activeDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    activeDays = next;
  }

  function selectAll(): void {
    activeDays = new Set(presentDays);
  }

  function selectNone(): void {
    activeDays = new Set();
  }

  const allActive = $derived(
    presentDays.every((k) => activeDays.has(k)) && presentDays.length > 0
  );

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(s: string): string {
    return escapeHtml(s);
  }
</script>

<div class="full-map-root">
  <div class="filters" role="toolbar" aria-label="Filtri giorni">
    <button
      type="button"
      class="filter-chip chip-all"
      onclick={() => (allActive ? selectNone() : selectAll())}
      aria-pressed={allActive}
    >
      {allActive ? 'Deseleziona tutti' : 'Seleziona tutti'}
    </button>

    {#each presentDays as day (day)}
      {@const active = activeDays.has(day)}
      <button
        type="button"
        class="filter-chip"
        class:active
        onclick={() => toggleDay(day)}
        aria-pressed={active}
      >
        <span
          class="dot"
          style="background: {dayColors[day] ?? '#8A8A8A'}"
          aria-hidden="true"
        ></span>
        <span class="label">{DAY_LABELS[day] ?? day}</span>
        <span class="count" aria-label="{totalsByDay[day]} tappe">
          {totalsByDay[day]}
        </span>
      </button>
    {/each}
  </div>

  <div class="map-area" role="application" aria-label="Mappa completa delle attrazioni">
    <div bind:this={container} class="full-map"></div>

    <div class="legend" aria-live="polite">
      <div class="legend-title">Legenda</div>
      {#each presentDays as day (day)}
        {@const visibleCount = visiblePoints.filter((p) => p.dayId === day).length}
        <div class="legend-row" class:dim={!activeDays.has(day)}>
          <span
            class="dot"
            style="background: {dayColors[day] ?? '#8A8A8A'}"
            aria-hidden="true"
          ></span>
          <span class="legend-label">{DAY_LABELS[day] ?? day}</span>
          <span class="legend-count">{visibleCount}</span>
        </div>
      {/each}
      <div class="legend-total">
        Visibili: <strong>{visiblePoints.length}</strong> / {points.length}
      </div>
    </div>
  </div>
</div>

<style>
  .full-map-root {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.25rem 0 0.5rem;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.45rem 0.75rem;
    border: 1.5px solid rgba(27, 58, 107, 0.2);
    background: var(--color-paper, #fffdf7);
    color: var(--color-iznik, #1b3a6b);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  @media (min-width: 768px) {
    .filter-chip {
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      font-size: 0.9rem;
    }
  }

  .filter-chip:hover {
    border-color: var(--color-iznik, #1b3a6b);
  }

  .filter-chip:focus-visible {
    outline: 2px solid var(--color-gold, #c9a961);
    outline-offset: 2px;
  }

  .filter-chip.active {
    background: var(--color-iznik, #1b3a6b);
    color: var(--color-paper, #fffdf7);
    border-color: var(--color-iznik, #1b3a6b);
    box-shadow: 0 2px 6px rgba(27, 58, 107, 0.2);
  }

  .filter-chip.active .count {
    background: rgba(255, 253, 247, 0.2);
    color: var(--color-paper, #fffdf7);
  }

  .chip-all {
    background: var(--color-cream, #f5efe0);
    border-color: var(--color-gold, #c9a961);
  }

  .filter-chip .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    border: 1.5px solid var(--color-paper, #fffdf7);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .filter-chip .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.25rem;
    padding: 0 0.4rem;
    background: rgba(27, 58, 107, 0.1);
    color: var(--color-iznik, #1b3a6b);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .map-area {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(27, 58, 107, 0.15);
    background: var(--color-paper, #fffdf7);
  }

  .full-map {
    width: 100%;
    height: calc(100dvh - 180px);
    min-height: 500px;
  }

  @media (min-width: 768px) {
    .full-map {
      height: calc(100dvh - 120px);
      min-height: 500px;
    }
  }

  .legend {
    position: absolute;
    left: 12px;
    bottom: 12px;
    z-index: 500;
    background: var(--color-paper, #fffdf7);
    border-radius: 12px;
    padding: 0.75rem 0.9rem;
    box-shadow: 0 6px 20px rgba(27, 58, 107, 0.18);
    font-size: 0.85rem;
    max-width: 220px;
    pointer-events: none;
  }

  .legend-title {
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-iznik, #1b3a6b);
    margin-bottom: 0.4rem;
  }

  .legend-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.15rem 0;
    color: var(--color-iznik, #1b3a6b);
    transition: opacity 0.15s ease;
  }

  .legend-row.dim {
    opacity: 0.35;
  }

  .legend-row .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1.5px solid var(--color-paper, #fffdf7);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .legend-label {
    flex: 1;
    font-weight: 500;
  }

  .legend-count {
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--color-garnet, #8b2635);
  }

  .legend-total {
    margin-top: 0.5rem;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(27, 58, 107, 0.1);
    font-size: 0.8rem;
    color: var(--color-iznik, #1b3a6b);
  }

  :global(.full-map-pin) {
    background: transparent !important;
    border: none !important;
  }

  /* Shared popup styling (safe if MiniMap is also mounted) */
  :global(.leaflet-popup-content-wrapper) {
    background: var(--color-paper, #fffdf7);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(27, 58, 107, 0.15);
    padding: 0;
  }

  :global(.leaflet-popup-content) {
    margin: 0;
    padding: 12px 16px;
  }

  :global(.leaflet-popup-tip) {
    background: var(--color-paper, #fffdf7);
  }

  :global(.popup-inner h3) {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-iznik, #1b3a6b);
    line-height: 1.3;
  }

  :global(.popup-inner .popup-btn) {
    display: inline-block;
    padding: 6px 12px;
    background: var(--color-iznik, #1b3a6b);
    color: var(--color-paper, #fffdf7);
    border-radius: 8px;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  :global(.popup-inner .popup-btn:hover),
  :global(.popup-inner .popup-btn:focus-visible) {
    background: var(--color-garnet, #8b2635);
    outline: 2px solid var(--color-gold, #c9a961);
    outline-offset: 2px;
  }
</style>
