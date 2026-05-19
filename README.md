# Campedel App

Digitale Speise- und Weinkarte für den Südtiroler Hofschank **Campedèl** auf der Seiser Alm.  
Gebaut mit **Expo SDK 54** / React Native. Dreisprachig: Deutsch · Italiano · English.

---

## Features

- Speise-, Wein- und Getränkekarte mit Detailansicht
- Volltext-Suche in allen Karten
- Allergenkennzeichnung nach EU-Norm
- Dreisprachig (DE / IT / EN) – live umschaltbar im Header
- Animierter Splash Screen
- Natives iOS-Feeling: Blur-Tab-Bar, Haptic Feedback, Reanimated-Animationen

---

## Projekt starten

**Voraussetzungen:** Node.js ≥ 18, npm, Expo CLI

```bash
npm install
npx expo start
```

Mit der **Expo Go** App scannen oder im Simulator/Emulator starten:

```bash
npx expo start --ios
npx expo start --android
npx expo start --web
```

---

## Projektstruktur

```
CampedellApp/
├── assets/                  # Bilder, Icons, Logo
├── src/
│   ├── components/
│   │   ├── AllergenBadge    # Allergen-Icons nach EU-Norm
│   │   ├── CampedelLogo     # SVG-Logo
│   │   ├── FadeInView       # Animierter Einblend-Wrapper
│   │   ├── LanguageSwitcher # DE / IT / EN mit Slide-Animation
│   │   ├── MenuItemCard     # Gerichts-Karte
│   │   ├── SectionHeader    # Kategorieüberschrift
│   │   └── WineCard         # Wein-Karte
│   ├── data/
│   │   ├── menu.json        # Speisekarte (editierbar)
│   │   ├── wines.json       # Weinkarte (editierbar)
│   │   ├── drinks.ts        # Getränkekarte
│   │   ├── imageMap.ts      # Bildpfade Speisen
│   │   └── wineImageMap.ts  # Bildpfade Weine
│   ├── i18n/
│   │   ├── de.ts            # Deutsche Übersetzungen
│   │   ├── it.ts            # Italienische Übersetzungen
│   │   └── en.ts            # Englische Übersetzungen
│   ├── navigation/          # AppNavigator (Stack + Bottom Tabs)
│   ├── screens/
│   │   ├── SplashScreen     # Animierter Startbildschirm
│   │   ├── HomeScreen       # Startseite
│   │   ├── MenuScreen       # Speisekarte mit Suche
│   │   ├── DrinksScreen     # Getränkekarte
│   │   ├── WinesScreen      # Weinkarte mit Suche
│   │   ├── ItemDetailScreen # Detail-Modal Gerichte
│   │   └── WineDetailScreen # Detail-Modal Weine
│   └── theme/
│       ├── colors.ts        # Farbpalette (Burgund / Elfenbein)
│       └── typography.ts    # iOS-Typografie-System
├── App.tsx
└── app.json
```

---

## Inhalte anpassen

### Speisekarte (`src/data/menu.json`)

```json
{
  "id": "mein-gericht",
  "name": { "de": "Mein Gericht", "it": "Il mio piatto", "en": "My dish" },
  "description": {
    "de": "Beschreibung auf Deutsch.",
    "it": "Descrizione in italiano.",
    "en": "Description in English."
  },
  "price": 18.90,
  "allergens": ["gluten", "dairy"],
  "isVegetarian": false,
  "isVegan": false,
  "image": "mein-gericht"
}
```

**Mögliche Allergene:** `gluten` · `dairy` · `eggs` · `nuts` · `fish` · `shellfish` · `soy` · `celery` · `mustard` · `sesame` · `sulphites` · `lupins` · `molluscs` · `peanuts`

### Weinkarte (`src/data/wines.json`)

```json
{
  "id": "mein-wein",
  "name": "Mein Wein",
  "winery": "Weingut Muster",
  "region": "Südtirol / Alto Adige",
  "doc": "Südtirol DOC",
  "dryness": "trocken",
  "grapes": ["CH", "PB"],
  "description": {
    "de": "Weinbeschreibung auf Deutsch.",
    "it": "Descrizione del vino in italiano."
  },
  "prices": { "bottle": 30.00, "glass": 5.00 },
  "awards": ["Falstaff 92/100"],
  "isOrganic": false
}
```

**Kategorien:** `sparkling` · `white` · `red`

**Rebsorten-Kürzel:** `CH` Chardonnay · `ME` Merlot · `LA` Lagrein · `CS` Cab. Sauvignon · `CF` Cab. Franc · `PN` Pinot Nero · `PB` Pinot Bianco · `SB` Sauvignon Blanc · `RI` Riesling · `VT` Vernatsch

### Fotos hinzufügen

1. Bild in `assets/food/` ablegen (z. B. `burger.jpg`)
2. Eintrag in `src/data/imageMap.ts` ergänzen:
   ```ts
   burger: require('../../assets/food/burger.jpg'),
   ```
3. Im JSON beim Gericht setzen: `"image": "burger"`

### Kategorien anpassen

```json
{
  "id": "mains",
  "categoryKey": "mains",
  "icon": "restaurant",
  "gradientStart": "#FFE0E0",
  "gradientEnd": "#FF9090",
  "items": [...]
}
```

- `icon` – [Ionicons](https://ionic.io/ionicons)-Name
- `gradientStart` / `gradientEnd` – Hintergrundfarbe für Thumbnails (Hex)
- Neue Kategorienamen in `src/i18n/de.ts`, `it.ts`, `en.ts` eintragen

---

## Tech Stack

| Paket | Version |
|---|---|
| Expo SDK | ~54 |
| React Native | 0.81 |
| TypeScript | ~5.9 |
| React Navigation | 7 (Stack + Bottom Tabs) |
| Reanimated | ~4.1 |
| Gesture Handler | ~2.28 |
| Expo Blur | ~15 |
| Expo Haptics | ~15 |
| Expo Linear Gradient | ~15 |
| react-native-svg | 15 |
| Ionicons | via @expo/vector-icons |

---

*Campedèl — Südtirol / Alto Adige*
