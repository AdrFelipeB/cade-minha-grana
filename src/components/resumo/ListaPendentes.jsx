import { useState } from "react";
import { brl } from "../../lib/valores";
import { situacaoVencimento } from "../../lib/vencimentos";
import BotaoPagarTudo from "../comum/BotaoPagarTudo";
import CheckPago from "../comum/CheckPago";
import IconeCategoria from "../comum/IconeCategoria";
import SeloVencimento from "../comum/SeloVencimento";

/* "A pagar neste mês": tudo que ainda não foi marcado como pago
   (contas + parcelas de todos os cartões).

   Ordem: primeiro o que tem vencimento (atrasados no topo, depois o que
   vence antes), depois o resto, do maior valor para o menor.

   Marcar aqui faz o item sumir desta lista, então pedimos confirmação
   antes: a linha vira "Confirmar pagamento de X?" e explica onde o item
   vai continuar aparecendo (como pago). */
export default function ListaPendentes({ cartoes, mesAtual, resumo, titulo, onTogglePago, onPagarTudo }) {
  const { gastosDoMes, parcelasDoMesPorCartao, isPago, totalGeral } = resumo;
  const [confirmando, setConfirmando] = useState(null); // id do item em confirmação
  const [aviso, setAviso] = useState("");

  const pendentes = [
    ...gastosDoMes
      .filter((g) => !isPago(g.id))
      .map((g) => ({
        id: g.id,
        titulo: g.descricao,
        categoria: g.categoria,
        detalhe: "Conta",
        onde: "na tela Contas",
        valor: g.valorNoMes,
        situacao: situacaoVencimento(mesAtual, g.diaVencimento, false),
      })),
    ...cartoes.flatMap((c) =>
      (parcelasDoMesPorCartao[c.id]?.itens || [])
        .filter((p) => !isPago(p.id))
        .map((p) => ({
          id: p.id,
          titulo: p.descricao,
          categoria: p.categoria,
          detalhe: p.parcelas > 1 ? `${c.nome} · parcela ${p.numeroParcela} de ${p.parcelas}` : c.nome,
          onde: `no cartão ${c.nome}, em Cartões`,
          valor: p.valorParcela,
          situacao: situacaoVencimento(mesAtual, c.diaVencimento, false),
        }))
    ),
  ].sort((a, b) => {
    const da = a.situacao?.dias ?? Infinity;
    const db = b.situacao?.dias ?? Infinity;
    return da !== db ? da - db : b.valor - a.valor;
  });

  const totalPendente = pendentes.reduce((s, p) => s + p.valor, 0);

  const confirmar = (item) => {
    onTogglePago(item.id);
    setConfirmando(null);
    setAviso(`Pagamento de “${item.titulo}” registrado. Para desfazer, desmarque ${item.onde}.`);
  };

  return (
    <>
      <div className="topo-lista">
        <h2 className="secao-titulo" style={{ margin: 0 }}>
          {titulo}
        </h2>
        <BotaoPagarTudo
          rotulo="Pagar tudo"
          quantidade={pendentes.length}
          total={totalPendente}
          onConfirmar={() => {
            setAviso("");
            onPagarTudo(pendentes.map((p) => p.id));
          }}
        />
      </div>

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
                  <div className="linha__detalhe">
                    <IconeCategoria categoria={p.categoria} /> {p.detalhe}{" "}
                    <SeloVencimento situacao={p.situacao} />
                  </div>
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
