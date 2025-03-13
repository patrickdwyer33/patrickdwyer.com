import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: false,

			pwaAssets: {
				disabled: false,
				config: true,
			},

			manifest: {
				name: "patrickdwyer.com",
				short_name: "patrickdwyer.com",
				description: "Personal resume website for Patrick Dwyer",
				theme_color: "#D3D3FF",
			},

			// specifies anything to include in cache that isn't linked in index.html somehow
			// we want to include all assets in public folder
			includeAssets: ["**/*"],

			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,pdf,woff2}"],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				runtimeCaching: [
					{
						urlPattern: ({ url }) =>
							url.origin === "https://patrickdwyer.com",
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "media",
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
							},
							cacheableResponse: {
								statuses: [200],
							},
							rangeRequests: true,
						},
					},
				],
			},

			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: false,
				type: "module",
			},
		}),
	],
});
