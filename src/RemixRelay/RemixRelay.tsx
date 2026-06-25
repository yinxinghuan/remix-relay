import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { openAigramProfile, telegramId, isInAigram } from '@shared/runtime';
import { useRelay } from './hooks/useRelay';
import { pickTransforms } from './data/transforms';
import { Icon, Monogram } from './assets/icons';
import { t, loc } from './i18n';
import type { RemixNode, Tip, TrailItem } from './types';
import { sfx } from './utils/sounds';
import './RemixRelay.less';

const isUrl = (s?: string) => !!s && /^https?:\/\//.test(s);

function Avatar({ name, url, size = 20 }: { name?: string; url?: string; size?: number }) {
  if (isUrl(url)) {
    return (
      <img
        className="rr-ava"
        src={url}
        alt=""
        draggable={false}
        style={{ width: size, height: size }}
      />
    );
  }
  return <Monogram name={name || '?'} size={size} />;
}

/** Tappable author chip → opens their Aigram profile. Self / seed handled. */
function AuthorChip({
  userId,
  userName,
  userAvatarUrl,
  seed,
}: {
  userId?: string;
  userName?: string;
  userAvatarUrl?: string;
  seed?: boolean;
}) {
  const isMe = !!userId && userId === telegramId;
  if (isMe) {
    return (
      <span className="rr-chip rr-chip--me">
        <span className="rr-chip__name">{t('you')}</span>
      </span>
    );
  }
  const label = seed ? t('house') : userName || 'someone';
  const body = (
    <>
      <Avatar name={label} url={userAvatarUrl} size={20} />
      <span className="rr-chip__name">{label}</span>
    </>
  );
  const tappable = isInAigram && !!userId;
  if (tappable) {
    return (
      <button
        className="rr-chip"
        onClick={e => {
          e.stopPropagation();
          openAigramProfile(userId!);
        }}
      >
        {body}
      </button>
    );
  }
  return <span className="rr-chip">{body}</span>;
}

/** Image that "develops" in: starts blurred/dim/scaled, resolves on load. */
function DevelopImg({ src, className }: { src: string; className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(false), [src]);
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onLoad={() => setReady(true)}
      className={`rr-develop ${ready ? 'is-ready' : ''} ${className || ''}`}
    />
  );
}

/** Build the full lineage (oldest→newest, INCLUDING the item itself as the last step). */
function chainOf(item: {
  trail?: TrailItem[];
  imageUrl: string;
  label?: string;
  transformLabel?: string;
  userId?: string;
  userName?: string;
  userAvatarUrl?: string;
  seed?: boolean;
}, selfUserId?: string): TrailItem[] {
  const self: TrailItem = {
    imageUrl: item.imageUrl,
    label: item.label ?? item.transformLabel ?? '',
    userId: selfUserId ?? item.userId,
    userName: item.userName,
    userAvatarUrl: item.userAvatarUrl,
    seed: item.seed,
  };
  return [...(item.trail || []), self];
}

/** Browse the whole relay chain — swipe the big image or tap a thumbnail to step
 *  through every link of the lineage. Defaults to the latest (tip). */
function ChainViewer({
  chain,
  reveal = false,
  developing = false,
  overlay = null,
}: {
  chain: TrailItem[];
  reveal?: boolean;
  developing?: boolean;
  overlay?: ReactNode;
}) {
  const last = chain.length - 1;
  const [idx, setIdx] = useState(last);

  // snap to the latest whenever the chain changes or a new morph starts
  const tipUrl = chain[last]?.imageUrl;
  useEffect(() => { setIdx(chain.length - 1); }, [chain.length, tipUrl]);
  useEffect(() => { if (developing) setIdx(chain.length - 1); }, [developing, chain.length]);

  const go = (d: number) => {
    const n = Math.max(0, Math.min(chain.length - 1, idx + d));
    if (n !== idx) { sfx.tap(); setIdx(n); }
  };

  const startX = useRef(0);
  const moved = useRef(false);
  const onDown = (e: ReactPointerEvent) => { startX.current = e.clientX; moved.current = false; };
  const onMove = (e: ReactPointerEvent) => { if (Math.abs(e.clientX - startX.current) > 8) moved.current = true; };
  const onUp = (e: ReactPointerEvent) => {
    if (!moved.current) return;
    const dx = e.clientX - startX.current;
    if (dx > 36) go(-1);
    else if (dx < -36) go(1);
  };

  const cur = chain[idx] || chain[last];
  const isLast = idx === last;
  const multi = chain.length > 1;

  return (
    <>
      <div
        className={`rr-stage ${reveal ? 'rr-stage--reveal' : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <DevelopImg src={cur.imageUrl} className="rr-stage__img" />
        {isLast && overlay}
        {multi && (
          <>
            <button
              className="rr-stage__nav rr-stage__nav--prev"
              disabled={idx === 0}
              onPointerDown={e => { e.stopPropagation(); go(-1); }}
              aria-label="previous"
            >
              <Icon name="back" size={20} />
            </button>
            <button
              className="rr-stage__nav rr-stage__nav--next"
              disabled={isLast}
              onPointerDown={e => { e.stopPropagation(); go(1); }}
              aria-label="next"
            >
              <Icon name="arrow" size={20} />
            </button>
            <span className="rr-stage__step">{idx + 1} / {chain.length}</span>
          </>
        )}
      </div>

      <div className="rr-stepby">
        <span className="rr-stepby__move">{cur.label || t('seedRoot')}</span>
        <span className="rr-stepby__lbl">{t('by')}</span>
        <AuthorChip
          userId={cur.userId}
          userName={cur.userName}
          userAvatarUrl={cur.userAvatarUrl}
          seed={cur.seed}
        />
      </div>

      <div className="rr-lineage rr-lineage--nav">
        {chain.map((a, i) => (
          <span className="rr-lineage__item" key={i}>
            <button
              className={`rr-lineage__thumbbtn ${i === idx ? 'is-active' : ''} ${i === last ? 'is-tip' : ''}`}
              onClick={() => { sfx.tap(); setIdx(i); }}
              aria-label={`link ${i + 1}`}
            >
              <img className="rr-lineage__thumb" src={a.imageUrl} alt="" draggable={false} />
            </button>
            {i < last && <span className="rr-lineage__link"><Icon name="chain" size={12} /></span>}
          </span>
        ))}
      </div>
    </>
  );
}

// ── Tip / remix stage ───────────────────────────────────────────────────────

function Stage({
  tip,
  developing,
  busyLabel,
  transforms,
  onRemix,
  onReshuffle,
}: {
  tip: Tip;
  developing: boolean;
  busyLabel: string | null;
  transforms: ReturnType<typeof pickTransforms>;
  onRemix: (id: string) => void;
  onReshuffle: () => void;
}) {
  return (
    <>
      <ChainViewer
        chain={chainOf(tip)}
        developing={developing}
        overlay={
          developing ? (
            <div className="rr-morph">
              <div className="rr-morph__scan" />
              <div className="rr-morph__label">
                <Icon name="wand" size={16} />
                <span>{busyLabel}</span>
                <span className="rr-morph__dots"><i /><i /><i /></span>
              </div>
            </div>
          ) : null
        }
      />

      <div className={`rr-moves ${developing ? 'is-busy' : ''}`}>
        <div className="rr-moves__head">
          <span>{t('yourMove')}</span>
          <button className="rr-shuffle" onPointerDown={onReshuffle} disabled={developing}>
            <Icon name="shuffle" size={15} />
            <span>{t('otherMoves')}</span>
          </button>
        </div>
        <div className="rr-moves__row">
          {transforms.map(tr => (
            <button
              key={tr.id}
              className="rr-move"
              onPointerDown={() => onRemix(tr.id)}
              disabled={developing}
            >
              <span className="rr-move__icon"><Icon name={tr.icon} size={26} /></span>
              <span className="rr-move__label">{loc(tr.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Revealed ────────────────────────────────────────────────────────────────

function Revealed({
  node,
  onPass,
  onWall,
}: {
  node: RemixNode;
  onPass: () => void;
  onWall: () => void;
}) {
  useEffect(() => {
    sfx.reveal();
  }, []);
  return (
    <div className="rr-reveal">
      <ChainViewer
        chain={chainOf(node, node.userId ?? (telegramId || undefined))}
        reveal
        overlay={
          <div className="rr-reveal__badge">
            <Icon name="chain" size={15} />
            <span>{t('youExtended')}</span>
          </div>
        }
      />

      <div className="rr-reveal__cta">
        <button className="rr-btn rr-btn--ghost" onPointerDown={onWall}>
          <Icon name="grid" size={18} />
          <span>{t('seeRelay')}</span>
        </button>
        <button className="rr-btn rr-btn--primary" onPointerDown={onPass}>
          <span>{t('passItOn')}</span>
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Wall ────────────────────────────────────────────────────────────────────

function Wall({
  nodes,
  loaded,
  onPick,
  onClose,
}: {
  nodes: RemixNode[];
  loaded: boolean;
  onPick: (n: RemixNode) => void;
  onClose: () => void;
}) {
  const empty = nodes.length === 0;
  return (
    <div className="rr-wall">
      <div className="rr-wall__top">
        <button className="rr-back" onPointerDown={onClose}>
          <Icon name="back" size={20} />
        </button>
        <div className="rr-wall__title">
          <h2>{t('wallTitle')}</h2>
          <p>{t('wallSub')}</p>
        </div>
      </div>
      {empty ? (
        <div className="rr-wall__empty">
          {loaded ? t('wallEmptyFirst') : isInAigram ? t('wallEmptyFirst') : t('wallEmptyOpen')}
        </div>
      ) : (
        <div className="rr-wall__grid">
          {nodes.map(n => {
            const isMe = n.userId === telegramId;
            const tappable = isInAigram && !!n.userId && !isMe;
            return (
              <button className="rr-cell" key={n.id} onClick={() => onPick(n)}>
                <img className="rr-cell__img" src={n.imageUrl} alt="" draggable={false} loading="lazy" />
                <div className="rr-cell__foot">
                  {tappable ? (
                    <span
                      className="rr-cell__who rr-cell__who--tap"
                      role="button"
                      onClick={e => {
                        e.stopPropagation();
                        openAigramProfile(n.userId!);
                      }}
                    >
                      <Avatar name={n.userName} url={n.userAvatarUrl} size={18} />
                      <span className="rr-cell__name">{n.userName || 'someone'}</span>
                    </span>
                  ) : (
                    <span className="rr-cell__who">
                      {!isMe && <Avatar name={n.userName} url={n.userAvatarUrl} size={18} />}
                      <span className={`rr-cell__name ${isMe ? 'rr-cell__name--me' : ''}`}>
                        {isMe ? t('you') : n.userName || 'someone'}
                      </span>
                    </span>
                  )}
                  <span className="rr-cell__move">{n.transformLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function RemixRelay() {
  const relay = useRelay();

  const transforms = useMemo(
    () => pickTransforms(relay.transformSeed, 3),
    [relay.transformSeed],
  );

  const developing = relay.phase === 'developing';

  return (
    <div className="rr-root">
      <div className="rr-top">
        <div className="rr-brand">
          <span className="rr-brand__r">REMIX</span>
          <span className="rr-brand__l">RELAY</span>
        </div>
        {relay.phase !== 'wall' && (
          <button className="rr-iconbtn" onPointerDown={relay.openWall} aria-label="relay">
            <Icon name="grid" size={20} />
          </button>
        )}
      </div>

      {relay.error && <div className="rr-toast">{t('retry')}</div>}

      <div className="rr-body">
        {relay.phase === 'wall' ? (
          <Wall
            nodes={relay.wallNodes}
            loaded={relay.wallLoaded}
            onPick={n => {
              sfx.tap();
              relay.pickFromWall(n);
            }}
            onClose={relay.closeWall}
          />
        ) : relay.phase === 'revealed' && relay.myNode ? (
          <Revealed
            node={relay.myNode}
            onPass={() => {
              sfx.tap();
              relay.pass();
            }}
            onWall={() => {
              sfx.tap();
              relay.openWall();
            }}
          />
        ) : relay.currentTip ? (
          <Stage
            tip={relay.currentTip}
            developing={developing}
            busyLabel={relay.busyLabel}
            transforms={transforms}
            onRemix={id => {
              const tr = transforms.find(x => x.id === id);
              if (!tr) return;
              sfx.start();
              relay.remix(tr);
            }}
            onReshuffle={() => {
              sfx.shuffle();
              relay.reshuffle();
            }}
          />
        ) : (
          <div className="rr-loading">
            <span className="rr-loading__spin" />
          </div>
        )}
      </div>
    </div>
  );
}
