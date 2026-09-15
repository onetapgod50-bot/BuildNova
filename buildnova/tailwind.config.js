/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        evergreen: {
          950: '#0E1F17',
          900: '#132B20',
          800: '#1B4332',
          700: '#245A3F',
          600: '#2F714E'
        },
        site: {
          green: '#3FA65B',
          amber: '#E0972B',
          red: '#C4453B',
          blue: '#3E7CB1'
        },
        ink: {
          950: '#14171A',
          900: '#1B1F1D',
          800: '#262B28',
          700: '#3A413C',
          500: '#6B746E',
          300: '#A7AFA9'
        },
        paper: {
          50: '#F7F8F5',
          100: '#EFF1EB',
          200: '#E2E5DD'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(247,248,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(247,248,245,0.06) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '28px 28px'
      }
    }
  },
  plugins: []
};
