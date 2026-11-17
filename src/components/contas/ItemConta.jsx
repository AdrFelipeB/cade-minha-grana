import { labelMes } from "../../lib/meses";
import { brl, valorParaInput } from "../../lib/valores";
import { botaoReset, GRAD_CONTAS, inputStyle, S, T } from "../../theme";
import BotaoRemover from "../comum/BotaoRemover";
import LinhaItem from "../comum/LinhaItem";

/* Uma conta na lista do mês.
   Conta fixa: clicar no valor (sublinhado tracejado) ajusta só este mês (override).
   `overrideInput` é null quando esta conta não está em edição. */
export default function ItemConta({
  gasto: g,
  mesAtual,
  pago,
  overrideInput,
  onOverrideInputChange,
  onSalvarOverride,
  onRemoverOverride,
  onTogglePago,
  onRemover,
}) {
  const fixo = g.tipo === "fixo";
  const temOverride = fixo && g.overrides && g.overrides[mesAtual] != null;
  const editando = overrideInput !== null;

  const detalhe = (
    <div style={{ fontSize: 12 }}>
      {fixo ? (
        <span style={{ color: "#5EEAD4" }}>
          🔁 Fixo · desde {labelMes(g.mesInicio)}
          {temOverride && <span style={{ color: "#FDE68A" }}> · padrão {brl(g.valor)}</span>}
        </span>
      ) : (
        <span style={{ color: "#FDE68A" }}>📌 Momentâneo · {labelMes(g.mes)}</span>
      )}
    </div>
  );

  return (
    <LinhaItem
      pago={pago}
      onTogglePago={onTogglePago}
      titulo={g.descricao}
      detalhe={detalhe}
      gapDireita={10}
    >
      {editando ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            autoFocus
            value={overrideInput}
            onChange={(e) => onOverrideInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSalvarOverride()}
            inputMode="decimal"
            aria-label={`Valor de ${g.descricao} em ${labelMes(mesAtual)}`}
            placeholder={valorParaInput(g.valor)}
            style={{ ...inputStyle, ...S.mono, marginTop: 0, width: 100 }}
          />
          <button
            onClick={onSalvarOverride}
            style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", padding: "6px 10px", fontSize: 12 }}
          >
            OK
          </button>
          {temOverride && (
            <button
              onClick={onRemoverOverride}
              title="Voltar ao valor padrão"
              style={{ ...S.btn, background: "#2C2650", color: T.texto, padding: "6px 10px", fontSize: 12 }}
            >
              padrão
            </button>
          )}
        </div>
      ) : fixo ? (
        // Conta fixa: o valor é um botão (editável pelo teclado também)
        <button
          onClick={() => onOverrideInputChange(valorParaInput(g.valorNoMes))}
          title="Clique para ajustar o valor deste mês"
          aria-label={`${brl(g.valorNoMes)}. Ajustar valor de ${g.descricao} neste mês`}
          style={{
            ...botaoReset,
            ...S.mono,
            fontWeight: 800,
            borderBottom: `1px dashed ${T.textoSuave}`,
            color: temOverride ? "#FDE68A" : T.texto,
          }}
        >
          {brl(g.valorNoMes)}
        </button>
      ) : (
        <span style={{ ...S.mono, fontWeight: 800, color: T.texto }}>{brl(g.valorNoMes)}</span>
      )}
      <BotaoRemover onClick={onRemover} title="Remover conta" descricao={g.descricao} />
    </LinhaItem>
  );
}
