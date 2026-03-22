/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E", 
        secondary: "#14B8A6",
        cta: "#0369A1",
        background: "#F5F5F7", 
        paper: "#FFFFFF",
        text: "#1D1D1F", 
        muted: "#86868B",
        border: "#D2D2D7",
      },
      borderRadius: {
        apple: "12px",
      },
    },
  },
  plugins: [],
}
