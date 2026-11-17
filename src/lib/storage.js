/* ============================================================
   CAMADA DE ARMAZENAMENTO
   ------------------------------------------------------------
   Tudo fica no localStorage do navegador: nenhum dado sai do
   aparelho. Como o localStorage é síncrono, os dados já estão
   disponíveis no primeiro render (não precisa de "Carregando…").

   Os try/catch protegem contra:
   - JSON corrompido (alguém editou o storage na mão);
   - navegação privada / storage bloqueado (getItem/setItem lançam);
   - cota cheia (setItem lança QuotaExceededError).
   ============================================================ */

export const STORAGE_KEY = "gerenciador-cartoes";
const CHAVE_ULTIMO_BACKUP = "gerenciador-cartoes:ultimo-backup";

/* Versão do formato dos dados. Suba este número quando mudar o
   formato (ex.: renomear um campo) e escreva a conversão da versão
   antiga para a nova — assim backups antigos continuam importáveis.
   Dados sem `versao` (salvos antes deste campo existir) são versão 1.

   Histórico:
   1 → formato original.
   2 → campos opcionais novos: `categoria` (compras e contas),
       `diaVencimento` (contas e cartões) e `limite` (cartões).
       Dados da versão 1 continuam válidos sem conversão: os campos
       novos simplesmente não existem neles. */
export const VERSAO_DADOS = 2;

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ versao: VERSAO_DADOS, ...data }));
  } catch (e) {
    console.error("Falha ao salvar:", e);
  }
}

/* Data (ISO) do último backup exportado neste navegador, ou null.
   Fica numa chave separada porque não faz parte dos dados do usuário
   (não deve ir para dentro do backup). */
export function lerUltimoBackup() {
  try {
    return localStorage.getItem(CHAVE_ULTIMO_BACKUP);
  } catch {
    return null;
  }
}

/* Preferências de interface (ex.: modo discreto). Ficam fora dos dados
   do usuário: não vão para o backup e não passam pela validação. */
export function lerPreferencia(nome) {
  try {
    return localStorage.getItem(`gerenciador-cartoes:${nome}`);
  } catch {
    return null;
  }
}

export function salvarPreferencia(nome, valor) {
  try {
    localStorage.setItem(`gerenciador-cartoes:${nome}`, valor);
  } catch {
    /* sem storage: a preferência vale só até fechar a página */
  }
}

export function registrarUltimoBackup(iso) {
  try {
    localStorage.setItem(CHAVE_ULTIMO_BACKUP, iso);
  } catch {
    /* sem storage: só não lembramos a data */
  }
}
