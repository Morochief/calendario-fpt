import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Federation Elite Palette
                'bg-elite': 'var(--color-bg)',
                'surface': 'var(--color-surface)',
                'cop-blue': 'var(--color-cop-blue)',
                'fpt-red': 'var(--color-fpt-red)',
                'text-elite': 'var(--color-text)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-muted': 'var(--color-text-muted)',
                'border-elite': 'var(--color-border)',
                'border-hover': 'var(--color-border-hover)',
            },
        },
    },
    plugins: [],
};
export default config;
