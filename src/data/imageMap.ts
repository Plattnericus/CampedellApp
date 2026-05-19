// ============================================================
//  BILDER FÜR GERICHTE
//
//  So fügst du ein Foto zu einem Gericht hinzu:
//  1. Bild in  assets/food/  ablegen  (z. B.  burger.jpg)
//  2. Zeile unten einkommentieren  →  fertig!
//
//  Das Bild erscheint automatisch:
//    • als Thumbnail in der Speisekarte
//    • groß im Detail-View beim Antippen
//
//  Ohne Bild → schöner Farbverlauf mit Icon (kein Fehler).
//
//  Unterstützte Formate: .jpg  .jpeg  .png  .webp
// ============================================================

export const foodImages: Record<string, any> = {

  // ── Vorspeisen ──────────────────────────────────────────
  // 'salat':             require('../../assets/food/salat.jpg'),
  // 'bretteljause':      require('../../assets/food/bretteljause.jpg'),
  // 'avocado':           require('../../assets/food/avocado.jpg'),

  // ── Suppen ──────────────────────────────────────────────
  // 'speckknodel':       require('../../assets/food/speckknodel.jpg'),
  // 'spargelsuppe':      require('../../assets/food/spargelsuppe.jpg'),

  // ── Warme Vorspeisen ────────────────────────────────────
  // 'schlutzkrapfen':    require('../../assets/food/schlutzkrapfen.jpg'),
  // 'knoedeltris':       require('../../assets/food/knoedeltris.jpg'),
  // 'tortelloni':        require('../../assets/food/tortelloni.jpg'),
  // 'brennnesselrisotto':require('../../assets/food/brennnesselrisotto.jpg'),

  // ── Hauptspeisen ────────────────────────────────────────
  // 'entrecote':         require('../../assets/food/entrecote.jpg'),
   'burger':            require('../../assets/food/burger.png'),
  // 'pfeffersteak':      require('../../assets/food/pfeffersteak.jpg'),
  // 'gulasch':           require('../../assets/food/gulasch.jpg'),
  // 'schnitzel':         require('../../assets/food/schnitzel.jpg'),
  // 'spargel':           require('../../assets/food/spargel.jpg'),

  // ── Kinderteller ────────────────────────────────────────
  // 'kids-schnitzel':    require('../../assets/food/kids-schnitzel.jpg'),
  // 'kids-spaghetti':    require('../../assets/food/kids-spaghetti.jpg'),
  // 'kids-grillwurst':   require('../../assets/food/kids-grillwurst.jpg'),
  // 'kids-pommes':       require('../../assets/food/kids-pommes.jpg'),

  // ── Desserts ────────────────────────────────────────────
  // 'buchteln':          require('../../assets/food/buchteln.jpg'),
  // 'vanilleeis':        require('../../assets/food/vanilleeis.jpg'),
  // 'sorbet':            require('../../assets/food/sorbet.jpg'),
  // 'apfelstrudel':      require('../../assets/food/apfelstrudel.jpg'),
  // 'creme-brulee':      require('../../assets/food/creme-brulee.jpg'),

};
