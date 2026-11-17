import { addMeses, diffMeses, hojeMes, labelMes } from "../lib/meses";
import { S, T } from "../theme";

/* Setas ◀ ▶ para trocar o mês. Passado limitado a `mesMinimo`, futuro livre. */
export default function NavegacaoMes({ mesAtual, mesMinimo, onChange }) {
  const noLimite = diffMeses(mesAtual, mesMinimo) <= 0;
  const estiloSeta = {
    ...S.btn,
    background: "#2C2650",
    color: T.texto,
    fontSize: 16,
    padding: "6px 14px",
  };

  return (
    <div
      style={{
        ...S.painel,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        marginBottom: 16,
      }}
    >
      <button
        style={{ ...estiloSeta, opacity: noLimite ? 0.3 : 1 }}
        onClick={() => onChange(addMeses(mesAtual, -1))}
        disabled={noLimite}
        aria-label="Mês anterior"
      >
        ◀
      </button>
      <div style={{ textAlign: "center" }}>
        {/* aria-live: o leitor de tela anuncia o novo mês ao trocar */}
        <div style={{ fontWeight: 800, fontSize: 17 }} aria-live="polite">
          {labelMes(mesAtual)}
        </div>
        {mesAtual !== hojeMes() && (
          <button
            style={{
              ...S.btn,
              background: "transparent",
              color: "#C4B5FD",
              fontSize: 12,
              padding: 0,
              textDecoration: "underline",
            }}
            onClick={() => onChange(hojeMes())}
          >
            voltar ao mês atual
          </button>
        )}
      </div>
      <button
        style={estiloSeta}
        onClick={() => onChange(addMeses(mesAtual, 1))}
        aria-label="Próximo mês"
      >
        ▶
      </button>
    </div>
  );
}
