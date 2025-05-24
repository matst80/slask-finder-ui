/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Add app directory for App Router
  ],
  theme: {
    extend: {
      // Your theme extensions
    },
  },
  plugins: [
    require("tailwind-scrollbar"), // If you're using this plugin
  ],
};
