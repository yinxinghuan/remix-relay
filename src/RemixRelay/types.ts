// Remix Relay — data model.
//
// A "chain" is a lineage of images linked by remixing. There is no global
// append-only store: the platform save list only returns recent users' latest
// saves, so OLD ancestors roll off the window. To survive that, every RemixNode
// FREEZES its last few ancestors inline as a `trail` — the lineage strip renders
// from the node itself, never from other users' (possibly gone) saves.

/** A frozen ancestor in a lineage strip. */
export interface TrailItem {
  imageUrl: string;
  label: string; // the transform that produced this image ('' for a seed root)
  userId?: string; // author (absent / house account for seed roots)
  userName?: string;
  userAvatarUrl?: string;
  seed?: boolean;
}

/** One image a player contributed by remixing a tip. */
export interface RemixNode {
  id: string;
  imageUrl: string;
  prompt: string; // the transform prompt fragment used for img2img
  transformId: string;
  transformLabel: string; // English label of the move (for display + trail)
  createdAt: number;
  depth: number; // how deep in its chain (seed root = 0)
  parentUserId?: string; // author of the tip I remixed (notify target); absent for seed/self
  parentSeed?: boolean;
  trail: TrailItem[]; // frozen ancestors oldest→newest, last ~4, NOT including self
  // Filled when read back from the wall:
  userId?: string;
  userName?: string;
  userAvatarUrl?: string;
}

/** Per-user save: the player's own contributions + lightweight stats. */
export interface RemixSave {
  remixes: RemixNode[]; // newest first, capped
  remixedTipIds: string[]; // tip ids already remixed (don't re-serve), capped
  plays: number;
}

/** A remixable image handed to the player. Either a seed or a wall node. */
export interface Tip {
  id: string;
  imageUrl: string;
  depth: number;
  trail: TrailItem[]; // this tip's ancestors, oldest→newest
  label?: string; // the transform that produced this tip ('' / undefined for seed root)
  userId?: string; // author of this tip
  userName?: string;
  userAvatarUrl?: string;
  seed?: boolean;
}

export type Phase = 'tip' | 'developing' | 'revealed' | 'wall';

export const REMIX_CAP = 20;
export const TRAIL_CAP = 4;
