import { IconChevronRight, IconReceipt } from "@tabler/icons-react";
import { corCartao } from "../../cores";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import CartaoResumo from "./CartaoResumo";
import Historico from "./Historico";

/* Tela inicial: o mês num cartão de resumo, depois de onde vêm os
   gastos (contas e cada cartão) e o histórico dos últimos meses. */
export default function TelaResumo({
  mesAtual,
  cartoes,
  salario,
  resumo,
  historico,
  onAbrirContas,
  onAbrirCartao,
  onAdicionar,
  onDefinirSalario,
  onSelecionarMes,
}) {
  const { gastosDoMes, totalContas, parcelasDoMesPorCartao, isPago } = resumo;
  const semNada = cartoes.length === 0 && gastosDoMes.length === 0;
  const qtdPagas = gastosDoMes.filter((g) => isPago(g.id)).length;

  return (
    <>
      <CartaoResumo
        mesAtual={mesAtual}
        salario={salario}
        resumo={resumo}
        onDefinirSalario={onDefinirSalario}
      />

      {semNada ? (
        <div className="card">
          <EstadoVazio
            titulo="Comece pelos seus gastos fixos"
            texto="Cadastre um cartão de crédito ou uma conta, como aluguel ou internet."
            acao="Adicionar"
            onAcao={onAdicionar}
          />
        </div>
      ) : (
        <>
          <h2 className="secao-titulo">De onde vêm os gastos</h2>
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
        </>
      )}

      <Historico historico={historico} mesAtual={mesAtual} onSelecionarMes={onSelecionarMes} />
    </>
  );
}
