/** Global NO.23 library chrome — destinations wired as the platform grows.
 *
 * TARGET long-term primary navigation (do not invent dead links yet):
 *   BIBLIOTECA · DESCUBRIR · INGREDIENTES · JOURNAL
 *
 * Utility / commerce (visually separated):
 *   SEARCH · NO.23 SHOP · MENU
 *
 * Roadmap only (not primary nav now):
 *   AWARDS
 *
 * HISTORIAS eventually lives under JOURNAL rather than as a redundant top-level item.
 * FAMILIAS eventually lives under DESCUBRIR.
 *
 * Current labels remain safe/non-navigating until destinations exist.
 */
export const LIBRARY_PRIMARY_NAV = [
  { id: "biblioteca", label: "Biblioteca" },
  { id: "descubrir", label: "Descubrir" },
  { id: "ingredientes", label: "Ingredientes" },
  { id: "journal", label: "Journal" },
] as const;

/** Documented future utility cluster — not rendered as fake destinations. */
export const LIBRARY_UTILITY_NAV = [
  { id: "search", label: "Search" },
  { id: "shop", label: "NO.23 Shop" },
  { id: "menu", label: "Menu" },
] as const;
