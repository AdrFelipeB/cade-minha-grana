import { brl } from "../../lib/valores";
import BotaoEditar from "../comum/BotaoEditar";
import IconeCategoria from "../comum/IconeCategoria";
import LinhaItem from "../comum/LinhaItem";

/* Um lançamento do cartão no mês: "Parcela 3 de 10 · total R$ X" ou "À vista". */
export default function ItemParcela({ parcela: p, pago, onTogglePago, onEditar }) {
  const detalhe = (
    <>
      <IconeCategoria categoria={p.categoria} />{" "}
      {p.parcelas > 1 ? (
        <>
          Parcela <span className="num">{p.numeroParcela} de {p.parcelas}</span> · total{" "}
          <span className="num">{brl(p.valorTotal)}</span>
        </>
      ) : (
        "À vista"
      )}
    </>
  );

  return (
    <LinhaItem pago={pago} onTogglePago={onTogglePago} titulo={p.descricao} detalhe={detalhe}>
      <span className="linha__valor">{brl(p.valorParcela)}</span>
      <BotaoEditar onClick={onEditar} descricao={p.descricao} />
    </LinhaItem>
  );
}
