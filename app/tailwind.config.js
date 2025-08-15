/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FCE5F0",
          500: "#F4468F",
          600: "#D53C7D",
          gradientStart: "#F4468F",
          gradientEnd: "#8743FF"
        },
        text: {
          default: "#1E1B1C",
          muted: "#8C7F86",
          onBrand: "#FFFFFF"
        },
        bg: {
          page: "#F7F0EC",
          panel: "#FFFFFF",
          field: "#F6EFEB",
          subtle: "#EFE6E0"
        },
        border: {
          subtle: "#E6DAD2",
          strong: "#CDBCB1"
        },
        chart: {
          rangeFill: "#C9B8FF",
          rangeStroke: "#A78BFA",
          actual: "#5B3BFF",
          axis: "#9C8EAA"
        },
        feedback: {
          good: "#23A26D",
          warn: "#E6A700",
          danger: "#E45858"
        }
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        pill: "999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px"
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.06)",
        md: "0 4px 8px rgba(0,0,0,0.08)"
      },
      fontFamily: {
        body: ["Noto Sans", "sans-serif"],
        heading: ["Noto Sans", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}