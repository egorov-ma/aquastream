import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".loaded": {
          opacity: "1",
          transform: "scale(1)",
          filter: "blur(0)",
        },
      });
    },
  ],
};

export default config;
