import { IconCheck } from "@tabler/icons-react";
import { labelMes } from "../../lib/meses";
import { brl, valorParaInput } from "../../lib/valores";
import { situacaoVencimento } from "../../lib/vencimentos";
import BotaoEditar from "../comum/BotaoEditar";
import IconeCategoria from "../comum/IconeCategoria";
import LinhaItem from "../comum/LinhaItem";
import SeloVencimento from "../comum/SeloVencimento";

/* Uma conta na lista do mês.
   Conta fixa: tocar no valor (sublinhado tracejado) ajusta só este mês (override).
   O lápis edita a conta em si (nome, valor padrão, vencimento…) e permite excluir.
   `overrideInput` é null quando o valor deste mês não está em edição. */
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
  onEditar,
}) {
  const fixo = g.tipo === "fixo";
  const temOverride = fixo && g.overrides && g.overrides[mesAtual] != null;
  const editandoValor = overrideInput !== null;
  const situacao = situacaoVencimento(mesAtual, g.diaVencimento, pago);

  const detalhe = (
    <>
      <IconeCategoria categoria={g.categoria} />
      {fixo ? <> Fixa</> : <> Só em {labelMes(g.mes)}</>}
      {temOverride && <span className="alerta"> · padrão {brl(g.valor)}</span>}
      {situacao && (
        <>
          {" "}
          <SeloVencimento situacao={situacao} />
        </>
      )}
    </>
  );

  if (editandoValor) {
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
      <BotaoEditar onClick={onEditar} descricao={g.descricao} />
    </LinhaItem>
  );
}
