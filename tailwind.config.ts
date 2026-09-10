import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#071a32",
        teal: "#078a8d",
        mist: "#f4f8f9",
        cyan: "#dffafa",
      },
      boxShadow: {
        card: "0 18px 50px rgba(7,26,50,.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
