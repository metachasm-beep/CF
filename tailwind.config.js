/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E", 
        secondary: "#14B8A6",
        cta: "#007AFF", // HIG systemBlue
        background: "#F2F2F7", // HIG secondarySystemBackground
        paper: "#FFFFFF", // HIG systemBackground
        text: "#1C1C1E", // HIG label
        muted: "#8E8E93", // HIG systemGray
        border: "#C6C6C8", // HIG separator
        systemGray2: "#AEAEB2",
        systemGray3: "#C7C7CC",
        systemGray4: "#D1D1D6",
        systemGray5: "#E5E5EA",
        systemGray6: "#F2F2F7",
      },
      borderRadius: {
        apple: "14px",
        sheet: "32px",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'apple': '0 4px 24px -4px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
        'elevation': '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
