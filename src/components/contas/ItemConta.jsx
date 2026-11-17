import { IconCheck } from "@tabler/icons-react";
import { labelMes } from "../../lib/meses";
import { brl, valorParaInput } from "../../lib/valores";
import BotaoRemover from "../comum/BotaoRemover";
import LinhaItem from "../comum/LinhaItem";

/* Uma conta na lista do mês.
   Conta fixa: tocar no valor (sublinhado tracejado) ajusta só este mês (override).
   `overrideInput` é null quando esta conta não está em edição. */
export default function ItemConta({
  gasto: g,
  mesAtual,
  pago,
  overrideInput,
  onOverrideInputChange,
  onCancelarEdicao,
  onSalvarOverride,
  onRemoverOverride,
  onTogglePago,
  onRemover,
}) {
  const fixo = g.tipo === "fixo";
  const temOverride = fixo && g.overrides && g.overrides[mesAtual] != null;
  const editando = overrideInput !== null;

  const detalhe = fixo ? (
    <>
      Fixa · desde {labelMes(g.mesInicio)}
      {temOverride && <span className="alerta"> · padrão {brl(g.valor)}</span>}
    </>
  ) : (
    <>Só em {labelMes(g.mes)}</>
  );

  if (editando) {
    return (
      <div className="linha" style={{ flexWrap: "wrap" }}>
        <div className="linha__principal">
          <div className="linha__titulo">{g.descricao}</div>
          <div className="linha__detalhe">Valor só em {labelMes(mesAtual)}</div>
        </div>
        <form
          className="edicao-valor"
          onSubmit={(e) => {
            e.preventDefault();
            onSalvarOverride();
          }}
        >
          <input
            autoFocus
            className="input num"
            value={overrideInput}
            onChange={(e) => onOverrideInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onCancelarEdicao()}
            inputMode="decimal"
            aria-label={`Valor de ${g.descricao} em ${labelMes(mesAtual)}`}
            placeholder={valorParaInput(g.valor)}
          />
          <button type="submit" className="btn-icone" aria-label="Salvar valor" title="Salvar">
            <IconCheck size={20} aria-hidden="true" />
          </button>
          {temOverride && (
            <button
              type="button"
              className="btn btn--pequeno"
              onClick={onRemoverOverride}
              title={`Voltar ao valor padrão (${brl(g.valor)})`}
            >
              Padrão
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <LinhaItem pago={pago} onTogglePago={onTogglePago} titulo={g.descricao} detalhe={detalhe}>
      {fixo ? (
        // Conta fixa: o valor é um botão (editável pelo teclado também)
        <button
          type="button"
          className={`valor-editavel${temOverride ? " valor-editavel--alterado" : ""}`}
          onClick={() => onOverrideInputChange(valorParaInput(g.valorNoMes))}
          title="Ajustar o valor só deste mês"
          aria-label={`${brl(g.valorNoMes)}. Ajustar valor de ${g.descricao} neste mês`}
        >
          {brl(g.valorNoMes)}
        </button>
      ) : (
        <span className="linha__valor">{brl(g.valorNoMes)}</span>
      )}
      <BotaoRemover onClick={onRemover} title="Remover conta" descricao={g.descricao} />
    </LinhaItem>
  );
}
