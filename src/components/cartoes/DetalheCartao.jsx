import { IconArrowLeft, IconPencil, IconPlus } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import { situacaoVencimento } from "../../lib/vencimentos";
import BotaoPagarTudo from "../comum/BotaoPagarTudo";
import EstadoVazio from "../comum/EstadoVazio";
import SeloVencimento from "../comum/SeloVencimento";
import ItemParcela from "./ItemParcela";

/* Barra de limite: quanto do limite as compras ainda ocupam. */
function UsoLimite({ limite, usado }) {
  const pct = Math.min(100, (usado / limite) * 100);
  const disponivel = limite - usado;
  return (
    <div style={{ marginTop: 16 }}>
      <div className="par-valores">
        <span>
          Limite usado <strong className="num">{brl(usado)}</strong> de{" "}
          <span className="num">{brl(limite)}</span>
        </span>
        <span>
          {disponivel >= 0 ? "Disponível " : "Acima do limite "}
          <strong className={`num ${disponivel < 0 ? "negativo" : ""}`}>{brl(Math.abs(disponivel))}</strong>
        </span>
      </div>
      <div
        className="barra"
        style={{ margin: "8px 0 0" }}
        role="progressbar"
        aria-label="Limite usado"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="barra__preenchimento"
          style={{
            width: `${pct}%`,
            background: pct < 70 ? "var(--accent)" : pct < 90 ? "var(--warning-fill)" : "var(--danger-fill)",
          }}
        />
      </div>
    </div>
  );
}

/* Fatura de um cartão no mês: total, vencimento, pago/falta, limite e lançamentos. */
export default function DetalheCartao({
  cartao,
  mesAtual,
  resumo,
  limiteUsado,
  desktop = false, // no desktop a lista fica ao lado: sem "voltar", com botão de nova compra
  onVoltar,
  onNovaCompra,
  onEditarCartao,
  onTogglePago,
  onPagarFatura,
  onEditarCompra,
}) {
  const { parcelasDoMesPorCartao, isPago } = resumo;
  const { itens, subtotal } = parcelasDoMesPorCartao[cartao.id] || { itens: [], subtotal: 0 };
  const pendentes = itens.filter((p) => !isPago(p.id));
  const pago = subtotal - pendentes.reduce((s, p) => s + p.valorParcela, 0);
  const faturaPaga = itens.length > 0 && pendentes.length === 0;
  const situacao = itens.length > 0 ? situacaoVencimento(mesAtual, cartao.diaVencimento, faturaPaga) : null;
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
          <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {desktop && (
              <button type="button" className="btn btn--pequeno" onClick={onNovaCompra}>
                <IconPlus size={16} aria-hidden="true" />
                Nova compra
              </button>
            )}
            <button
              type="button"
              className="btn btn--pequeno"
              onClick={onEditarCartao}
              aria-label={`Editar cartão ${cartao.nome}`}
            >
              <IconPencil size={16} aria-hidden="true" />
              {desktop && "Editar"}
            </button>
          </span>
        </div>

        <div className="rotulo">
          Fatura de {labelMes(mesAtual)} {situacao && <SeloVencimento situacao={faturaPaga ? { tipo: "pago", texto: "paga" } : situacao} />}
        </div>
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

        {pendentes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <BotaoPagarTudo
              rotulo="Pagar fatura"
              quantidade={pendentes.length}
              total={subtotal - pago}
              onConfirmar={() => onPagarFatura(pendentes.map((p) => p.id))}
            />
          </div>
        )}

        {cartao.limite > 0 && <UsoLimite limite={cartao.limite} usado={limiteUsado} />}
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
                onEditar={() => onEditarCompra(p.id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
