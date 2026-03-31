/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E86DE",
        secondary: "#28B463",
        bg: "#F8F9FA",
        textMain: "#2C3E50",
        brand: "#E8330A",
        accent: "#F5A623",
        darkFoot: "#2C3E50",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Roboto", "sans-serif"],
      },
      fontSize: {
        h1: ["34px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["19px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6" }],
        body: ["14px", { lineHeight: "1.5" }],
        small: ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        card: "12px",
        pill: "100px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.08)",
        header: "0 2px 8px rgba(0,0,0,0.06)",
        hover: "0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
