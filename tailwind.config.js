/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx}', './context/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Semantic tokens (all map to CSS variables) ──────────────────
        // Usage: bg-canvas, bg-canvas-subtle, bg-surface, bg-surface-raised ...
        canvas:  { DEFAULT: 'var(--bg)',             subtle:   'var(--bg-subtle)' },
        surface: { DEFAULT: 'var(--surface)',         raised:   'var(--surface-raised)',   overlay: 'var(--surface-overlay)' },
        line:    { DEFAULT: 'var(--border)',           strong:   'var(--border-strong)',    focus:   'var(--border-focus)' },
        fg:      { DEFAULT: 'var(--fg)',               muted:    'var(--fg-muted)',          dim:     'var(--fg-dim)',        inverse: 'var(--fg-inverse)' },
        brand:   { DEFAULT: 'var(--brand)',            strong:   'var(--brand-strong)',     fg:      'var(--brand-fg)' },
        accent:  { DEFAULT: 'var(--accent)',           hover:    'var(--accent-hover)',      subtle:  'var(--accent-subtle)', muted:   'var(--accent-muted)', fg: 'var(--accent-fg)' },
        danger:  { DEFAULT: 'var(--error)',            subtle:   'var(--error-subtle)' },
        positive:{ DEFAULT: 'var(--success)',          subtle:   'var(--success-subtle)' },
        caution: { DEFAULT: 'var(--warning)',          subtle:   'var(--warning-subtle)' },
      },
      boxShadow: {
        'card':       '0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        'modal':      '0 24px 64px -12px rgba(0,0,0,0.24)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.02em',
      },
    },
  },
  plugins: [],
}
