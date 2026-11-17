/* Nome e frase do app, num lugar só.

   Atenção: isto é só o nome EXIBIDO. Os identificadores internos
   continuam "meus-gastos" / "gerenciador-cartoes" (APP_ID em
   lib/backup.js e STORAGE_KEY em lib/storage.js) — mudá-los faria os
   dados salvos e os backups antigos deixarem de ser reconhecidos. */
export const NOME_APP = "Cadê Minha Grana?";
export const SLOGAN = "Cartões, contas e parcelas sob controle, sem vincular banco.";

// Versão do nome segura para nome de arquivo (backup)
export const NOME_ARQUIVO = "cade-minha-grana";
