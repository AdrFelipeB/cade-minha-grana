import { labelMes } from "../../lib/meses";
import { brl, valorParaInput } from "../../lib/valores";
import { botaoReset, inputStyle, S } from "../../theme";
import BarraComprometimento from "./BarraComprometimento";

const rotuloStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  opacity: 0.8,
};

/* Painel destaque da aba Geral: salário × gastos × sobra.
   `salarioInput` é null quando não está editando; senão, o texto do input. */
export default function PainelSalario({
  mesAtual,
  salario,
  salarioInput,
  onSalarioInputChange,
  onSalvarSalario,
  resumo,
}) {
  const { totalGeral, totalCartoes, totalContas, totalPago, totalRestante, sobra, pctComprometido } =
    resumo;
  const editando = salarioInput !== null;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: "22px 24px",
        marginBottom: 16,
        background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(219,39,119,0.85))",
        boxShadow: "0 12px 40px rgba(124,58,237,0.35)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {/* Salário */}
        <div>
          <div style={rotuloStyle}>Salário mensal</div>
          {editando ? (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                autoFocus
                value={salarioInput}
                onChange={(e) => onSalarioInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSalvarSalario()}
                placeholder="3500,00"
                inputMode="decimal"
                aria-label="Salário mensal"
                style={{
                  ...inputStyle,
                  ...S.mono,
                  marginTop: 0,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  maxWidth: 140,
                }}
              />
              <button
                onClick={onSalvarSalario}
                style={{ ...S.btn, background: "rgba(255,255,255,0.25)", color: "#FFF", padding: "6px 12px" }}
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSalarioInputChange(salario ? valorParaInput(salario) : "")}
              style={{ ...botaoReset, display: "block" }}
              title="Clique para editar"
              aria-label={`Salário mensal: ${brl(salario)}. Editar`}
            >
              <span style={{ ...S.mono, fontSize: 24, fontWeight: 800 }}>{brl(salario)}</span>
              <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 8 }}>✎ editar</span>
            </button>
          )}
        </div>

        {/* Gastos do mês */}
        <div>
          <div style={rotuloStyle}>Gastos de {labelMes(mesAtual).split(" ")[0]}</div>
          <div style={{ ...S.mono, fontSize: 24, fontWeight: 800, marginTop: 2 }}>
            {brl(totalGeral)}
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
            Cartões {brl(totalCartoes)} · Contas {brl(totalContas)}
          </div>
        </div>

        {/* Sobra */}
        <div>
          <div style={rotuloStyle}>{sobra >= 0 ? "Vai sobrar" : "Vai faltar"}</div>
          <div
            style={{
              ...S.mono,
              fontSize: 24,
              fontWeight: 800,
              marginTop: 2,
              color: sobra >= 0 ? "#A7F3D0" : "#FECDD3",
            }}
          >
            {brl(Math.abs(sobra))}
          </div>
        </div>
      </div>

      {/* Já pago × restante */}
      {totalGeral > 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
          <span>
            ✓ Já pago: <strong style={{ ...S.mono, color: "#A7F3D0" }}>{brl(totalPago)}</strong>
          </span>
          <span>
            Falta pagar:{" "}
            <strong style={{ ...S.mono, color: totalRestante > 0 ? "#FDE68A" : "#A7F3D0" }}>
              {brl(totalRestante)}
            </strong>
          </span>
        </div>
      )}

      {salario > 0 && <BarraComprometimento pct={pctComprometido} />}
    </div>
  );
}
