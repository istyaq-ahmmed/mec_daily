import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api/v1": {
				target: "http://192.168.0.104:9001",
			},
		},
	},
})
