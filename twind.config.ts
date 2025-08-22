import { install } from 'https://cdn.twind.style';

install({
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Inter"', 'sans-serif'],
        'serif': ['"Lora"', 'serif'],
        'mono': ['"Fira Code"', 'monospace'],
      },
      colors: {
        'primary': 'var(--color-primary, #8B5CF6)',
        'secondary': 'var(--color-secondary, #EC4899)',
        'background': 'var(--color-background, #111827)',
        'surface': 'var(--color-surface, #1F2937)',
        'text-main': 'var(--color-text-main, #F9FAFB)',
        'text-secondary': 'var(--color-text-secondary, #9CA3AF)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
});
