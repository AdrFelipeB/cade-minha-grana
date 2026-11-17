import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { CABECALHOS_SEGURANCA } from "./seguranca.config.js";

export default defineConfig({
  // `npm run preview` responde com os mesmos cabeçalhos do site publicado
  preview: { headers: CABECALHOS_SEGURANCA },

  plugins: [
    react(),

    /* PWA: transforma o site num app instalável que funciona offline.
       - manifest: nome, ícones e cores usados ao instalar na tela inicial;
       - service worker (gerado pelo Workbox): guarda os arquivos do app
         no aparelho, então ele abre mesmo sem internet.
       Os DADOS não passam por aqui: continuam só no localStorage. */
    VitePWA({
      // "prompt": quando sai uma versão nova, o app mostra "Atualizar" em vez
      // de recarregar sozinho (não interrompe quem está no meio de um lançamento)
      registerType: "prompt",
      includeAssets: ["favicon.svg", "favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Cadê Minha Grana?",
        short_name: "Cadê Grana?", // nome curto embaixo do ícone (até ~12 letras)
        description: "Cartões, contas e parcelas sob controle, sem vincular banco.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone", // abre em tela cheia, sem a barra do navegador
        orientation: "portrait",
        background_color: "#f5f6f8",
        theme_color: "#f5f6f8",
        categories: ["finance", "productivity"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
