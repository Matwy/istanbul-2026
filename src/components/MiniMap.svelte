<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type * as LeafletNS from 'leaflet';
  import { buildPinSvg } from '../lib/map-utils';

  export type Point = {
    lat: number;
    lng: number;
    name: string;
    id: string;
    googleMapsUrl: string;
  };

  let { points, color }: { points: Point[]; color: string } = $props();

  let container: HTMLDivElement | undefined = $state(undefined);
  let map: LeafletNS.Map | undefined = undefined;
  let L: typeof LeafletNS | undefined = undefined;

  onMount(async () => {
    if (typeof window === 'undefined' || !container) return;

    // Lazy load Leaflet + CSS to avoid SSR/window issues
    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (points.length === 0) {
      map.setView([41.0135, 28.9784], 14);
    } else if (points.length === 1) {
      const p = points[0];
      map.setView([p.lat, p.lng], 14);
    }

    const latLngs: LeafletNS.LatLngExpression[] = [];

    points.forEach((p, i) => {
      if (!L || !map) return;
      const svg = buildPinSvg(color, (i + 1).toString());
      const icon = L.divIcon({
        html: svg,
        className: 'mini-map-pin',
        iconSize: [32, 42],
        iconAnchor: [16, 41],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([p.lat, p.lng], {
        icon,
        title: p.name,
        alt: p.name,
      }).addTo(map);

      const safeName = escapeHtml(p.name);
      const safeUrl = escapeAttr(p.googleMapsUrl);
      marker.bindPopup(
        `<div class="popup-inner">
          <h3>${safeName}</h3>
          <a class="popup-btn" href="${safeUrl}" target="_blank" rel="noopener">Apri in Maps &rarr;</a>
        </div>`,
        { closeButton: true, maxWidth: 260 }
      );

      latLngs.push([p.lat, p.lng]);
    });

    if (latLngs.length >= 2 && map) {
      map.fitBounds(latLngs as LeafletNS.LatLngBoundsExpression, {
        padding: [32, 32],
        maxZoom: 15,
      });
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = undefined;
    }
  });

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

<div class="mini-map-wrapper" role="application" aria-label="Mappa delle tappe">
  <div bind:this={container} class="mini-map"></div>
</div>

<ol class="mini-map-fallback" aria-label="Elenco tappe">
  {#each points as p, i (p.id)}
    <li>
      <span class="idx" aria-hidden="true">{i + 1}</span>
      <span class="name">{p.name}</span>
      <a href={p.googleMapsUrl} target="_blank" rel="noopener" class="maps-link">
        Apri in Maps &rarr;
      </a>
    </li>
  {/each}
</ol>

<style>
  .mini-map-wrapper {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(27, 58, 107, 0.12);
    background: var(--color-paper, #fffdf7);
  }

  .mini-map {
    width: 100%;
    height: 300px;
  }

  @media (min-width: 768px) {
    .mini-map {
      height: 450px;
    }
  }

  .mini-map-fallback {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mini-map-fallback li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-paper, #fffdf7);
    border: 1px solid rgba(27, 58, 107, 0.08);
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .mini-map-fallback .idx {
    min-width: 1.6rem;
    height: 1.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-iznik, #1b3a6b);
    color: var(--color-paper, #fffdf7);
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.8rem;
  }

  .mini-map-fallback .name {
    flex: 1;
    color: var(--color-iznik, #1b3a6b);
    font-weight: 500;
  }

  .mini-map-fallback .maps-link {
    color: var(--color-garnet, #8b2635);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .mini-map-fallback .maps-link:hover,
  .mini-map-fallback .maps-link:focus-visible {
    text-decoration: underline;
  }

  /* Leaflet pin marker: strip default divIcon background */
  :global(.mini-map-pin) {
    background: transparent !important;
    border: none !important;
  }

  /* Popup styling (global because Leaflet injects outside component scope) */
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
