import { brl } from "../../lib/valores";
import LinhaItem from "../comum/LinhaItem";

/* "A pagar neste mês": tudo que ainda não foi marcado como pago
   (contas + parcelas de todos os cartões), do maior para o menor.
   Marcar o check aqui é o mesmo que marcar na tela da conta/cartão. */
export default function ListaPendentes({ cartoes, resumo, onTogglePago }) {
  const { gastosDoMes, parcelasDoMesPorCartao, isPago, totalGeral } = resumo;

  const pendentes = [
    ...gastosDoMes
      .filter((g) => !isPago(g.id))
      .map((g) => ({ id: g.id, titulo: g.descricao, detalhe: "Conta", valor: g.valorNoMes })),
    ...cartoes.flatMap((c) =>
      (parcelasDoMesPorCartao[c.id]?.itens || [])
        .filter((p) => !isPago(p.id))
        .map((p) => ({
          id: p.id,
          titulo: p.descricao,
          detalhe: p.parcelas > 1 ? `${c.nome} · parcela ${p.numeroParcela} de ${p.parcelas}` : c.nome,
          valor: p.valorParcela,
        }))
    ),
  ].sort((a, b) => b.valor - a.valor);

  if (pendentes.length === 0) {
    return (
      <div className="card rotulo">
        {totalGeral > 0 ? "Tudo pago neste mês." : "Nada para pagar neste mês."}
      </div>
    );
  }

  return (
    <div className="card card--lista">
      {pendentes.map((p) => (
        <LinhaItem
          key={p.id}
          pago={false}
          onTogglePago={() => onTogglePago(p.id)}
          titulo={p.titulo}
          detalhe={p.detalhe}
        >
          <span className="linha__valor">{brl(p.valor)}</span>
        </LinhaItem>
      ))}
    </div>
  );
}
