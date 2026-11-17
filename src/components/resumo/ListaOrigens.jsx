import { IconChevronRight, IconReceipt } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { brl } from "../../lib/valores";

/* "De onde vêm os gastos": contas + cada cartão, com o total do mês.
   Usada no Resumo do celular e do desktop. */
export default function ListaOrigens({ cartoes, resumo, onAbrirContas, onAbrirCartao }) {
  const { gastosDoMes, totalContas, parcelasDoMesPorCartao, isPago } = resumo;
  const qtdPagas = gastosDoMes.filter((g) => isPago(g.id)).length;

  return (
    <div className="card card--lista">
      <button type="button" className="linha linha--botao" onClick={onAbrirContas}>
        <IconReceipt size={20} className="icone-linha" aria-hidden="true" />
        <span className="linha__principal">
          <span className="linha__titulo" style={{ display: "block" }}>
            Contas
          </span>
          <span className="linha__detalhe">
            {gastosDoMes.length === 0
              ? "Nenhuma neste mês"
              : `${qtdPagas} de ${gastosDoMes.length} pagas`}
          </span>
        </span>
        <span className="linha__valor">{brl(totalContas)}</span>
        <IconChevronRight size={18} className="texto-3" aria-hidden="true" />
      </button>

      {cartoes.map((c) => {
        const dados = parcelasDoMesPorCartao[c.id] || { itens: [], subtotal: 0 };
        return (
          <button
            key={c.id}
            type="button"
            className="linha linha--botao"
            onClick={() => onAbrirCartao(c.id)}
          >
            <span className="ponto" style={{ background: corCartao(c) }} aria-hidden="true" />
            <span className="linha__principal">
              <span className="linha__titulo" style={{ display: "block" }}>
                {c.nome}
                {c.final && <span className="texto-3 num"> •• {c.final}</span>}
              </span>
              <span className="linha__detalhe">
                {dados.itens.length === 0
                  ? "Sem lançamentos neste mês"
                  : `${dados.itens.length} lançamento(s)`}
              </span>
            </span>
            <span className="linha__valor">{brl(dados.subtotal)}</span>
            <IconChevronRight size={18} className="texto-3" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
