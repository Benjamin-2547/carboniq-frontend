// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/app/**/*.{js,ts,jsx,tsx}",
//     "./src/components/**/*.{js,ts,jsx,tsx}",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: { extend: {} },
//   plugins: [],
// };

import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0B1210',
        'bg-gradient-start': '#0F1A13',
        'bg-gradient-end': '#182314',
        'primary-green': '#00C96B',
        'secondary-lime': '#A3FF9E',
        'accent-blue': '#3ABFF8',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CBD5E1',
        'card-bg': '#121A16',
        'border-muted': '#1F2A20',
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(135deg, #0F1A13 0%, #182314 100%)',
      },
    },
  },
  plugins: [],
}

export default config
