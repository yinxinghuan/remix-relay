// Cross-user wall. Reads every recent player's saved remixes from the
// platform's session-scoped save list, flattens them, resolves avatar+name, and
// returns a flat RemixNode[] the game uses BOTH to display the relay wall AND as
// the pool of tips to serve. Old ancestors that rolled off this window are still
// visible because each node froze its lineage inline (see types.ts).

import { useCallback, useEffect, useState } from 'react';
import { callAigramAPI, isInAigram, type AigramResponse } from '@shared/runtime';
import { getGameUuid } from '@shared/runtime/game-id';
import type { RemixNode, RemixSave } from '../types';

interface SaveRow {
  user_id: string;
  time: string;
  resource_data: string;
}
interface Profile {
  name?: string;
  head_url?: string;
}

export interface UseWall {
  nodes: RemixNode[];
  loaded: boolean;
  refresh: () => void;
}

export function useWall(): UseWall {
  const [nodes, setNodes] = useState<RemixNode[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getGameUuid();
    if (!isInAigram || !sessionId) {
      setLoaded(true);
      return;
    }
    (async () => {
      try {
        const res = await callAigramAPI<AigramResponse<SaveRow[]>>(
          `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(sessionId)}`,
          'GET',
        );
        const rows = Array.isArray(res?.data) ? res.data : [];
        const flat: RemixNode[] = [];
        for (const row of rows) {
          if (!row.user_id || !row.resource_data) continue;
          try {
            const save = JSON.parse(row.resource_data) as RemixSave;
            for (const n of save.remixes || []) {
              if (n && n.imageUrl && n.id) {
                flat.push({ ...n, userId: row.user_id });
              }
            }
          } catch {
            /* skip corrupt row */
          }
        }
        flat.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        const limited = flat.slice(0, 60);

        // Resolve profiles for display + tappable chips.
        const ids = Array.from(
          new Set(limited.map(n => n.userId).filter(Boolean) as string[]),
        );
        const profEntries = await Promise.all(
          ids.map(async uid => {
            try {
              const r = await callAigramAPI<AigramResponse<Profile>>(
                `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(uid)}`,
                'GET',
              );
              return [uid, r?.data ?? null] as const;
            } catch {
              return [uid, null] as const;
            }
          }),
        );
        const profMap = new Map(profEntries);
        const withProfiles = limited.map(n => {
          const p = n.userId ? profMap.get(n.userId) : null;
          return { ...n, userName: p?.name, userAvatarUrl: p?.head_url };
        });
        if (!cancelled) setNodes(withProfiles);
      } catch {
        if (!cancelled) setNodes([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { nodes, loaded, refresh };
}
