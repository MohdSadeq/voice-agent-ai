import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chat-specific color tokens mapped to CSS variables
        "chat-accent": "hsl(var(--chat-accent))",
        "chat-accent-hover": "hsl(var(--chat-accent-hover))",
        "chat-accent-foreground": "hsl(var(--chat-accent-foreground))",

        "chat-window": "hsl(var(--chat-window))",
        "chat-border": "hsl(var(--chat-border))",

        "chat-header": "hsl(var(--chat-header))",
        "chat-header-foreground": "hsl(var(--chat-header-foreground))",
        "chat-header-muted": "hsl(var(--chat-header-muted))",

        "chat-messages": "hsl(var(--chat-messages))",

        "chat-user": "hsl(var(--chat-user))",
        "chat-user-foreground": "hsl(var(--chat-user-foreground))",
        "chat-user-avatar": "hsl(var(--chat-user-avatar))",
        "chat-user-avatar-foreground": "hsl(var(--chat-user-avatar-foreground))",

        "chat-bot": "hsl(var(--chat-bot))",
        "chat-bot-foreground": "hsl(var(--chat-bot-foreground))",
        "chat-bot-avatar": "hsl(var(--chat-bot-avatar))",
        "chat-bot-avatar-foreground": "hsl(var(--chat-bot-avatar-foreground))",

        "chat-input-bg": "hsl(var(--chat-input-bg))",
        glow: {
          red: "hsl(var(--glow-red))",
          "red-dim": "hsl(var(--glow-red-dim))",
        },
        particle: {
          red: "hsl(var(--particle-red))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px hsl(var(--glow-red) / 0.5)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px hsl(var(--glow-red) / 0.8)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
