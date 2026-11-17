import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";

/* Lista de cartões com a fatura do mês de cada um. */
export default function TelaCartoes({ cartoes, resumo, onAbrirCartao, onNovoCartao }) {
  const { parcelasDoMesPorCartao, totalCartoes } = resumo;

  return (
    <>
      <div className="topo-tela">
        <h1>Cartões</h1>
        {cartoes.length > 0 && (
          <span className="linha__valor" style={{ fontSize: 18 }}>
            {brl(totalCartoes)}
          </span>
        )}
      </div>

      {cartoes.length === 0 ? (
        <div className="card">
          <EstadoVazio
            titulo="Cadastre seu primeiro cartão"
            texto="Depois é só lançar as compras: as parcelas aparecem sozinhas nos meses certos."
            acao="Adicionar cartão"
            onAcao={onNovoCartao}
          />
        </div>
      ) : (
        <>
          <div className="card card--lista">
            {cartoes.map((c) => {
              const dados = parcelasDoMesPorCartao[c.id] || { itens: [], subtotal: 0 };
              return (
                <button
                  key={c.id}
                  type="button"
                  className="linha linha--botao"
                  onClick={() => onAbrirCartao(c.id)}
                >
                  <span className="ponto ponto--grande" style={{ background: corCartao(c) }} aria-hidden="true" />
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
          <button type="button" className="btn btn--bloco" onClick={onNovoCartao}>
            <IconPlus size={18} aria-hidden="true" />
            Adicionar cartão
          </button>
        </>
      )}
    </>
  );
}
