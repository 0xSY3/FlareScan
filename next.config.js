/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Flare brand colors with pink accent theme
        flare: {
          50: '#fdf2f8',   // Lightest pink
          100: '#fce7f3',  // Very light pink
          200: '#fbcfe8',  // Light pink
          300: '#f9a8d4',  // Medium light pink
          400: '#f472b6',  // Medium pink
          500: '#ec4899',  // Primary pink
          600: '#db2777',  // Darker pink
          700: '#be185d',  // Dark pink
          800: '#9d174d',  // Very dark pink
          900: '#831843',  // Darkest pink
        },
        coral: {
          50: '#fff5f5',
          100: '#fed7d7',
          200: '#feb2b2',
          300: '#fc8181',
          400: '#f56565',
          500: '#e53e3e',
          600: '#c53030',
          700: '#9b2c2c',
          800: '#742a2a',
          900: '#4a1c1c',
        },
        rose: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Enhanced gradients
        gradient: {
          primary: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%)',
          secondary: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
          accent: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'flare-gradient': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%)',
        'flare-mesh': 'radial-gradient(circle at 25% 25%, #ec4899 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f472b6 0%, transparent 50%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideUp': 'slideUp 0.6s ease-out',
        'slideDown': 'slideDown 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'flare': '0 10px 40px rgba(236, 72, 153, 0.15)',
        'flare-lg': '0 20px 60px rgba(236, 72, 153, 0.25)',
        'inner-flare': 'inset 0 2px 10px rgba(236, 72, 153, 0.1)',
      },
    },
  },
  plugins: [],
};