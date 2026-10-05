/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#168A44',
          hover: '#13773b',
          light: '#DCFCE7',
          dark: '#126B37',
        },
        sidebar: {
          bg: '#126B37',
          active: '#168A44',
          hover: '#0e562c',
          text: '#FFFFFF',
          muted: '#D1E7DD',
        },
        background: '#F7F8FA',
        surface: '#FFFFFF',
        border: '#DDE1E5',
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#5F6368',
        },
        risk: {
          critical: '#DC2626',
          criticalBg: '#FEF2F2',
          criticalBorder: '#FCA5A5',
          high: '#EA580C',
          highBg: '#FFF7ED',
          highBorder: '#FDBA74',
          medium: '#D97706',
          mediumBg: '#FFFBEB',
          mediumBorder: '#FCD34D',
          low: '#168A44',
          lowBg: '#DCFCE7',
          lowBorder: '#86EFAC',
          healthy: '#168A44',
          healthyBg: '#DCFCE7',
          healthyBorder: '#86EFAC',
        }
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '4px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
