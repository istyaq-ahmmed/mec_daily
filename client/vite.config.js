import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host:true,
		proxy: {
			"/api/v1": {
				target: "http://127.0.0.1:9001",
			},
		},
	},
})
