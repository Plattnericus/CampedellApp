# Campedel Speisekarte

Digitale Speise- und Weinkarte für den Südtiroler Hofschank **Campedèl** auf der Seiser Alm.  
Gebaut mit **Expo SDK 54** / React Native. Dreisprachig: Deutsch · Italiano · English.

---

## Inhalt anpassen

### Speisekarte (`src/data/menu.json`)

Gerichte hinzufügen, löschen oder bearbeiten – einfach JSON editieren:

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

Mögliche Allergene: `gluten` · `dairy` · `eggs` · `nuts` · `fish` · `shellfish` · `soy` · `celery` · `mustard` · `sesame` · `sulphites` · `lupins` · `molluscs` · `peanuts`

### Weinkarte (`src/data/wines.json`)

Weine hinzufügen, löschen oder bearbeiten:

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
  "prices": {
    "bottle": 30.00,
    "glass": 5.00
  },
  "awards": ["Falstaff 92/100"],
  "isOrganic": false
}
```

Kategorien: `sparkling` (Schaumwein) · `white` (Weißwein) · `red` (Rotwein)

Rebsorten-Kürzel: `CH` Chardonnay · `ME` Merlot · `LA` Lagrein · `CS` Cab. Sauvignon · `CF` Cab. Franc · `PN` Pinot Nero · `PB` Pinot Bianco · `SB` Sauvignon Blanc · `RI` Riesling · `VT` Vernatsch

### Fotos hinzufügen (`src/data/imageMap.ts`)

1. Bild in `assets/food/` ablegen (z. B. `burger.jpg`)
2. Zeile in `imageMap.ts` eintragen:
   ```ts
   burger: require('../../assets/food/burger.jpg'),
   ```
3. Im JSON beim Gericht setzen: `"image": "burger"`

Das Bild erscheint dann gross im Detail-View und als Thumbnail in der Liste.

### Kategorien anpassen

Jede Kategorie-Sektion in `menu.json` hat:

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

- `icon` – Name eines [Ionicons](https://ionic.io/ionicons)-Icons
- `gradientStart` / `gradientEnd` – Hintergrundfarbe für Thumbnails (Hex)
- Neue Kategorienamen in `src/i18n/de.ts`, `it.ts`, `en.ts` eintragen

---

## Projekt starten

```bash
npm install
npx expo start
```

Mit der **Expo Go** App scannen oder im Simulator:

```bash
npx expo start --ios
npx expo start --android
```

---

## Projektstruktur

```
src/
  data/
    menu.json        ← Speisekarte (editierbar)
    wines.json       ← Weinkarte (editierbar)
    imageMap.ts      ← Bilder-Pfade
    food.ts          ← TypeScript-Typen
    wines.ts         ← TypeScript-Typen
    drinks.ts        ← Getraenkekarte
  screens/
    MenuScreen       ← Speisekarte mit Suche
    WinesScreen      ← Weinkarte mit Suche
    DrinksScreen     ← Getraenke
    ItemDetailScreen ← Detail-Modal
    InfoScreen       ← Ueber uns
    SplashScreen     ← Ladescreen
  components/
    MenuItemCard     ← Gerichts-Karte
    WineCard         ← Wein-Karte (Apple-Design)
    LanguageSwitcher ← DE / IT / EN mit Slide-Animation
    CampedelLogo     ← Logo
    FadeInView       ← Animations-Wrapper
  i18n/
    de.ts / it.ts / en.ts  ← Uebersetzungen
  theme/
    colors.ts        ← Farbpalette (Burgund / Elfenbein)
    typography.ts    ← iOS-Typographie
assets/
  logo.png           ← App-Icon und Logo
  food/              ← Gerichts-Fotos (optional, leer anlegen)
```

---

## Tech Stack

| Paket | Version |
|---|---|
| Expo SDK | 54 |
| React Native | 0.81 |
| TypeScript | 5.9 |
| Expo Linear Gradient | 15 |
| Expo Haptics | 15 |
| Expo Blur | 15 |
| React Navigation | 7 |
| Ionicons | via @expo/vector-icons |
| react-native-svg | 15 |

---

*Campedel - Sudtirol / Alto Adige*
