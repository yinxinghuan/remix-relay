// The remix "moves". Each is a one-tap transformation applied to the current
// tip via img2img (ref_url = tip image). The prompt keeps the subject but bends
// the world. Labels are ENGLISH (product default). icon = glyph key in icons.tsx.

import type { Loc } from '../i18n';

export interface Transform {
  id: string;
  label: Loc;
  icon: string;
  prompt: string;
}

export const TRANSFORMS: Transform[] = [
  {
    id: 'ablaze',
    label: { en: 'Set ablaze', zh: '点燃', es: 'En llamas', pt: 'Em chamas' },
    icon: 'flame',
    prompt:
      'the exact same subject and composition, now engulfed in dramatic roaring flames, glowing embers and sparks, intense fiery orange light',
  },
  {
    id: 'underwater',
    label: { en: 'Sink it', zh: '沉入水底', es: 'Húndelo', pt: 'Afundar' },
    icon: 'drop',
    prompt:
      'the exact same subject and composition, now deep underwater, fully submerged, drifting bubbles, blue caustic light, fish swimming past',
  },
  {
    id: 'ancient',
    label: { en: 'Ancient ruins', zh: '远古废墟', es: 'Ruinas', pt: 'Ruínas' },
    icon: 'ruins',
    prompt:
      'the exact same subject and composition, now ancient crumbling ruins overgrown with moss and vines, weathered stone, centuries of decay',
  },
  {
    id: 'future',
    label: { en: 'Far future', zh: '遥远未来', es: 'Futuro', pt: 'Futuro' },
    icon: 'chip',
    prompt:
      'the exact same subject and composition, now a hundred years in the future, neon cyberpunk, glowing holograms, sleek advanced technology',
  },
  {
    id: 'tiny',
    label: { en: 'Shrink it', zh: '变迷你', es: 'Miniatura', pt: 'Miniatura' },
    icon: 'tiny',
    prompt:
      'the exact same subject and composition, rendered as a tiny adorable miniature toy diorama, tilt-shift, tiny scale model on a desk',
  },
  {
    id: 'giant',
    label: { en: 'Go colossal', zh: '变巨大', es: 'Colosal', pt: 'Colossal' },
    icon: 'giant',
    prompt:
      'the exact same subject, now colossal and towering over everything, dramatic low camera angle, epic monumental scale',
  },
  {
    id: 'gold',
    label: { en: 'Turn to gold', zh: '化为黄金', es: 'En oro', pt: 'Em ouro' },
    icon: 'gem',
    prompt:
      'the exact same subject and composition, transformed into shining solid gold, gleaming golden statue, polished metallic reflections',
  },
  {
    id: 'neon',
    label: { en: 'Neon night', zh: '霓虹夜', es: 'Noche neón', pt: 'Noite neon' },
    icon: 'moon',
    prompt:
      'the exact same subject and composition, at night glowing with vivid neon lights and electric city glow, dark moody atmosphere',
  },
  {
    id: 'winter',
    label: { en: 'Deep freeze', zh: '冰封', es: 'Congelar', pt: 'Congelar' },
    icon: 'snow',
    prompt:
      'the exact same subject and composition, buried in deep snow and ice, frozen over, falling snowflakes, pale winter light',
  },
  {
    id: 'storm',
    label: { en: 'Summon storm', zh: '召唤风暴', es: 'Tormenta', pt: 'Tempestade' },
    icon: 'bolt',
    prompt:
      'the exact same subject and composition, in a dramatic thunderstorm, dark churning clouds, forked lightning, heavy driving rain',
  },
  {
    id: 'candy',
    label: { en: 'Made of candy', zh: '糖果做的', es: 'De dulces', pt: 'De doces' },
    icon: 'candy',
    prompt:
      'the exact same subject and composition, made entirely of candy and sweets, glossy frosting, pastel sugary colors, lollipops',
  },
  {
    id: 'cosmic',
    label: { en: 'To the cosmos', zh: '送入宇宙', es: 'Al cosmos', pt: 'Ao cosmos' },
    icon: 'planet',
    prompt:
      'the exact same subject and composition, now floating in deep outer space, swirling galaxies, glowing nebula, scattered stars',
  },
  {
    id: 'jungle',
    label: { en: 'Wild jungle', zh: '丛林吞没', es: 'Selva', pt: 'Selva' },
    icon: 'leaf',
    prompt:
      'the exact same subject and composition, overtaken by a lush wild jungle, dense tropical plants, hanging vines, dappled green light',
  },
  {
    id: 'ghost',
    label: { en: 'Haunt it', zh: '闹鬼', es: 'Embruja', pt: 'Assombrar' },
    icon: 'ghost',
    prompt:
      'the exact same subject and composition, as a ghostly haunted dream, drifting mist, translucent glowing spirits, eerie moonlit pallor',
  },
  {
    id: 'mecha',
    label: { en: 'Mechanize', zh: '机械化', es: 'Mecaniza', pt: 'Mecanizar' },
    icon: 'robot',
    prompt:
      'the exact same subject reimagined as a giant mecha robot, brushed metal plating, glowing power cores, hydraulic joints, sci-fi',
  },
  {
    id: 'stained',
    label: { en: 'Stained glass', zh: '彩绘玻璃', es: 'Vitral', pt: 'Vitral' },
    icon: 'diamond',
    prompt:
      'the exact same subject and composition, as a glowing stained glass window, bold black leading, luminous jewel-toned colored glass',
  },
];

const BY_ID = new Map(TRANSFORMS.map(t => [t.id, t]));
export const transformById = (id: string): Transform | undefined => BY_ID.get(id);

/** Deterministic-ish shuffle: pick `n` distinct transforms, seeded by a number
 *  so the same tip tends to surface the same first set (stable across renders)
 *  yet "other moves" reshuffles with a new seed. */
export function pickTransforms(seed: number, n = 3): Transform[] {
  const pool = [...TRANSFORMS];
  const out: Transform[] = [];
  let s = (seed >>> 0) || 1;
  while (out.length < n && pool.length) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const idx = s % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
