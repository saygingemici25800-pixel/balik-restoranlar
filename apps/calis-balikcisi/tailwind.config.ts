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

const token = (name: 'bg' | 'fg' | 'accent' | 'muted') =>
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
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        fraunces: ['var(--font-fraunces)'],
        mono: ['var(--font-dm-mono)'],
        reader: ['var(--font-newsreader)'],
      },
    },
  },
  plugins: [],
};

export default config;
