/* Cabeçalhos de segurança do site.

   A Content-Security-Policy diz ao navegador de onde o app pode carregar
   coisas e PARA ONDE PODE SE CONECTAR. Com `connect-src 'self'`, mesmo que
   algum código entrasse no app por uma dependência, o navegador bloquearia
   qualquer envio de dados para outro site — reforça a promessa de que
   nada sai do aparelho.

   Usado em dois lugares que precisam ficar iguais:
   - vite.config.js → `npm run preview` (testar localmente);
   - vercel.json   → o site publicado (JSON não importa JS, então os valores
     são repetidos lá; ao mudar aqui, mude lá também). */
export const CABECALHOS_SEGURANCA = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // React usa style="" para cores dinâmicas
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};
