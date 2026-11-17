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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Falha ao salvar:", e);
  }
}
