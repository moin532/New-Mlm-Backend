import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Removed path import and alias configuration as they are no longer needed

export default defineConfig({
  plugins: [react()],
  // Removed resolve.alias section
})

