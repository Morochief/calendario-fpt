import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            /* ========================================
               Colors — Federation Elite Palette
               ======================================== */
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",

                // Core palette
                "bg-elite": "var(--color-bg)",
                surface: "var(--color-surface)",
                "cop-blue": {
                    DEFAULT: "var(--color-cop-blue)",
                    50: "rgba(30, 58, 138, 0.02)",
                    100: "rgba(30, 58, 138, 0.04)",
                    200: "rgba(30, 58, 138, 0.06)",
                    300: "rgba(30, 58, 138, 0.08)",
                    400: "rgba(30, 58, 138, 0.12)",
                    500: "rgba(30, 58, 138, 0.15)",
                    600: "rgba(30, 58, 138, 0.25)",
                    700: "#1E3A8A",
                },
                "fpt-red": {
                    DEFAULT: "var(--color-fpt-red)",
                    50: "rgba(217, 30, 24, 0.04)",
                    100: "rgba(217, 30, 24, 0.06)",
                    200: "rgba(217, 30, 24, 0.08)",
                    300: "rgba(217, 30, 24, 0.12)",
                    400: "rgba(217, 30, 24, 0.2)",
                    500: "rgba(217, 30, 24, 0.25)",
                    600: "#c41a15",
                    700: "#D91E18",
                    800: "#b91c1b",
                },

                // Text hierarchy
                "text-elite": "var(--color-text)",
                "text-secondary": "var(--color-text-secondary)",
                "text-muted": "var(--color-text-muted)",

                // Borders
                "border-elite": "var(--color-border)",
                "border-hover": "var(--color-border-hover)",

                // Status / Semantic
                status: {
                    success: "var(--color-success)",
                    "success-bg": "rgba(34, 197, 94, 0.08)",
                    "success-glow": "rgba(34, 197, 94, 0.2)",
                    "success-text": "#166534",
                    warning: "var(--color-warning)",
                    "warning-bg": "rgba(234, 179, 8, 0.08)",
                    "warning-text": "#854d0e",
                    error: "var(--color-error)",
                    "error-bg": "rgba(217, 30, 24, 0.05)",
                    info: "var(--color-info)",
                    "info-bg": "rgba(30, 58, 138, 0.06)",
                },
            },

            /* ========================================
               Shadows — Blue-tinted elevation system
               ======================================== */
            boxShadow: {
                "elite-xs": "0 1px 2px rgba(30, 58, 138, 0.04)",
                "elite-sm":
                    "0 1px 4px rgba(30, 58, 138, 0.06), 0 1px 2px rgba(30, 58, 138, 0.04)",
                "elite-md":
                    "0 4px 16px rgba(30, 58, 138, 0.08), 0 2px 4px rgba(30, 58, 138, 0.04)",
                "elite-lg":
                    "0 8px 32px rgba(30, 58, 138, 0.10), 0 4px 8px rgba(30, 58, 138, 0.06)",
                "elite-xl":
                    "0 16px 48px rgba(30, 58, 138, 0.12), 0 8px 16px rgba(30, 58, 138, 0.06)",

                // Glow effects
                "glow-blue": "0 0 0 3px rgba(30, 58, 138, 0.08)",
                "glow-red": "0 0 0 3px rgba(217, 30, 24, 0.08)",
                "glow-success": "0 0 0 3px rgba(34, 197, 94, 0.1)",

                // Button-specific shadows
                "btn-red": "0 1px 3px rgba(217, 30, 24, 0.2)",
                "btn-red-hover": "0 4px 12px rgba(217, 30, 24, 0.25)",
                "btn-blue": "0 2px 8px rgba(30, 58, 138, 0.3)",

                // Hero
                "hero-logo": "0 8px 40px rgba(0, 0, 0, 0.08)",
                "hero-logo-hover": "0 16px 48px rgba(0, 0, 0, 0.12)",
            },

            /* ========================================
               Border Radius — System tokens
               ======================================== */
            borderRadius: {
                "elite-sm": "8px",
                "elite-md": "12px",
                "elite-lg": "16px",
            },

            /* ========================================
               Spacing & Sizing
               ======================================== */
            maxWidth: {
                admin: "1000px",
                main: "1120px",
                login: "400px",
                toast: "380px",
                dialog: "400px",
            },

            height: {
                header: "64px",
                "header-mobile": "56px",
            },

            /* ========================================
               Typography — Tracking & Leading
               ======================================== */
            letterSpacing: {
                elite: "-0.03em",
                "elite-sm": "-0.01em",
                "elite-md": "-0.02em",
                caps: "0.04em",
                wide: "0.02em",
            },

            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "1" }],
                "admin-xs": ["0.6875rem", { lineHeight: "1.4" }],
                "admin-sm": ["0.8125rem", { lineHeight: "1.5" }],
                "admin-base": ["0.9375rem", { lineHeight: "1.6" }],
                "hero-title": [
                    "3.5rem",
                    { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "800" },
                ],
                "hero-title-mobile": [
                    "2.5rem",
                    { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "800" },
                ],
                "section-title": [
                    "1.375rem",
                    { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "600" },
                ],
                "stat-value": [
                    "2rem",
                    { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" },
                ],
            },

            /* ========================================
               Transitions — Timing functions
               ======================================== */
            transitionTimingFunction: {
                bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
                "out-back": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            },

            transitionDuration: {
                fast: "150ms",
                normal: "250ms",
                slow: "400ms",
            },

            /* ========================================
               Animations — All keyframes
               ======================================== */
            keyframes: {
                // Dropdown / Menu
                "dropdown-fade": {
                    from: { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
                    to: { opacity: "1", transform: "translateY(0) scale(1)" },
                },

                // Hero
                "hero-fade-in": {
                    from: { opacity: "0", transform: "translateY(20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },

                // Hero arrow bounce
                "arrow-bounce": {
                    "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
                    "40%": { transform: "translateY(6px)" },
                    "60%": { transform: "translateY(3px)" },
                },

                // Login card
                "login-appear": {
                    from: { opacity: "0", transform: "translateY(16px) scale(0.97)" },
                    to: { opacity: "1", transform: "translateY(0) scale(1)" },
                },

                // Error shake
                "shake-in": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "20%": { transform: "translateX(-6px)" },
                    "40%": { transform: "translateX(5px)" },
                    "60%": { transform: "translateX(-3px)" },
                    "80%": { transform: "translateX(2px)" },
                },

                // Success / fade slide
                "fade-slide-in": {
                    from: { opacity: "0", transform: "translateY(-8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },

                // Spinner
                spin: {
                    to: { transform: "rotate(360deg)" },
                },

                // Toast notifications
                "slide-in": {
                    from: { transform: "translateX(110%)", opacity: "0" },
                    to: { transform: "translateX(0)", opacity: "1" },
                },
                "slide-out": {
                    from: { transform: "translateX(0)", opacity: "1" },
                    to: { transform: "translateX(110%)", opacity: "0" },
                },

                // Loading skeleton shimmer
                shimmer: {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                },

                // Status dot pulse
                "status-pulse": {
                    "0%, 100%": {
                        boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                    },
                    "50%": {
                        boxShadow: "0 0 0 5px rgba(34, 197, 94, 0.05)",
                    },
                },

                // Count badge pop
                "badge-pop": {
                    from: { transform: "scale(0)" },
                    to: { transform: "scale(1)" },
                },

                // Progress bar shine
                "progress-shine": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(100%)" },
                },

                // Overlay
                "overlay-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },

                // Dialog
                "dialog-in": {
                    from: { opacity: "0", transform: "scale(0.9) translateY(10px)" },
                    to: { opacity: "1", transform: "scale(1) translateY(0)" },
                },

                // Page enter
                "page-enter": {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },

                // Stagger children
                "stagger-in": {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },

                // Mobile nav
                "mobile-nav-in": {
                    from: { opacity: "0", transform: "translateY(-8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },

                // Empty state icon pulse
                "empty-pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
                    "50%": { transform: "scale(1.05)", opacity: "0.8" },
                },

                // Fade in generic
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(-3px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
            },

            animation: {
                "dropdown-fade": "dropdown-fade 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "hero-fade-in": "hero-fade-in 0.8s ease-out forwards",
                "arrow-bounce": "arrow-bounce 2s infinite",
                "login-appear": "login-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "shake-in": "shake-in 0.3s ease",
                "fade-slide-in": "fade-slide-in 0.3s ease",
                spin: "spin 0.8s linear infinite",
                "slide-in": "slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "slide-out": "slide-out 0.25s ease forwards",
                shimmer: "shimmer 1.5s ease infinite",
                "status-pulse": "status-pulse 2s ease-in-out infinite",
                "badge-pop": "badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "progress-shine": "progress-shine 1.5s ease-in-out infinite",
                "overlay-in": "overlay-in 0.2s ease",
                "dialog-in": "dialog-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "page-enter": "page-enter 0.4s ease-out",
                "stagger-in": "stagger-in 0.3s ease-out both",
                "mobile-nav-in": "mobile-nav-in 0.2s ease",
                "empty-pulse": "empty-pulse 3s ease-in-out infinite",
                "fade-in": "fade-in 0.1s ease-out",
            },

            /* ========================================
               Backdrop Blur
               ======================================== */
            backdropBlur: {
                header: "12px",
                overlay: "4px",
            },

            /* ========================================
               Z-index scale
               ======================================== */
            zIndex: {
                header: "100",
                filter: "90",
                dropdown: "50",
                overlay: "200",
                toast: "9999",
            },

            /* ========================================
               Background Image — Gradients & patterns
               ======================================== */
            backgroundImage: {
                // Button shine sweep
                "btn-shine":
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.15) 55%, transparent 60%)",
                // Skeleton shimmer
                "skeleton-shimmer":
                    "linear-gradient(90deg, rgba(30,58,138,0.04) 25%, rgba(30,58,138,0.08) 50%, rgba(30,58,138,0.04) 75%)",
                // Progress bar shine
                "progress-shine-gradient":
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            },

            backgroundSize: {
                "200%": "200% 100%",
            },
        },
    },

    /* ========================================
       Plugins
       ======================================== */
    plugins: [
        // Plugin for animation delay utilities
        function ({ addUtilities }: { addUtilities: Function }) {
            const staggerDelays: Record<string, Record<string, string>> = {};
            for (let i = 1; i <= 12; i++) {
                staggerDelays[`.stagger-delay-${i}`] = {
                    "animation-delay": `${i * 50}ms`,
                };
            }
            addUtilities(staggerDelays);
        },

        // Plugin for custom scrollbar
        function ({ addUtilities }: { addUtilities: Function }) {
            addUtilities({
                ".scrollbar-elite": {
                    "scrollbar-width": "thin",
                    "scrollbar-color": "rgba(30, 58, 138, 0.12) transparent",
                },
                ".scrollbar-elite::-webkit-scrollbar": {
                    width: "6px",
                    height: "6px",
                },
                ".scrollbar-elite::-webkit-scrollbar-track": {
                    background: "transparent",
                },
                ".scrollbar-elite::-webkit-scrollbar-thumb": {
                    background: "rgba(30, 58, 138, 0.12)",
                    "border-radius": "100px",
                },
                ".scrollbar-elite::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(30, 58, 138, 0.25)",
                },
            });
        },

        // Plugin for text selection
        function ({ addUtilities }: { addUtilities: Function }) {
            addUtilities({
                ".selection-elite::selection": {
                    background: "rgba(30, 58, 138, 0.12)",
                    color: "var(--color-cop-blue)",
                },
            });
        },
    ],
};

export default config;