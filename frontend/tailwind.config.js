/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel:
          "0 0 0 1px rgb(255 255 255 / 0.04), 0 12px 40px -12px rgb(0 0 0 / 0.45)",
        "panel-inset": "inset 0 1px 0 0 rgb(255 255 255 / 0.04)",
      },
    },
  },
  plugins: [],
};
