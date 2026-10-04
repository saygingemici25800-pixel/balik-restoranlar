import type { Config } from 'tailwindcss';

/**
 * Marka rengi — opaklık ekini (`text-fg/85`, `from-bg/40`) destekler.
 *
 * Renkler `var(--color-x)` (hex token) olduğu için Tailwind onları ayrıştıramıyor ve opaklık ekli
 * sınıfları sessizce HİÇ üretmiyordu. Fonksiyon biçiminde:
 *  - ek yoksa (Tailwind `var(--tw-…-opacity, 1)` geçirir) düz `var(--color-x)` — eskisiyle aynı,
 *  - ek varsa `color-mix(in srgb, var(--color-x) 85%, transparent)`.
 * Tek doğruluk kaynağı yine design-tokens'taki hex; ikinci bir RGB kanal kopyası gerekmez.
 */
type ColorArgs = { opacityValue?: string | number };

/**
 * Tailwind 3 renk fonksiyonunu çalışma zamanında destekler (`opacityValue` ile çağırır), ama
 * `Config` tipi `colors` değerlerini yalnız string olarak tanımlıyor. Dönüşüm yalnız burada.
 */
const asTailwindColor = (fn: (args: ColorArgs) => string) => fn as unknown as string;

type TokenName = 'bg' | 'fg' | 'accent' | 'muted' | 'sand' | 'sand-deep' | 'ink' | 'ink-soft' | 'ember' | 'fg-soft';

const token = (name: TokenName) =>
  asTailwindColor(({ opacityValue }) =>
    opacityValue === undefined || String(opacityValue).startsWith('var(')
      ? `var(--color-${name})`
      : `color-mix(in srgb, var(--color-${name}) calc(${opacityValue} * 100%), transparent)`,
  );

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      bg: token('bg'),
      fg: token('fg'),
      accent: token('accent'),
      muted: token('muted'),
      // Ana sayfa "Ufuk": ikinci zemin (Kum) ve üstündeki metinler
      sand: token('sand'),
      'sand-deep': token('sand-deep'),
      ink: token('ink'),
      'ink-soft': token('ink-soft'),
      ember: token('ember'),
      'fg-soft': token('fg-soft'),
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        fraunces: ['var(--font-fraunces)'],
        mono: ['var(--font-dm-mono)'],
        reader: ['var(--font-newsreader)'],
        // yalnız ana sayfa sarmalayıcısında (`[data-home]`) çözülür
        headline: ['var(--ff-display)'],
        label: ['var(--ff-label)'],
        hand: ['var(--font-handwritten)'],
      },
      keyframes: {
        // Zone pano kartı girişi (docs/zone-3d-modul.md bölüm 7.4)
        'zone-board-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'zone-board-in': 'zone-board-in 0.45s cubic-bezier(0.4, 1.4, 0.7, 0.95) both',
      },
    },
  },
  plugins: [],
};

export default config;
