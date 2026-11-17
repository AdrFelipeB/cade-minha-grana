import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import ItemParcela from "./ItemParcela";

/* Fatura de um cartão no mês: total, pago/falta e os lançamentos. */
export default function DetalheCartao({
  cartao,
  mesAtual,
  resumo,
  desktop = false, // no desktop a lista fica ao lado: sem "voltar", com botão de nova compra
  onVoltar,
  onNovaCompra,
  onRemoverCartao,
  onTogglePago,
  onRemoverCompra,
}) {
  const { parcelasDoMesPorCartao, isPago } = resumo;
  const { itens, subtotal } = parcelasDoMesPorCartao[cartao.id] || { itens: [], subtotal: 0 };
  const pago = itens.filter((p) => isPago(p.id)).reduce((s, p) => s + p.valorParcela, 0);
  const Titulo = desktop ? "h2" : "h1";

  return (
    <>
      {!desktop && (
        <button type="button" className="btn btn--link" onClick={onVoltar} style={{ margin: "6px 2px 10px" }}>
          <IconArrowLeft size={18} aria-hidden="true" />
          Cartões
        </button>
      )}

      <section className="card" aria-labelledby="titulo-cartao">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span className="ponto ponto--grande" style={{ background: corCartao(cartao) }} aria-hidden="true" />
          {/* No celular é o título da página (h1); no desktop o h1 é "Cartões" */}
          <Titulo id="titulo-cartao" style={{ fontSize: 20, fontWeight: 700 }}>
            {cartao.nome}
          </Titulo>
          {cartao.final && <span className="texto-3 num">•••• {cartao.final}</span>}
          {desktop && (
            <button type="button" className="btn btn--pequeno" onClick={onNovaCompra} style={{ marginLeft: "auto" }}>
              <IconPlus size={16} aria-hidden="true" />
              Nova compra
            </button>
          )}
        </div>
        <div className="rotulo">Fatura de {labelMes(mesAtual)}</div>
        <div className="valor-grande num">{brl(subtotal)}</div>
        {subtotal > 0 && (
          <div className="par-valores" style={{ marginTop: 8 }}>
            <span>
              Pago <strong className="num">{brl(pago)}</strong>
            </span>
            <span>
              Falta <strong className="num">{brl(subtotal - pago)}</strong>
            </span>
          </div>
        )}
      </section>

      {itens.length === 0 ? (
        <div className="card">
          <EstadoVazio
            titulo={`Nada neste cartão em ${labelMes(mesAtual)}`}
            texto="Lance uma compra à vista ou parcelada."
            acao="Adicionar compra"
            onAcao={onNovaCompra}
          />
        </div>
      ) : (
        <>
          <h2 className="secao-titulo">Lançamentos</h2>
          <div className="card card--lista">
            {itens.map((p) => (
              <ItemParcela
                key={p.id}
                parcela={p}
                pago={isPago(p.id)}
                onTogglePago={() => onTogglePago(p.id)}
                onRemover={() => onRemoverCompra(p.id)}
              />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="btn btn--link btn--perigo"
        onClick={onRemoverCartao}
        style={{ margin: "12px 2px" }}
      >
        Remover este cartão
      </button>
    </>
  );
}
