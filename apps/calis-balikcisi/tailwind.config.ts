import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      bg: 'var(--color-bg)',
      fg: 'var(--color-fg)',
      accent: 'var(--color-accent)',
      muted: 'var(--color-muted)',
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
