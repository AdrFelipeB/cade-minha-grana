import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

const DURACAO_MS = 8000;

/* Aviso flutuante "Compra removida · Desfazer".
   Substitui as janelas de confirmação do navegador: a ação acontece na
   hora e você tem alguns segundos para voltar atrás. Some sozinho. */
export default function AvisoDesfazer({ aviso, onDesfazer, onFechar }) {
  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(onFechar, DURACAO_MS);
    return () => clearTimeout(timer); // novo aviso (ou desmontar) reinicia o tempo
  }, [aviso, onFechar]);

  return (
    <div className="aviso-flutuante" role="status" aria-live="polite">
      {aviso && (
        <div className="aviso-flutuante__caixa">
          <span>{aviso.mensagem}</span>
          <button type="button" className="aviso-flutuante__acao" onClick={onDesfazer}>
            Desfazer
          </button>
          <button type="button" className="btn-icone btn-icone--pequeno" onClick={onFechar} aria-label="Fechar aviso">
            <IconX size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
