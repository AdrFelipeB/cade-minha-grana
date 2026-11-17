import { useState } from "react";
import { IconChecks } from "@tabler/icons-react";
import { brl } from "../../lib/valores";

/* "Pagar tudo" com confirmação no próprio lugar (mesmo padrão da lista
   "A pagar"): o primeiro clique só pergunta; Confirmar marca todos.
   Depois ainda dá para desfazer pelo aviso flutuante. */
export default function BotaoPagarTudo({ rotulo, quantidade, total, onConfirmar }) {
  const [confirmando, setConfirmando] = useState(false);
  if (quantidade === 0) return null;

  if (!confirmando) {
    return (
      <button type="button" className="btn btn--pequeno" onClick={() => setConfirmando(true)}>
        <IconChecks size={16} aria-hidden="true" />
        {rotulo}
      </button>
    );
  }

  return (
    <div
      className="confirmar-tudo"
      role="group"
      aria-label="Confirmar pagamento"
      onKeyDown={(e) => e.key === "Escape" && setConfirmando(false)}
    >
      <span>
        Marcar {quantidade} {quantidade === 1 ? "item" : "itens"} (<span className="num">{brl(total)}</span>)
        como pagos?
      </span>
      <span className="confirmar-tudo__botoes">
        <button type="button" className="btn btn--pequeno" onClick={() => setConfirmando(false)}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--pequeno btn--primario"
          autoFocus
          onClick={() => {
            setConfirmando(false);
            onConfirmar();
          }}
        >
          Confirmar
        </button>
      </span>
    </div>
  );
}
