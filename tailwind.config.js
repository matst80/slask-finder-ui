/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        cartAdd: {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0",
          },
          "20%": {
            transform: "scale(1.1)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        cartAdd: "cartAdd 1s ease-out",
      },
    },
  },
  plugins: [],
};
