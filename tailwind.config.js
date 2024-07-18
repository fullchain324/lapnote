/** @type {import('tailwindcss').Config} */
export default {
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "night",
      {
        darkBlue: {
          "primary": "#8280F6",
          "secondary": "#4CA6EC",
          "accent": "#D34FEA",
          "neutral": "#e0e0e0",
          "neutral-content": "#000",
          "base-100": "#1a1a1a",
          "info": "#354AFF",
          "success": "#4CA986",
          "warning": "#FEBE01",
          "error": "#FF5861",
        },
      }
    ],
    darkTheme: 'darkBlue'
  },
  theme: {
    extend: {},
  },
}

