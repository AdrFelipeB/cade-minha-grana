import { useState } from "react";
import { brl } from "../../lib/valores";
import CheckPago from "../comum/CheckPago";

/* "A pagar neste mês": tudo que ainda não foi marcado como pago
   (contas + parcelas de todos os cartões), do maior para o menor.

   Marcar aqui faz o item sumir desta lista, então pedimos confirmação
   antes: a linha vira "Marcar X como paga?" com Confirmar/Cancelar e
   explica onde o item vai continuar aparecendo (como pago). */
export default function ListaPendentes({ cartoes, resumo, onTogglePago }) {
  const { gastosDoMes, parcelasDoMesPorCartao, isPago, totalGeral } = resumo;
  const [confirmando, setConfirmando] = useState(null); // id do item em confirmação
  const [aviso, setAviso] = useState("");

  const pendentes = [
    ...gastosDoMes
      .filter((g) => !isPago(g.id))
      .map((g) => ({
        id: g.id,
        titulo: g.descricao,
        detalhe: "Conta",
        onde: "na tela Contas",
        valor: g.valorNoMes,
      })),
    ...cartoes.flatMap((c) =>
      (parcelasDoMesPorCartao[c.id]?.itens || [])
        .filter((p) => !isPago(p.id))
        .map((p) => ({
          id: p.id,
          titulo: p.descricao,
          detalhe: p.parcelas > 1 ? `${c.nome} · parcela ${p.numeroParcela} de ${p.parcelas}` : c.nome,
          onde: `no cartão ${c.nome}, em Cartões`,
          valor: p.valorParcela,
        }))
    ),
  ].sort((a, b) => b.valor - a.valor);

  const confirmar = (item) => {
    onTogglePago(item.id);
    setConfirmando(null);
    setAviso(`Pagamento de “${item.titulo}” registrado. Para desfazer, desmarque ${item.onde}.`);
  };

  return (
    <>
      {/* Feedback depois de confirmar (também lido por leitores de tela) */}
      <p role="status" className="aviso-status positivo" style={{ margin: aviso ? "0 2px 10px" : 0 }}>
        {aviso}
      </p>

      {pendentes.length === 0 ? (
        <div className="card rotulo">
          {totalGeral > 0 ? "Tudo pago neste mês." : "Nada para pagar neste mês."}
        </div>
      ) : (
        <div className="card card--lista">
          {pendentes.map((p) =>
            confirmando === p.id ? (
              <div
                key={p.id}
                className="linha linha--confirmar"
                onKeyDown={(e) => e.key === "Escape" && setConfirmando(null)}
              >
                <div className="linha__principal">
                  <div className="linha__titulo">Confirmar pagamento de “{p.titulo}”?</div>
                  <div className="linha__detalhe">
                    Sai desta lista e o pagamento fica registrado {p.onde}.
                  </div>
                </div>
                <button type="button" className="btn btn--pequeno" onClick={() => setConfirmando(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn--pequeno btn--primario"
                  onClick={() => confirmar(p)}
                  autoFocus
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <div key={p.id} className="linha">
                <CheckPago
                  pago={false}
                  onClick={() => {
                    setAviso("");
                    setConfirmando(p.id);
                  }}
                  descricao={p.titulo}
                />
                <div className="linha__principal">
                  <div className="linha__titulo">{p.titulo}</div>
                  <div className="linha__detalhe">{p.detalhe}</div>
                </div>
                <span className="linha__valor">{brl(p.valor)}</span>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}
