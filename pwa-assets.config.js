import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/* Gera os PNGs do app instalado a partir de public/icone-app.svg:
   pwa-64x64, pwa-192x192, pwa-512x512, maskable-icon-512x512 (Android)
   e apple-touch-icon-180x180 (iPhone). Rodar: npm run icones */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    // fundo índigo (em vez de branco) na margem que o iPhone e o Android acrescentam
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: "#4F46E5" } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: "#4F46E5" } },
  },
  images: ["public/icone-app.svg"],
});
