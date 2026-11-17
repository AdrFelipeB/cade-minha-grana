import { useRegisterSW } from "virtual:pwa-register/react";
import { IconX } from "@tabler/icons-react";

/* Registra o service worker e avisa:
   - "Pronto para usar sem internet" (uma vez, quando o app fica salvo no aparelho);
   - "Nova versão disponível · Atualizar" quando um deploy novo é baixado.

   `virtual:pwa-register/react` é um módulo gerado pelo vite-plugin-pwa
   (não existe arquivo de verdade: o plugin cria na hora do build). */
export default function AvisoAtualizacao() {
  const {
    offlineReady: [prontoOffline, setProntoOffline],
    needRefresh: [temAtualizacao, setTemAtualizacao],
    updateServiceWorker,
  } = useRegisterSW();

  const fechar = () => {
    setProntoOffline(false);
    setTemAtualizacao(false);
  };

  if (!prontoOffline && !temAtualizacao) return null;

  return (
    <div className="aviso-flutuante aviso-flutuante--topo" role="status" aria-live="polite">
      <div className="aviso-flutuante__caixa">
        <span>
          {temAtualizacao ? "Nova versão do app disponível." : "Pronto: o app agora funciona sem internet."}
        </span>
        {temAtualizacao && (
          // true = recarrega a página depois de ativar a versão nova
          <button type="button" className="aviso-flutuante__acao" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </button>
        )}
        <button type="button" className="btn-icone btn-icone--pequeno" onClick={fechar} aria-label="Fechar aviso">
          <IconX size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
