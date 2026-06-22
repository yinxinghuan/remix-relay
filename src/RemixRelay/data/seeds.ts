// Cold-start seed tips. Surreal single-subject images bundled in public/seeds/.
// Every seed is attributed to ONE real account (the creator's) so its author
// chip opens a real, tappable Aigram profile — NOT a fabricated user. Seeds keep
// the relay alive for brand-new players and in non-Aigram preview. Remixing a
// seed does NOT notify (we don't want to spam the house account).

import type { Tip } from '../types';

export const SEED_USER_ID = '618336286'; // creator's real telegram_id

const SEED_COUNT = 8;

/** Resolve a build-relative asset path to an ABSOLUTE public URL. Needed because
 *  seed images are passed to img2img as `ref_url` — the gen-image server fetches
 *  them over the network, so a relative or origin-relative path won't do. Built
 *  from the live page URL, so it stays correct under any deploy sub-path
 *  (portability standard: no hardcoded absolute paths in source). */
function absUrl(rel: string): string {
  try {
    return new URL(rel, document.baseURI).href;
  } catch {
    return rel;
  }
}

/** Seed tips, oldest→newest. Empty if SEED_USER_ID is unset (stay inert). */
export function seedTips(): Tip[] {
  if (!SEED_USER_ID) return [];
  const base = import.meta.env.BASE_URL; // './' under the portable base
  return Array.from({ length: SEED_COUNT }, (_, i) => ({
    id: 'seed-' + i,
    imageUrl: absUrl(`${base}seeds/seed-${i}.webp`),
    depth: 0,
    trail: [],
    userId: SEED_USER_ID,
    seed: true,
  }));
}
