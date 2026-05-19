# Campedèl App

> Digitale Speise-, Getränke- und Weinkarte für den Südtiroler Hofschank **Campedèl** auf der Seiser Alm / Alpe di Siusi.  
> Gebaut mit **Expo SDK 54 · React Native · TypeScript** — dreisprachig: Deutsch · Italiano · English.

---

## Screenshots

| Home | Speisekarte | Getränke | Weinkarte |
|------|-------------|----------|-----------|
| Hero-Slideshow mit Ken-Burns-Zoom | Sektionsliste mit Suche & Filter | Horizontale Karussells pro Kategorie | Scrollbare Weinkarte mit Filtern |

---

## Features

### Inhalt & Daten
- Alle Inhalte werden **live von der REST-API** geladen (`https://api-campedel.pokyh.com/api`)
- **AsyncStorage-Cache** — beim App-Start frisch geladen, innerhalb einer Session aus dem Cache bedient
- **Pull-to-Refresh** pro Screen mit eigenem lokalen Spinner-State (kein Cross-Screen-Bleed)
- **API-Retry** mit exponentiellem Backoff (3 Versuche: 1 s → 2 s → 4 s)
- **Bild-Retry** — bis zu 2 automatische Nachladeversuche bei fehlgeschlagenen Image-Requests

### Navigation & UI
- **Bottom-Tab-Navigation** (Home · Speisekarte · Getränke · Weinkarte)
- **Blur-Tab-Bar** auf iOS (Glaseffekt via `expo-blur`)
- **Tab-Switch-Fade** — jeder Screen blendet beim Fokus sanft ein
- **Scroll-to-Top** beim Tab-Wechsel automatisch
- **Dreisprachig** — DE / IT / EN live umschaltbar im Header ohne Reload

### Screens

#### Home
- **Hero-Slideshow** mit echtem Crossfade (parallele Opacity-Animationen, kein Flicker)
- **Ken-Burns-Zoom** (scale 1.0 → 1.08) während der Anzeigedauer
- **Animierte Dot-Indikatoren** — Breite (6 px → 18 px) und Opacity per Animated.Value
- Schnellzugriff-Karten zu allen Menükarten mit Live-Zählern aus der API

#### Speisekarte
- Sektionsliste mit scrollbaren **Kategorie-Pills** (auto-scroll zum aktiven Tab)
- **Volltext-Suche** (Name, Beschreibung)
- **Dynamische Filter** — vegan, vegetarisch, glutenfrei, laktosefrei, nussfrei
- **Animierter Filter-Sheet** mit Spring-Bounce auf Chips und gestaffeltem Fade-in
- **Detail-Bottom-Sheet** mit Pan-Gesture zum Schließen, Bild, Allergen-Badges
- Items beim Filtern animiert neu eingeblendet (`FadeInView` mit Stagger)

#### Getränke
- **Horizontale Karussells** pro Kategorie mit `snapToInterval` für sauberes Scrollen
- **Detail-Bottom-Sheet** mit Preisübersicht und Bild/Gradient-Fallback
- **Dynamischer Filter** — Kategorien werden beim Start automatisch aus den API-Daten generiert, nichts hardgecoded

#### Weinkarte
- Einheitliche Scroll-Liste durch alle Kategorien (Sekt · Weißwein · Rotwein)
- Suche nach Name, Weingut, Region, Beschreibung
- Filter nach Bio, Lokal, Trocken/Halbtrocken/Lieblich
- Detailseite mit Rebsorte, DOC, Preisen, Auszeichnungen

### Animationen
- Alles über die **React Native Animated API** (native Driver wo immer möglich)
- Keine externen Animationsbibliotheken für Custom-Animationen
- Bottom-Sheets mit Pan-Gesture + Spring-Animation zum Öffnen/Schließen
- `FadeInView`-Komponente mit Opacity + TranslateY-Stagger für Listen-Items

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 (New Architecture aktiviert) |
| Sprache | TypeScript ~5.9 |
| Navigation | React Navigation 7 — Bottom Tabs + Native Stack |
| Animationen | React Native `Animated` API |
| Gesten | `react-native-gesture-handler` ~2.28 |
| Persistenz | `@react-native-async-storage/async-storage` 2.2 |
| Icons | `@expo/vector-icons` — Ionicons |
| Blur / Glas | `expo-blur` ~15 |
| Gradienten | `expo-linear-gradient` ~15 |
| Haptics | `expo-haptics` ~15 |
| SVG | `react-native-svg` 15 |
| React | 19.1 |
| React Native | 0.81.5 |

---

## Projektstruktur

```
CampedellApp/
├── assets/
│   ├── restaurant.jpg           # Hero-Bild 1
│   ├── restaurant2.webp         # Hero-Bild 2
│   ├── restaurant3.jpeg         # Hero-Bild 3
│   ├── logo.png                 # App-Icon & Splash
│   └── ...
├── src/
│   ├── components/
│   │   ├── AllergenBadge.tsx    Allergen-Icons nach EU-Norm
│   │   ├── CampedelLogo.tsx     SVG-Logo-Komponente
│   │   ├── FadeInView.tsx       Animierter Fade + Slide-Wrapper
│   │   ├── FilterSheet.tsx      Animierter Bottom-Sheet für Filter
│   │   ├── LanguageSwitcher.tsx DE / IT / EN mit Gleit-Pill
│   │   ├── MenuItemCard.tsx     Speisekarten-Karte mit Bild-Retry
│   │   ├── SectionHeader.tsx    Kategorie-Titelzeile
│   │   └── WineCard.tsx         Weinkarten-Karte
│   ├── data/
│   │   ├── DataContext.tsx      Globaler Datenprovider (Fetch + Cache)
│   │   ├── food.ts              FoodItem / FoodSection Typen
│   │   ├── drinks.ts            DrinkItem / DrinkSection Typen
│   │   └── wines.ts             Wine / WineSection / WineCategoryMeta Typen
│   ├── i18n/
│   │   ├── index.tsx            useLanguage Hook
│   │   ├── de.ts                Deutsch (Translations-Typ-Quelle)
│   │   ├── it.ts                Italiano
│   │   └── en.ts                English
│   ├── navigation/
│   │   └── index.tsx            AppNavigator — Stack + Tabs + AppHeader
│   ├── screens/
│   │   ├── SplashScreen.tsx     Branded Ladebildschirm
│   │   ├── HomeScreen.tsx       Startseite mit Hero-Slideshow
│   │   ├── MenuScreen.tsx       Speisekarte
│   │   ├── DrinksScreen.tsx     Getränkekarte
│   │   ├── WinesScreen.tsx      Weinkarte
│   │   ├── ItemDetailScreen.tsx Detail-Sheet für Speisen
│   │   └── WineDetailScreen.tsx Detail-Sheet für Weine
│   ├── services/
│   │   └── apiService.ts        Fetch + Retry + AsyncStorage-Cache
│   └── theme/
│       ├── colors.ts            Alpine-Grün Farbpalette
│       └── typography.ts        iOS-Typografie-System
├── app.json                     Expo-Konfiguration
├── package.json
└── tsconfig.json
```

---

## Schnellstart

### Voraussetzungen

- [Node.js](https://nodejs.org) ≥ 18
- [Expo CLI](https://docs.expo.dev/more/expo-cli/): `npm install -g expo-cli`
- iOS Simulator (Xcode) **oder** Android Emulator **oder** [Expo Go](https://expo.dev/client) auf dem Gerät

### Installation

```bash
git clone https://github.com/Nexor/CampedellApp.git
cd CampedellApp
npm install
```

### Starten

```bash
# Expo Dev-Server
npm start

# Direkt auf Plattform öffnen
npm run ios
npm run android
npm run web
```

> Port 8081 belegt? `npx expo start --port 8082`

---

## API

Alle Daten kommen vom separaten Node.js / Express + SQLite Backend:

```
https://api-campedel.pokyh.com/api
```

| Endpunkt | Inhalt |
|---|---|
| `GET /api/menu` | Speisekarte — Sektionen, Items, Preise, Allergene, Bilder |
| `GET /api/drinks` | Getränke — Kategorien, Items, Preise, Bilder |
| `GET /api/wines` | Weinkarte — Sektionen (sparkling/white/red), Weindaten |

### Cache-Strategie

```
App-Start          → immer frisch von der API (forceRefresh = true)
                     → Fallback auf Cache bei Netzwerkfehler
Während der Session → Cache direkt, kein Netzwerkaufruf
Pull-to-Refresh    → Nutzerausgelöst, lädt frisch und aktualisiert Cache
```

Cache-Keys: `campedel_menu_cache` · `campedel_drinks_cache` · `campedel_wines_cache`

---

## Internationalisierung

Die App unterstützt **Deutsch (de)**, **Italiano (it)** und **English (en)**.

Der `Translations`-Typ ist in `src/i18n/de.ts` definiert. `it.ts` und `en.ts` implementieren dasselbe Interface — TypeScript meldet fehlende Schlüssel beim Kompilieren.

Der Sprachwechsel ist über den Header-Switcher jederzeit live möglich ohne Neu-Laden.

---

## Theme

Alle Farben sind in `src/theme/colors.ts` zentralisiert. Die Palette ist von der Südtiroler Berglandschaft inspiriert:

| Token | Wert | Verwendung |
|---|---|---|
| `accent` | `#7EA13B` | Primärfarbe — Buttons, aktive Zustände, Icons |
| `accentLight` | `#EEF5DC` | Hintergrundflächen mit Tint |
| `accentDark` | `#587129` | Text auf hellem Hintergrund |
| `accentMid` | `#6B8932` | Icons, Highlights |
| `background` | `#FAF6F1` | Warmes Elfenbein — App-Hintergrund |
| `surface` | `#FFFFFF` | Karten und Bottom-Sheets |
| `primary` | `#1A1208` | Nahezu schwarzes Warmbraun — Überschriften |
| `secondary` | `#4A3828` | Fließtext |
| `tertiary` | `#9A8476` | Beschriftungen, sekundäre Labels |

---

## Production Build

Die App nutzt den **Expo Managed Workflow**. Für einen Production-Build:

```bash
# EAS CLI installieren
npm install -g eas-cli

# Einmalig konfigurieren
eas build:configure

# iOS Production Build
eas build --platform ios

# Android Production Build
eas build --platform android
```

Bundle-IDs:
- iOS: `it.campedel.speisekarte`
- Android: `it.campedel.speisekarte`

---

## Backend

Das Backend-Repository (`campedel-backend`) wird separat gepflegt — Node.js · Express · SQLite.  
Der API-Endpunkt ist in `src/services/apiService.ts` konfiguriert.

---

## Lizenz

Privat — alle Rechte vorbehalten. © Campedèl, Seiser Alm, Südtirol / Alto Adige.
