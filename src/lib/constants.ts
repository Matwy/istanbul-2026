export const TRIP = {
  start: '2026-10-29',
  end: '2026-11-02',
  startLabel: '29 ottobre',
  endLabel: '2 novembre',
  year: 2026,
  title: 'Istanbul 2026',
  subtitle: 'Gita di famiglia · 29 ottobre – 2 novembre',
} as const;

export const EXCHANGE = {
  eurToTl: 53,
  disclaimer: 'Tasso indicativo, verifica il giorno della partenza.',
} as const;

export const ISTANBULKART = {
  cardCost: 165,
  perRide: 35,
  singleRide: 50,
  cardCostEur: 3.12,
  perRideEur: 0.66,
  singleRideEur: 0.95,
  singleTable: [
    { rides: 1, tl: 50, eur: 0.95 },
    { rides: 2, tl: 90, eur: 1.70 },
    { rides: 3, tl: 145, eur: 2.74 },
    { rides: 5, tl: 205, eur: 3.88 },
    { rides: 10, tl: 400, eur: 7.57 },
  ],
} as const;

export const QUICK_INFO = [
  { label: 'Valuta', value: 'Lira turca (TL)', note: '1 € ≈ 53 TL' },
  { label: 'Fuso orario', value: '+2h rispetto all\'Italia', note: 'Turchia non applica ora legale' },
  { label: 'Lingua', value: 'Turco', note: 'Inglese nelle zone turistiche' },
  { label: 'Prefisso', value: '+90', note: 'Istanbul: 212 (Eu), 216 (As)' },
  { label: 'Corrente', value: '230V, presa tipo F', note: 'Stessa presa italiana, spesso Schuko' },
  { label: 'Emergenze', value: '112', note: 'Numero unico europeo' },
] as const;

export const HOME_CARDS = [
  { href: '/giorno/1', title: 'Le 5 giornate', description: 'Itinerario dettagliato con orari e mappe', icon: 'calendar-days' },
  { href: '/mappa', title: 'Mappa generale', description: 'Tutti i punti del viaggio, filtrabili per giorno', icon: 'map' },
  { href: '/checklist', title: 'Checklist', description: 'Cosa portare, cosa fare prima di partire', icon: 'check-square' },
  { href: '/cibo', title: 'Cibo turco', description: '12 piatti da provare', icon: 'utensils' },
  { href: '/quartieri', title: 'Quartieri', description: 'Le 8 zone da scoprire', icon: 'building-2' },
  { href: '/trasporti', title: 'Trasporti', description: 'Mezzi, Istanbulkart, calcolatori', icon: 'bus' },
] as const;
