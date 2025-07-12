import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(),tailwindcss()],
	server: {
		proxy: {
			"/api/v1": {
				target: "http://127.0.0.1:9001",
			},
		},
	},
})
