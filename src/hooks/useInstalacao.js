import { useSyncExternalStore } from "react";

/* Instalação do app (PWA) na tela inicial.

   No Android/Chrome/Edge o navegador dispara o evento
   "beforeinstallprompt" quando o app pode ser instalado. Guardamos esse
   evento para chamar .prompt() quando a pessoa tocar em "Instalar".
   O evento pode chegar antes do React montar a tela, por isso o
   listener fica aqui no nível do módulo (roda assim que o arquivo é
   importado) e os componentes leem o valor com useSyncExternalStore.

   No iPhone não existe esse evento: a instalação é manual pelo Safari
   (Compartilhar → Adicionar à Tela de Início), então só mostramos instruções. */

const rodandoInstalado = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

let estado = { eventoInstalacao: null, instalado: rodandoInstalado() };
const ouvintes = new Set();
const atualizar = (novo) => {
  estado = { ...estado, ...novo };
  ouvintes.forEach((avisar) => avisar());
};

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // não mostrar o banner automático; o app oferece o botão na hora certa
  atualizar({ eventoInstalacao: e });
});
window.addEventListener("appinstalled", () => atualizar({ eventoInstalacao: null, instalado: true }));

const inscrever = (avisar) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

export const ehIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad se passa por Mac

export function useInstalacao() {
  const { eventoInstalacao, instalado } = useSyncExternalStore(inscrever, () => estado);

  const instalar = async () => {
    if (!eventoInstalacao) return;
    eventoInstalacao.prompt();
    await eventoInstalacao.userChoice; // aceitou ou recusou: o evento só pode ser usado uma vez
    atualizar({ eventoInstalacao: null });
  };

  return { podeInstalar: !!eventoInstalacao, instalado, instalar, ehIOS: ehIOS() };
}

/* Pede ao navegador para não apagar os dados deste site quando faltar
   espaço no aparelho. No Chrome é concedido sem perguntar para apps
   instalados; chamamos só quando instalado, para não gerar pergunta
   inesperada em outros navegadores. */
export async function pedirArmazenamentoPersistente() {
  if (!rodandoInstalado() || !navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}
