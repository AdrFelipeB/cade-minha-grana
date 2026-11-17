import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import { botaoReset, S, T } from "../../theme";

/* Cards dos últimos 3 meses + atual; clicar leva ao mês.
   aria-current marca para o leitor de tela qual mês está aberto. */
export default function Historico({ historico, mesAtual, onSelecionarMes }) {
  return (
    <>
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>
        Histórico (últimos 3 meses + atual)
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {historico.map((h) => {
          const selecionado = h.mes === mesAtual;
          return (
            <button
              key={h.mes}
              onClick={() => onSelecionarMes(h.mes)}
              aria-current={selecionado ? "date" : undefined}
              style={{
                ...botaoReset,
                ...S.painel,
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: selecionado ? "1px solid #7C3AED" : `1px solid ${T.border}`,
                boxShadow: selecionado ? "0 0 0 3px rgba(124,58,237,0.25)" : "none",
              }}
            >
              <span style={{ display: "block", fontSize: 12, color: T.textoSuave }}>
                {labelMes(h.mes)}
              </span>
              <span style={{ display: "block", ...S.mono, fontWeight: 800, fontSize: 16 }}>
                {brl(h.total)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
