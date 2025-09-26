/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          brand: '#F4D03F',
          hover: '#F1C40F',
          active: '#D4AC0D',
          light: '#FCF3CF',
          dark: '#B7950B',
          DEFAULT: '#F4D03F',
        },
        
        // Neutral Colors
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#5D6D7E',
          800: '#2C3E50',
          900: '#1C1C1C',
          black: '#1C1C1C',
          white: '#FFFFFF',
        },
        
        // Background Colors
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          sidebar: '#2C2C2C',
          card: '#FFFFFF',
          overlay: 'rgba(44, 44, 44, 0.8)',
          dark: '#1C1C1C',
          'dark-card': '#2C2C2C',
        },
        
        // Text Colors
        text: {
          primary: '#2C3E50',
          secondary: '#5D6D7E',
          light: '#85929E',
          inverse: '#FFFFFF',
          brand: '#B7950B',
          dark: '#1C1C1C',
        },
        
        // Status Colors
        status: {
          success: '#27AE60',
          warning: '#F39C12',
          error: '#E74C3C',
          info: '#3498DB',
          pending: '#95A5A6',
        },
        
        // Category Colors
        category: {
          finance: '#3498DB',
          technology: '#34495E',
          softSkills: '#16A085',
          business: '#2C3E50',
          language: '#8E44AD',
          marketing: '#E67E22',
        },
        
        // Border Colors
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF',
          focus: '#F4D03F',
        },
        
        // Keep existing accent for backward compatibility
        'accent-cyan': '#D7FEFA',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'small': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'large': '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      
      // Extend other theme values as needed
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active'],
      borderColor: ['focus-visible', 'first'],
      ringWidth: ['focus-visible'],
      ringColor: ['focus-visible'],
    },
  },
}
