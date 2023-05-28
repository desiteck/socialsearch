/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",    
  ],
  mode : 'jit',
  theme: {
    extend: {
      colors:{
        transparent: 'transparent',
        'blueGray':{
          900 : '#0f172a',
          800 : '#1e293b',
          700 : '#223043',
          600 : '#26354A',
          500 : '#64748b',
          400 : '#94a3b8',
          300 : '#cbd5e1',
          200 : '#e2e8f0',  
          100 : '#f1f5f9'      
        },
        'greenHighlight':{
          200:'#1994B1',
          100:'#00B297'
        },
      }
    },
  },
  fontFamily: {
    sans: ['Graphik', 'sans-serif'],
    serif: ['Merriweather', 'serif'],
  },
  plugins: [],
}