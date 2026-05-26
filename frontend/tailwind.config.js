import daisyui from "daisyui"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        edtech: {
          primary: '#2563eb',
          'primary-content': '#ffffff',
          secondary: '#64748b',
          accent: '#3b82f6',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
}

