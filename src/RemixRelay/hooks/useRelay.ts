// Core loop for Remix Relay.
//
// Serve a tip → player taps a move → img2img remixes it → the result becomes a
// new chain link the player owns, the previous author gets a notify, and the
// player is handed a fresh tip. The "wall" (other players' recent remixes) is
// both the display surface and the pool of tips to serve.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useGenImage,
  useGameEvent,
  telegramId,
  isInAigram,
} from '@shared/runtime';
import { useGameSave } from '@shared/save';
import { useWall } from './useWall';
import { seedTips } from '../data/seeds';
import { loc } from '../i18n';
import type { Transform } from '../data/transforms';
import {
  type Phase,
  type RemixNode,
  type RemixSave,
  type Tip,
  type TrailItem,
  REMIX_CAP,
  TRAIL_CAP,
} from '../types';

const GAME_ID = 'remix-relay';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nodeToTip(n: RemixNode): Tip {
  return {
    id: n.id,
    imageUrl: n.imageUrl,
    depth: n.depth,
    trail: n.trail || [],
    label: n.transformLabel,
    userId: n.userId,
    userName: n.userName,
    userAvatarUrl: n.userAvatarUrl,
    seed: false,
  };
}

export interface UseRelay {
  phase: Phase;
  currentTip: Tip | null;
  myNode: RemixNode | null;
  busyLabel: string | null; // transform label currently developing
  error: boolean;
  transformSeed: number;
  remix: (t: Transform) => void;
  reshuffle: () => void;
  pass: () => void;
  openWall: () => void;
  closeWall: () => void;
  pickFromWall: (n: RemixNode) => void;
  wallNodes: RemixNode[];
  wallLoaded: boolean;
}

export function useRelay(): UseRelay {
  const { generate } = useGenImage();
  const event = useGameEvent();
  const save = useGameSave<RemixSave>(GAME_ID);
  const wall = useWall();

  const [phase, setPhase] = useState<Phase>('tip');
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [myNode, setMyNode] = useState<RemixNode | null>(null);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [transformSeed, setTransformSeed] = useState(() =>
    Math.floor(Math.random() * 1e9),
  );

  // Local save mirror (useGameSave never echoes writes back — own it locally).
  const remixesRef = useRef<RemixNode[]>([]);
  const remixedRef = useRef<Set<string>>(new Set());
  const playsRef = useRef(0);
  const seededMirror = useRef(false);
  const notified = useRef<Set<string>>(new Set());

  // Tip queue.
  const queueRef = useRef<Tip[]>([]);
  const servedFirst = useRef(false);

  // Seed the mirror once the cloud/local save resolves.
  useEffect(() => {
    if (seededMirror.current || save.savedData === undefined) return;
    seededMirror.current = true;
    const s = save.savedData;
    if (s) {
      remixesRef.current = s.remixes || [];
      remixedRef.current = new Set(s.remixedTipIds || []);
      playsRef.current = s.plays || 0;
    }
  }, [save.savedData]);

  // Build a fresh queue from the current pool, excluding already-remixed tips
  // and the player's own work. Real strangers' tips first, then seeds.
  const buildQueue = useCallback((): Tip[] => {
    const others = wall.nodes
      .filter(n => n.userId && n.userId !== telegramId)
      .map(nodeToTip);
    const seeds = seedTips();
    let pool = [...shuffle(others), ...shuffle(seeds)].filter(
      t => !remixedRef.current.has(t.id),
    );
    // If everything's been remixed, allow re-serving (each remix is still new).
    if (pool.length === 0) pool = [...shuffle(others), ...shuffle(seeds)];
    return pool;
  }, [wall.nodes]);

  const serveNext = useCallback(() => {
    if (queueRef.current.length === 0) queueRef.current = buildQueue();
    const next = queueRef.current.shift() || null;
    setCurrentTip(prev => {
      // Avoid serving the exact same tip twice in a row when possible.
      if (next && prev && next.id === prev.id && queueRef.current.length) {
        const after = queueRef.current.shift()!;
        queueRef.current.unshift(next);
        return after;
      }
      return next;
    });
    setTransformSeed(Math.floor(Math.random() * 1e9));
  }, [buildQueue]);

  // First tip: serve immediately from seeds so the first paint isn't blank.
  useEffect(() => {
    if (servedFirst.current) return;
    const seeds = seedTips();
    if (seeds.length === 0) return;
    servedFirst.current = true;
    queueRef.current = shuffle(seeds);
    setCurrentTip(queueRef.current.shift() || null);
  }, []);

  // Once the wall loads, refresh the upcoming queue so real remixes get served.
  useEffect(() => {
    if (!wall.loaded) return;
    queueRef.current = buildQueue();
  }, [wall.loaded, wall.nodes, buildQueue]);

  const remix = useCallback(
    async (t: Transform) => {
      if (!currentTip || phase === 'developing') return;
      setError(false);
      setBusyLabel(loc(t.label));
      setPhase('developing');
      const tip = currentTip;
      try {
        const url = await generate({ prompt: t.prompt, ref_url: tip.imageUrl });

        const parentTrailItem: TrailItem = {
          imageUrl: tip.imageUrl,
          label: tip.label || '',
          userId: tip.userId,
          userName: tip.userName,
          userAvatarUrl: tip.userAvatarUrl,
          seed: tip.seed,
        };
        const trail = [...tip.trail, parentTrailItem].slice(-TRAIL_CAP);
        const node: RemixNode = {
          id: crypto.randomUUID(),
          imageUrl: url,
          prompt: t.prompt,
          transformId: t.id,
          transformLabel: t.label.en, // store English (product default)
          createdAt: Date.now(),
          depth: tip.depth + 1,
          parentUserId: tip.seed ? undefined : tip.userId,
          parentSeed: !!tip.seed,
          trail,
        };

        // Persist (mirror → single write).
        remixesRef.current = [node, ...remixesRef.current].slice(0, REMIX_CAP);
        remixedRef.current.add(tip.id);
        playsRef.current += 1;
        save.persist({
          remixes: remixesRef.current,
          remixedTipIds: Array.from(remixedRef.current).slice(-100),
          plays: playsRef.current,
        });

        setMyNode(node);
        setBusyLabel(null);
        setPhase('revealed');

        // Notify the author whose image I remixed (never seed/self, dedupe).
        if (
          node.parentUserId &&
          node.parentUserId !== telegramId &&
          !notified.current.has(node.parentUserId)
        ) {
          notified.current.add(node.parentUserId);
          event.trigger('remix_pass', {
            actions: [
              {
                type: 'notify',
                target_user_id: node.parentUserId,
                image: {
                  ref_url: url,
                  prompt: 'Someone remixed your image in the relay.',
                },
                message: {
                  template: '{sender_name} remixed your image',
                  variables: ['sender_name'],
                },
              },
            ],
          });
        }
      } catch {
        setBusyLabel(null);
        setError(true);
        setPhase('tip');
      }
    },
    [currentTip, phase, generate, event, save],
  );

  const reshuffle = useCallback(
    () => setTransformSeed(Math.floor(Math.random() * 1e9)),
    [],
  );

  const pass = useCallback(() => {
    setMyNode(null);
    setError(false);
    setPhase('tip');
    serveNext();
    wall.refresh();
  }, [serveNext, wall]);

  const openWall = useCallback(() => setPhase('wall'), []);
  const closeWall = useCallback(
    () => setPhase(myNode ? 'revealed' : 'tip'),
    [myNode],
  );

  const pickFromWall = useCallback((n: RemixNode) => {
    setMyNode(null);
    setError(false);
    setCurrentTip(nodeToTip(n));
    setTransformSeed(Math.floor(Math.random() * 1e9));
    setPhase('tip');
  }, []);

  return {
    phase,
    currentTip,
    myNode,
    busyLabel,
    error,
    transformSeed,
    remix,
    reshuffle,
    pass,
    openWall,
    closeWall,
    pickFromWall,
    wallNodes: wall.nodes,
    wallLoaded: wall.loaded && isInAigram,
  };
}
