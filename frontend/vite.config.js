// Vite build configuration for React and Tailwind CSS.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // The React plugin enables JSX and the fast-refresh development transform.
  plugins: [react(), tailwindcss()],

  server: {
    // The default frontend port matches FRONTEND_ORIGIN in the backend example.
    port: 5173,
  },
});
