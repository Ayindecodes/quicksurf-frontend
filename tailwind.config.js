/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/context/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { harbor: "#0E5E78", ink: "#0B1220", porcelain: "#F7F9FB" },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06), 0 8px 20px rgba(14,94,120,.08)",
        soft: "0 10px 30px rgba(14,94,120,.12)",
        glass: "0 8px 24px rgba(11,18,32,.15)",
      },
      borderRadius: { card: "20px" },
      animation: { marquee: "marquee 20s linear infinite" },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};


