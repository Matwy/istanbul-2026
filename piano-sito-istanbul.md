# Sito gita famiglia a Istanbul — Piano di progetto

Documento di specifica da passare a Claude Code per la costruzione del sito.

---

## 1. Obiettivo

Sito statico monopagina per una gita di famiglia a Istanbul dal **29 ottobre al 3 novembre** (5 giorni). Sette sezioni navigabili, consultazione principalmente da cellulare durante il viaggio.

## 2. Requisiti tecnici

- **Un singolo file `index.html`** con CSS e JavaScript inline (oppure asset in cartelle `/css`, `/js`, `/img` se preferito — decide Claude Code in base a leggibilità)
- **Nessun backend, nessun framework pesante**. HTML + CSS + vanilla JS. Niente React, Next, build step
- **Mobile-first**: design pensato prima per schermi stretti (375px), poi esteso a tablet e desktop
- **Funzionamento offline** dopo il primo caricamento (no chiamate di rete obbligatorie nelle pagine principali; la mappa generale può caricare tile da OSM ma fallback elegante se offline)
- **Navigazione SPA-style**: le sezioni si cambiano via JavaScript senza ricaricare pagina, con hash routing (`#giorno-1`, `#mappa`, ecc.) così i link funzionano
- **Accessibile**: contrasti adeguati, tap target ≥ 44px, testo leggibile senza zoom
- **Lingua**: italiano

## 3. Stile grafico

### Palette
- **Blu profondo Iznik** come colore primario: `#1B3A6B` (e variante più scura `#0F2444` per sfondi, più chiara `#2E5A9E` per accenti)
- **Oro caldo bizantino** come accento: `#C9A961` (variante brillante `#E6C478` per hover)
- **Crema avorio** come sfondo chiaro: `#F5EFE0`
- **Bianco sporco** per superfici card: `#FAF7F0`
- **Rosso granato** come secondario per elementi importanti tipo "attenzione", "chiuso il martedì": `#8B2635`
- **Testo** su crema: `#1A1A1A`; testo secondario: `#5A5A5A`

### Tipografia
- **Titoli**: font serif con personalità, tipo `Cormorant Garamond` o `Playfair Display` (da Google Fonts). Peso 600-700
- **Corpo**: sans serif pulito tipo `Inter` o `DM Sans`. Peso 400 per testo, 500-600 per label

### Pattern decorativi
Usare pattern geometrici ottomani/islamici come dettagli sottili: bordi, separatori tra sezioni, sfondo di header. Esempi:
- Stelle a otto punte
- Rosette geometriche
- Arabeschi semplificati

Tenerli a **bassa opacità** (10-20%) o come outline sottile in oro, mai invadenti. Possono essere SVG inline.

### Atmosfera
Evocare Istanbul storica ma moderno nell'uso: niente finto-antico, niente Comic Sans turco, niente emoji pesanti. Pulito, elegante, con dettagli che richiamano mosaici e piastrelle. Pensare a un libro di viaggio raffinato, non a un'app da ostello.

### Componenti ricorrenti
- **Card attrazione**: immagine in alto, nome grande serif, nome turco in corsivo sotto più piccolo, poi metadata (prezzo, orari) in una riga di chip, descrizione, note pratiche in un box color crema
- **Chip/badge**: per prezzo (oro), orari (blu chiaro), "prenota online" (verde), "chiuso lunedì" (granato)
- **Timeline giornaliera**: linea verticale con pallini oro che segnano le tappe mattino/pomeriggio/sera
- **Bottone "Apri in Google Maps"**: oro su blu, con icona segnaposto, apre `https://www.google.com/maps/search/?api=1&query=LAT,LNG` in nuova tab

## 4. Struttura del sito (7 sezioni)

Header fisso in alto con logo/titolo "Istanbul 2026" (o simile) e menu hamburger su mobile che apre una nav con le 7 sezioni.

### 4.1 Home
- Titolo grande "Istanbul" con sottotitolo "Gita di famiglia · 29 ottobre – 3 novembre"
- **Countdown** ai giorni alla partenza (calcolato in JS dalla data 29/10/2026)
- Griglia di 6 card grandi che linkano alle altre sezioni (Giornate, Mappa, Checklist, Cibo, Quartieri, Trasporti)
- In fondo: box "info rapide" con cambio valuta (1€ = 53 TL, con disclaimer "tasso indicativo"), fuso orario (+1h rispetto all'Italia in quel periodo? Da verificare), lingua, prefisso telefonico

### 4.2 Pagine giornaliere (5 pagine)

Una sezione con tab/selettore in alto per i 5 giorni. Ogni giorno ha:

- **Header del giorno**: data in grande, nome del giorno della settimana, un sottotitolo evocativo che scegli tu (tipo "Giovedì 30 — cuore bizantino e bazar" per il giorno del Sultanahmet)
- **Timeline verticale** con le tappe del giorno divise per Mattino / Pomeriggio / Sera
- Per ogni tappa: card attrazione come descritto sopra, con il bottone "Apri in Mappe"
- **Minimappa laterale** (su desktop) o in fondo (su mobile) che mostra SOLO le tappe di quel giorno pinnate. Usa [Leaflet.js](https://leafletjs.com/) con tile OpenStreetMap (gratuito, nessuna API key). Pin colorati con il colore del giorno

**Dati per giorno** (da usare tali e quali):

**Mercoledì 29 ottobre — Arrivo**
- Sera: Arrivo (orario da definire), metro M11 + M2 dall'aeroporto IST, acquisto Istanbulkart

**Giovedì 30 ottobre — Cuore bizantino**
- Mattino: Hagia Sophia, Moschea Blu
- Pomeriggio: Basilica Cisterna, Gran Bazar, Piazza Taksim via Istiklal Caddesi

**Venerdì 31 ottobre — Sultani e spezie**
- Mattino: Palazzo Topkapi + Harem
- Pomeriggio: Bazar delle Spezie, Moschea di Solimano
- Sera: Cena nel quartiere Beyoğlu

**Sabato 1 novembre — Due continenti**
- Mattino: Zona Asiatica (Kadıköy, Üsküdar)
- Pomeriggio: Ponte e Torre di Galata, Crociera sul Bosforo

**Domenica 2 novembre — Partenza**
- Partenza (orario da definire)

> **Nota**: nel file Excel originale compariva "Sabato 2" e "Domenica 3" ma le date giuste con quell'inizio (Mercoledì 29) sono Sabato **1 novembre** e Domenica **2 novembre**. Ho corretto.

### 4.3 Mappa generale

Mappa Leaflet a tutto schermo con **tutti** i punti del viaggio pinnati, colorati per giorno:
- Giovedì: blu (`#1B3A6B`)
- Venerdì: oro (`#C9A961`)
- Sabato: granato (`#8B2635`)
- Punti "optional/altro" (Dolmabahçe, Çamlıca, Balat, Fener): grigio

Legenda in un box in angolo. Click su un pin apre un popup con nome, giorno, link "Apri in Google Maps".

Sopra la mappa, toggle per filtrare per giorno.

### 4.4 Checklist prima di partire

Lista di cose da fare/portare, raggruppata per categoria. **Spuntabili** con localStorage (checkbox che ricordano il loro stato — NB: non è "note condivise", solo memoria locale del browser per la checklist).

Contenuti:

**Documenti & denaro**
- Carta d'identità valida per espatrio (o passaporto)
- Revolut attivata e fondi caricati
- Contante minimo in euro per emergenza
- Verifica copertura assicurazione sanitaria

**Telefono & connettività**
- Attivare e-SIM turca (se cellulare compatibile) — NON comprare SIM fisica in aeroporto
- Scaricare app **Uber** e **Bitaksi** (tassametro trasparente, il taxi normale frega)
- Scaricare app **IETT** per i bus
- Scaricare **Google Maps offline** di Istanbul
- Scaricare questo sito per consultazione offline (opzionale)

**Abbigliamento per moschee**
- Foulard/velo per donne (anche se alcuni posti li prestano)
- Pantaloni lunghi o gonne lunghe
- Top che copra le spalle
- Scarpe facili da togliere (obbligatorio togliersi per entrare in moschea)

**All'arrivo in aeroporto (IST)**
- Comprare Istanbulkart alle macchinette gialle fuori dagli arrivi — **carta rossa** (si ricarica, si usa in più persone). Costo 165 TL + 35 TL a corsa
- Metro M11 + M2 verso hotel

**Da sapere**
- Booking.com non funziona in Turchia — stampa le prenotazioni prima di partire
- Pagare sempre con carta Revolut (1€ ≈ 53 TL)
- Contrattare al Gran Bazar (ma non al Bazar delle Spezie, prezzi fissi)
- Attenzione ai borseggi al Gran Bazar

### 4.5 Galleria cibo

Griglia di card, una per piatto tipico. Ogni card:
- Spazio per immagine (Claude Code aggiungerà la foto)
- Nome in grande
- Descrizione breve
- Badge tipo "dolce", "street food", "colazione", "da condividere"

Lista piatti (dal file Excel, mantieni questi 12):

1. **Simit** — Ciambella di pane ricoperta di sesamo. Colazione turca per eccellenza. [colazione, street food]
2. **Döner Kebab** — Carne (agnello/pollo) allo spiedo verticale, servita in pita o piatto. [street food]
3. **Balık Ekmek** — Panino con filetto di pesce grigliato. [street food]
4. **Meze** — Antipasti freddi/caldi (hummus, melanzane, feta, polipetto). Si condivide. [da condividere]
5. **Lahmacun** — Pizza turca sottilissima con carne macinata e spezie, arrotolata con limone. [street food]
6. **Menemen** — Uova strapazzate con pomodoro, peperoni e spezie. Colazione classica. [colazione]
7. **Çay** — Tè nero forte servito in bicchierino. Rituale sociale turco. [bevanda]
8. **Türk Kahvesi** — Caffè turco ristretto e denso con fondi. Si beve lentamente. [bevanda]
9. **Baklava** — Dolce a strati di pasta fillo, frutta secca e sciroppo di miele. [dolce]
10. **Lokum (Turkish Delight)** — Gelatine aromatizzate con rose, pistacchio, mastic. [dolce]
11. **Midye Dolma** — Cozze ripiene di riso speziato, vendute per strada. [street food]
12. **Pide** — Barca di pane con ripieni: carne, formaggio, uovo. [da condividere]

### 4.6 Guida quartieri

Sezione con card grandi per ogni quartiere. Layout a due colonne su desktop, stack su mobile.

1. **Sultanahmet** — Cuore storico. Qui trovi Hagia Sophia, Moschea Blu, Palazzo Topkapi, Basilica Cisterna. Zona più turistica
2. **Beyoğlu** — Quartiere mondano e glamour. Piazza Taksim, via Istiklal Caddesi. Pieno di ristoranti e locali, vita notturna
3. **Eminönü** — Zona del Ponte di Galata, del Bazar delle Spezie. Punto di partenza dei traghetti sul Bosforo
4. **Balat** — Antico quartiere ebraico. Molto colorato, famoso per gli ombrelli appesi e le case dai colori vivaci. Instagrammabile
5. **Fener** — Quartiere greco-ortodosso. Chiesa di San Giorgio, Chiesa di Santo Stefano dei Bulgari (ferro battuto)
6. **Fatih** — Zona a maggioranza islamica conservatrice. Moschea di Fatih, mercato, Moschea di Zeyrek
7. **Kadıköy** (lato asiatico) — Vivace, bohémien, mercato, street food, locali. Atmosfera locale, meno turistica
8. **Üsküdar** (lato asiatico) — Storico, moschee antiche, atmosfera autentica. Ideale per passeggiata serale

### 4.7 Trasporti & valuta

Due sotto-sezioni:

**Muoversi a Istanbul**
Tabella/griglia dei mezzi:
- Metro (M) — utile tratte lunghe
- Tram — molto efficiente, T2 tram storico rosso
- Traghetto (Vapur) — collega Europa-Asia, bellissimo al tramonto
- Bus (Otobüs) — solo se sai dove vai, occhio al traffico
- Taxi / Uber / Bitaksi — usa le app, NON il taxi al volo
- Funicolare — evita salita a piedi fino a Taksim

**Istanbulkart** (con box evidenziato):
- Costo carta: 165 TL (~3,12 €)
- Costo a corsa con carta: 35 TL (~0,66 €)
- Corsa singola senza carta: 50 TL (~0,95 €)
- **Carta rossa consigliata**: ricaricabile, usabile da più persone
- Carta azzurra: si basa sui giorni, una per persona
- Si comprano alle macchinette gialle in aeroporto o stazioni metro
- Include anche l'uso dei **bagni pubblici**

**Calcolatori** (in box separati, con input numerici):

1. **Calcolatore trasporti**: input "numero di corse nella giornata" → output costo con Istanbulkart vs singoli biglietti vs quanto risparmi. Mostra tabella mini con 1, 2, 3, 5, 10 corse precalcolate
2. **Convertitore Lira/Euro**: input "€" → output "TL", e viceversa. Tasso 1€ = 53 TL. Disclaimer "tasso indicativo, verifica il giorno della partenza"

## 5. Dati strutturati da usare

Tutte le attrazioni con coordinate approssimative (Claude Code può raffinarle con una ricerca se serve, ma queste sono già utilizzabili):

| Nome | Nome turco | Lat | Lng | Prezzo | Prenota online | Note |
|---|---|---|---|---|---|---|
| Hagia Sophia | Ayasofya | 41.0086 | 28.9802 | 25 € | Sì | Chiusa ~90 min per preghiera. Velo per donne. Vai prestissimo al mattino. Consigliano biglietto salta-fila |
| Moschea Blu | Sultanahmet Camii | 41.0054 | 28.9768 | Gratuito | No | Chiusa 90 min per preghiera (5 volte/giorno). Togliersi le scarpe. In ristrutturazione. Servono coperture (le danno) |
| Palazzo Topkapi + Harem | Topkapı Sarayı | 41.0115 | 28.9833 | ~65 € con Harem | Sì | Chiuso martedì. Orari 9-18. Almeno 3 ore. **Prendere anche l'Harem** |
| Basilica Cisterna | Yerebatan Sarnıcı | 41.0084 | 28.9778 | 37 € (9-18:30) / 57 € (dopo 19:30) | Sì | Orari 9-22 |
| Gran Bazar | Kapalıçarşı | 41.0106 | 28.9681 | Gratuito | No | Chiuso domenica. Attenzione borseggi |
| Bazar delle Spezie | Mısır Çarşısı | 41.0165 | 28.9705 | Gratuito | No | Vicino ponte Galata. Aperto tutti i giorni |
| Musei Archeologici | Arkeoloji Müzesi | 41.0116 | 28.9811 | 15 € | Sì | Tranquillo, poco turistico. Alcune parti in restauro |
| Torre di Galata | Galata Kulesi | 41.0256 | 28.9741 | 30 € | Sì | Coda lunga. Vista splendida al tramonto. Alcuni consigliano di vederla solo da fuori |
| Moschea di Solimano | Süleymaniye Camii | 41.0161 | 28.9640 | Gratuito | No | Poco frequentata, molto apprezzata. Giardini |
| Palazzo Dolmabahçe | Dolmabahçe Sarayı | 41.0391 | 29.0000 | 52,10 € | Sì | Chiuso lunedì. Orari 9-17. Tanta fila |
| Torre della Fanciulla | Kız Kulesi | 41.0211 | 29.0041 | ~350 TL + traghetto | Sì | Simbolo di Istanbul |
| Quartiere Kadıköy | Kadıköy | 40.9903 | 29.0275 | Gratuito | No | Traghetto da Eminönü. Mercato la mattina |
| Çamlıca Camii | — | 41.0253 | 29.0687 | Gratuito | No | Taxi o bus. Moschea più grande di Turchia (2019). Vista panoramica |
| Üsküdar | — | 41.0233 | 29.0151 | Gratuito | No | Traghetto. Passeggiata serale |
| Piazza Taksim | Taksim Meydanı | 41.0370 | 28.9857 | — | — | Piazza principale |
| Via Istiklal Caddesi | İstiklal Caddesi | 41.0336 | 28.9777 | — | — | Via principale pedonale. Vita notturna |
| Ponte di Galata | Galata Köprüsü | 41.0199 | 28.9739 | — | — | Al tramonto |
| Crociera sul Bosforo | — | 41.0199 | 28.9739 | Contenuto | — | Partenza da Eminönü |

**Nota sulla carta museo**: costa 105 €, molti la sconsigliano. Nella sezione attrazioni mettere un box informativo: "Esiste la Museum Pass Istanbul a 105 €: include Topkapi, Archeologici, Dolmabahçe, Galata e altri. Fare i conti: se visiti solo i 2-3 must-see forse non conviene".

## 6. Dettagli tecnici di implementazione

### Mappe
- **Libreria**: Leaflet 1.9.x da CDN (`https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`)
- **Tile**: OpenStreetMap standard (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) — gratis, no API key
- **Pin custom**: SVG inline colorati per giorno
- **Popup**: nome attrazione, giorno, bottone "Apri in Google Maps"
- **Bounds iniziali**: centrare su Istanbul storica (41.0135, 28.9784, zoom 13 desktop, 12 mobile)

### Link Google Maps
Formato: `https://www.google.com/maps/search/?api=1&query={LAT},{LNG}`
Su mobile apre direttamente l'app Google Maps se installata.

### Hash routing
JavaScript vanilla: listen `hashchange`, mostra/nascondi sezioni in base a `location.hash`. Sezioni: `#home`, `#giorno-1` ... `#giorno-5`, `#mappa`, `#checklist`, `#cibo`, `#quartieri`, `#trasporti`.

### Persistenza checklist
`localStorage` con chiave `istanbul-checklist`, salva oggetto `{id_item: true/false}`.

### Responsive breakpoints
- Mobile: fino a 640px (design primario)
- Tablet: 641-1024px
- Desktop: 1025px+

### Icone
Usare [Lucide icons](https://lucide.dev/) inline come SVG (map-pin, clock, ticket, info, check, chevron-down, menu, x) oppure Feather Icons. Evitare libreria intera, copiare i singoli SVG che servono.

### Pattern decorativo
Creare uno o due SVG pattern (stella a 8 punte, rosetta geometrica) da usare in `background-image` con `opacity: 0.08`. Oppure come border decorativi tra sezioni.

### Fonts
Google Fonts con `&display=swap`:
```
Cormorant+Garamond:wght@600;700
Inter:wght@400;500;600
```

## 7. Cosa deve fare Claude Code

1. Creare la struttura del sito seguendo questa specifica
2. **Aggiungere le immagini** delle attrazioni e dei piatti (il sito ha spazi pronti, Claude Code dovrà trovarle o generarle — questo è fuori dallo scope di questo piano)
3. Testare il sito su mobile (usare DevTools responsive mode a 375px)
4. Verificare che la checklist salvi lo stato
5. Verificare che tutti i link Google Maps funzionino
6. Verificare che la mappa Leaflet carichi correttamente

## 8. Cosa NON fare

- Non aggiungere backend, database, autenticazione
- Non usare React/Vue/Svelte o altri framework
- Non aggiungere tracking/analytics
- Non aggiungere la sezione "note/diario condivise" (esplicitamente esclusa)
- Non usare emoji come decorazione principale
- Non usare stock photo generiche da template: le immagini devono essere di attrazioni/piatti reali di Istanbul
- Non inventare prezzi o orari: se un dato manca, mettere "da verificare" o omettere

## 9. Prossimi passi suggeriti (opzionali)

Se vuoi arricchire dopo, cose che si possono aggiungere senza rompere l'impianto:
- Frasi utili in turco (buongiorno, grazie, quanto costa, il conto per favore)
- Meteo dei giorni del viaggio (richiede chiamata API, non più statico)
- QR code per condividere il sito con la famiglia
- Versione stampabile dell'itinerario
