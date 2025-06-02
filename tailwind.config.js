/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53E3E', // Red for blood donation theme
          dark: '#C53030',
          light: '#FC8181'
        },
        secondary: {
          DEFAULT: '#2B6CB0', // Blue for medical theme
          dark: '#2C5282',
          light: '#63B3ED'
        },
        background: {
          DEFAULT: '#F7FAFC',
          dark: '#EDF2F7'
        }
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
      }
    }
  },
  plugins: []
} 