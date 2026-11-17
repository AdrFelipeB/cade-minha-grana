import { brl } from "../../lib/valores";
import { S, T } from "../../theme";
import BotaoRemover from "../comum/BotaoRemover";
import LinhaItem from "../comum/LinhaItem";

/* Um lançamento do cartão no mês: "Parcela 3/10 · total R$ X" ou "À vista". */
export default function ItemParcela({ parcela: p, pago, onTogglePago, onRemover }) {
  const detalhe = (
    <div style={{ fontSize: 12, color: T.textoSuave }}>
      {p.parcelas > 1 ? (
        <>
          Parcela{" "}
          <span style={{ color: "#C4B5FD", fontWeight: 700 }}>
            {p.numeroParcela}/{p.parcelas}
          </span>{" "}
          · total {brl(p.valorTotal)}
        </>
      ) : (
        "À vista"
      )}
    </div>
  );

  return (
    <LinhaItem pago={pago} onTogglePago={onTogglePago} titulo={p.descricao} detalhe={detalhe}>
      <span style={{ ...S.mono, fontWeight: 800 }}>{brl(p.valorParcela)}</span>
      <BotaoRemover onClick={onRemover} title="Remover compra" descricao={p.descricao} />
    </LinhaItem>
  );
}
