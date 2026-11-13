import type { Nonprofit } from "../types";

/**
 * Static charity list for the Phase 1 search box (screen 01).
 * Phase 3 replaces this with Every.org search. Slugs and EINs here are
 * placeholders, NOT real identifiers; don't use them for payments.
 */
export const MOCK_NONPROFITS: Nonprofit[] = [
  { slug: "sf-marin-food-bank", name: "SF-Marin Food Bank", ein: "00-0000001", location: "San Francisco, CA", logoUrl: null },
  { slug: "marin-community-food-pantry", name: "Marin Community Food Pantry", ein: "00-0000002", location: "San Rafael, CA", logoUrl: null },
  { slug: "extrafood", name: "ExtraFood.org", ein: "00-0000003", location: "San Rafael, CA", logoUrl: null },
  { slug: "marin-humane", name: "Marin Humane", ein: "00-0000004", location: "Novato, CA", logoUrl: null },
  { slug: "canal-alliance", name: "Canal Alliance", ein: "00-0000005", location: "San Rafael, CA", logoUrl: null },
  { slug: "ritter-center", name: "Ritter Center", ein: "00-0000006", location: "San Rafael, CA", logoUrl: null },
  { slug: "homeward-bound-of-marin", name: "Homeward Bound of Marin", ein: "00-0000007", location: "Novato, CA", logoUrl: null },
  { slug: "marin-literacy-project", name: "Marin Literacy Project", ein: "00-0000008", location: "Larkspur, CA", logoUrl: null },
  { slug: "bay-area-youth-music", name: "Bay Area Youth Music", ein: "00-0000009", location: "Oakland, CA", logoUrl: null },
  { slug: "golden-gate-wildlife-rescue", name: "Golden Gate Wildlife Rescue", ein: "00-0000010", location: "Sausalito, CA", logoUrl: null },
  { slug: "first-book-bay-area", name: "First Book Bay Area", ein: "00-0000011", location: "San Francisco, CA", logoUrl: null },
  { slug: "coastal-cleanup-collective", name: "Coastal Cleanup Collective", ein: "00-0000012", location: "Pacifica, CA", logoUrl: null },
];
