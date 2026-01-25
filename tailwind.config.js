// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        terminal: ["JetBrains Mono", "monospace"],
        "terminal-retro": ["VT323", "monospace"],
        "terminal-nier": ["Major Mono Display", "monospace"],
        "noto-jp": ["Noto Sans JP", "sans-serif"],
      },
      colors: {
        nier: {
          bg: "#dcd8c0",
          dark: "#5a5a50",
          mid: "#adaba0",
          "text-dark": "#292925",
          "text-light": "#dcd8c0",
          border: "#a39e8c",
          grid: "#bfbcad",
          accent: "#292925",
          highlight: "#5a5a50",
        },
      },
    },
  },
};
