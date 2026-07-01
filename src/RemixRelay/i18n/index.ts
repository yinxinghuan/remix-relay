// Lightweight i18n. Product default is ENGLISH. Other locales are opt-in and
// auto-detected from the device, with English as the universal fallback.
export type Locale = 'en' | 'zh' | 'es' | 'pt';
export const LOCALES: Locale[] = ['en', 'zh', 'es', 'pt'];

export interface Loc {
  en: string;
  zh: string;
  es: string;
  pt: string;
}

function norm(raw: string): Locale | undefined {
  const l = raw.toLowerCase();
  if (l.startsWith('zh')) return 'zh';
  if (l.startsWith('es')) return 'es';
  if (l.startsWith('pt')) return 'pt';
  if (l.startsWith('en')) return 'en';
  return undefined;
}

function detectLocale(): Locale {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    const u = q && norm(q);
    if (u) return u;
  } catch {
    /* ignore */
  }
  try {
    const o = localStorage.getItem('remix_relay_locale');
    const u = o && norm(o);
    if (u) return u;
  } catch {
    /* ignore */
  }
  try {
    const langs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    for (const l of langs) {
      const u = norm(l);
      if (u) return u;
    }
  } catch {
    /* ignore */
  }
  return 'en';
}

export let locale: Locale = detectLocale();

export function setLocale(l: Locale) {
  locale = l;
  try {
    localStorage.setItem('remix_relay_locale', l);
  } catch {
    /* ignore */
  }
}

export function loc(x: Loc): string {
  return x[locale] || x.en;
}

const STRINGS: Record<string, Loc> = {
  brand: { en: 'REMIX RELAY', zh: 'REMIX RELAY', es: 'REMIX RELAY', pt: 'REMIX RELAY' },
  yourMove: { en: 'Your move', zh: '该你出招', es: 'Tu jugada', pt: 'Sua vez' },
  otherMoves: { en: 'Other moves', zh: '换一批', es: 'Otras', pt: 'Outras' },
  by: { en: 'by', zh: '来自', es: 'por', pt: 'por' },
  you: { en: 'YOU', zh: '你', es: 'TÚ', pt: 'VOCÊ' },
  house: { en: 'the relay', zh: '接力站', es: 'el relevo', pt: 'o revezamento' },
  passItOn: { en: 'Pass it on', zh: '传下去', es: 'Pásalo', pt: 'Passe adiante' },
  seeRelay: { en: 'The relay', zh: '接力墙', es: 'El relevo', pt: 'O revezamento' },
  back: { en: 'Back', zh: '返回', es: 'Atrás', pt: 'Voltar' },
  youExtended: { en: 'You extended the chain', zh: '你接长了这条链', es: 'Extendiste la cadena', pt: 'Você esticou a corrente' },
  linkN: { en: 'Link {n}', zh: '第 {n} 环', es: 'Eslabón {n}', pt: 'Elo {n}' },
  seedRoot: { en: 'Original', zh: '原图', es: 'Original', pt: 'Original' },
  reveal: { en: 'Remixing…', zh: '变形中…', es: 'Remezclando…', pt: 'Remixando…' },
  wallTitle: { en: 'The relay', zh: '接力墙', es: 'El relevo', pt: 'O revezamento' },
  wallSub: { en: 'Tap any image to remix it next.', zh: '点任意一张，接着把它变形', es: 'Toca una imagen para remezclarla.', pt: 'Toque numa imagem para remixar.' },
  wallEmptyOpen: { en: 'Open in AlterU to join the relay.', zh: '在 AlterU 中打开，加入接力', es: 'Abre en AlterU para unirte.', pt: 'Abra no AlterU para participar.' },
  downloadAlterU: { en: 'Get AlterU on the App Store', zh: '下载 AlterU', es: 'Obtén AlterU en App Store', pt: 'Baixe o AlterU na App Store' },
  wallEmptyFirst: { en: 'No remixes yet — start the chain.', zh: '还没人接力，你来起头', es: 'Aún no hay remixes — empieza tú.', pt: 'Ainda sem remixes — comece você.' },
  retry: { en: 'That remix slipped away. Try again.', zh: '这次变形跑掉了，再试一次', es: 'Ese remix se escapó. Inténtalo.', pt: 'Esse remix escapou. Tente de novo.' },
  tapHint: { en: 'Tap a move to remix this image', zh: '点一个动作，把这张图变形', es: 'Toca una jugada para remezclar', pt: 'Toque numa jogada para remixar' },
  passedTo: { en: 'You picked up where {name} left off', zh: '你接住了 {name} 留下的图', es: 'Retomaste lo de {name}', pt: 'Você continuou de {name}' },
};

/** Interpolate {n}/{name}/… vars into a translated string. */
export function t(key: keyof typeof STRINGS, vars?: Record<string, string | number>): string {
  const s = STRINGS[key];
  let out = s ? loc(s) : (key as string);
  if (vars) {
    for (const k of Object.keys(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    }
  }
  return out;
}
