import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { addMeses, diffMeses, hojeMes, labelMes } from "../../lib/meses";

/* ‹ Novembro 2026 › — passado limitado a `mesMinimo`, futuro livre.
   Fica grudado no topo ao rolar a página (position: sticky no CSS). */
export default function SeletorMes({ mesAtual, mesMinimo, onChange }) {
  const noLimite = diffMeses(mesAtual, mesMinimo) <= 0;

  return (
    <div className="seletor-mes">
      <button
        type="button"
        className="btn-icone"
        onClick={() => onChange(addMeses(mesAtual, -1))}
        disabled={noLimite}
        aria-label="Mês anterior"
        title={noLimite ? "O histórico guarda só os últimos 3 meses" : undefined}
      >
        <IconChevronLeft size={22} aria-hidden="true" />
      </button>

      <div className="seletor-mes__centro">
        {/* aria-live: o leitor de tela anuncia o novo mês ao trocar */}
        <div className="seletor-mes__titulo" aria-live="polite">
          {labelMes(mesAtual)}
        </div>
        {mesAtual !== hojeMes() && (
          <button type="button" className="btn btn--link" onClick={() => onChange(hojeMes())}>
            Voltar para hoje
          </button>
        )}
      </div>

      <button
        type="button"
        className="btn-icone"
        onClick={() => onChange(addMeses(mesAtual, 1))}
        aria-label="Próximo mês"
      >
        <IconChevronRight size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
