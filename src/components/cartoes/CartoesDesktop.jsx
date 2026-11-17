import { IconPlus } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import DetalheCartao from "./DetalheCartao";

/* Cartões no desktop ("mestre-detalhe"): lista à esquerda, fatura do
   cartão selecionado à direita — troca de cartão com um clique, sem
   entrar e voltar como no celular. */
export default function CartoesDesktop({
  cartoes,
  cartaoSelecionado,
  mesAtual,
  resumo,
  limiteUsado,
  onSelecionar,
  onNovoCartao,
  onNovaCompra,
  onEditarCartao,
  onTogglePago,
  onPagarFatura,
  onEditarCompra,
}) {
  const { parcelasDoMesPorCartao } = resumo;

  if (cartoes.length === 0) {
    return (
      <div className="card">
        <EstadoVazio
          titulo="Cadastre seu primeiro cartão"
          texto="Depois é só lançar as compras: as parcelas aparecem sozinhas nos meses certos."
          acao="Adicionar cartão"
          onAcao={onNovoCartao}
        />
      </div>
    );
  }

  return (
    <div className="grade-cartoes">
      <div>
        <h2 className="secao-titulo">Seus cartões</h2>
        <div className="card card--lista">
          {cartoes.map((c) => {
            const dados = parcelasDoMesPorCartao[c.id] || { itens: [], subtotal: 0 };
            const selecionado = c.id === cartaoSelecionado?.id;
            return (
              <button
                key={c.id}
                type="button"
                className="linha linha--botao"
                aria-current={selecionado ? "true" : undefined}
                onClick={() => onSelecionar(c.id)}
              >
                <span className="ponto ponto--grande" style={{ background: corCartao(c) }} aria-hidden="true" />
                <span className="linha__principal">
                  <span className="linha__titulo" style={{ display: "block" }}>
                    {c.nome}
                  </span>
                  <span className="linha__detalhe">
                    {c.final ? `•• ${c.final} · ` : ""}
                    {dados.itens.length} lançamento(s)
                  </span>
                </span>
                <span className="linha__valor">{brl(dados.subtotal)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="btn btn--bloco" onClick={onNovoCartao}>
          <IconPlus size={18} aria-hidden="true" />
          Adicionar cartão
        </button>
      </div>

      <div>
        <h2 className="secao-titulo">Fatura</h2>
        {cartaoSelecionado && (
          <DetalheCartao
            desktop
            cartao={cartaoSelecionado}
            mesAtual={mesAtual}
            resumo={resumo}
            limiteUsado={limiteUsado}
            onNovaCompra={onNovaCompra}
            onEditarCartao={onEditarCartao}
            onTogglePago={onTogglePago}
            onPagarFatura={onPagarFatura}
            onEditarCompra={onEditarCompra}
          />
        )}
      </div>
    </div>
  );
}
