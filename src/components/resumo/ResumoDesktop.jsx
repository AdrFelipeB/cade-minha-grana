import { corComprometimento } from "../../cores";
import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import GraficoCategorias from "./GraficoCategorias";
import GraficoCompromissos from "./GraficoCompromissos";
import GraficoHistorico from "./GraficoHistorico";
import ListaOrigens from "./ListaOrigens";
import ListaPendentes from "./ListaPendentes";

/* Um indicador do painel: rótulo pequeno, valor grande, detalhe embaixo. */
function Metrica({ rotulo, valor, classeValor = "", children }) {
  return (
    <section className="card metrica">
      <div className="rotulo">{rotulo}</div>
      <div className={`metrica__valor num ${classeValor}`}>{valor}</div>
      {children}
    </section>
  );
}

/* Resumo no desktop: indicadores lado a lado no topo e, abaixo, duas colunas:
   esquerda = origens dos gastos + o que falta pagar;
   direita = gráficos (últimos meses, próximos meses, categorias). */
export default function ResumoDesktop({
  mesAtual,
  cartoes,
  salario,
  resumo,
  historico,
  compromissos,
  totaisCategoria,
  onAbrirContas,
  onAbrirCartao,
  onAdicionar,
  onDefinirSalario,
  onSelecionarMes,
  onTogglePago,
  onPagarTudo,
}) {
  const { totalGeral, totalCartoes, totalContas, totalPago, totalRestante, sobra, pctComprometido } =
    resumo;
  const nomeMes = labelMes(mesAtual).split(" ")[0];
  const semNada = cartoes.length === 0 && resumo.gastosDoMes.length === 0;
  const linkSalario = (
    <button type="button" className="btn btn--link" onClick={onDefinirSalario}>
      Informar salário
    </button>
  );

  return (
    <>
      <div className="grade-metricas">
        <Metrica rotulo={`Gastos de ${nomeMes}`} valor={brl(totalGeral)}>
          <div className="rotulo">
            Cartões <span className="num">{brl(totalCartoes)}</span> · Contas{" "}
            <span className="num">{brl(totalContas)}</span>
          </div>
        </Metrica>

        <Metrica
          rotulo={sobra >= 0 ? "Vai sobrar" : "Vai faltar"}
          valor={salario > 0 ? brl(Math.abs(sobra)) : "—"}
          classeValor={salario > 0 ? (sobra >= 0 ? "positivo" : "negativo") : "texto-3"}
        >
          <div className="rotulo">
            {salario > 0 ? (
              <>
                de <span className="num">{brl(salario)}</span> de salário
              </>
            ) : (
              linkSalario
            )}
          </div>
        </Metrica>

        <Metrica
          rotulo="Renda comprometida"
          valor={salario > 0 ? `${pctComprometido.toFixed(0)}%` : "—"}
          classeValor={salario > 0 ? "" : "texto-3"}
        >
          {salario > 0 ? (
            <div
              className="barra"
              style={{ margin: "8px 0 0" }}
              role="progressbar"
              aria-label="Renda comprometida"
              aria-valuenow={Math.round(pctComprometido)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="barra__preenchimento"
                style={{ width: `${pctComprometido}%`, background: corComprometimento(pctComprometido) }}
              />
            </div>
          ) : (
            <div className="rotulo">{linkSalario}</div>
          )}
        </Metrica>

        <Metrica
          rotulo="Falta pagar"
          valor={brl(totalRestante)}
          classeValor={totalGeral > 0 && totalRestante <= 0 ? "positivo" : ""}
        >
          <div className="rotulo">
            {totalGeral > 0 && totalRestante <= 0 ? (
              "Tudo pago neste mês"
            ) : (
              <>
                Já pago <span className="num">{brl(totalPago)}</span>
              </>
            )}
          </div>
        </Metrica>
      </div>

      <div className="grade-2col">
        <div>
          <h2 className="secao-titulo">De onde vêm os gastos</h2>
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
              <ListaOrigens
                cartoes={cartoes}
                resumo={resumo}
                onAbrirContas={onAbrirContas}
                onAbrirCartao={onAbrirCartao}
              />
              <ListaPendentes
                titulo={`A pagar em ${nomeMes}`}
                cartoes={cartoes}
                mesAtual={mesAtual}
                resumo={resumo}
                onTogglePago={onTogglePago}
                onPagarTudo={onPagarTudo}
              />
            </>
          )}
        </div>

        <div>
          <h2 className="secao-titulo">Últimos meses</h2>
          <section className="card" aria-label="Gastos dos últimos meses">
            <GraficoHistorico historico={historico} mesAtual={mesAtual} onSelecionarMes={onSelecionarMes} />
          </section>

          <h2 className="secao-titulo">Próximos meses</h2>
          <section className="card" aria-label="Quanto já está comprometido nos próximos meses">
            <GraficoCompromissos
              compromissos={compromissos}
              salario={salario}
              onSelecionarMes={onSelecionarMes}
            />
          </section>

          <h2 className="secao-titulo">Para onde vai a grana em {nomeMes}</h2>
          <section className="card" aria-label="Gastos por categoria">
            <GraficoCategorias totais={totaisCategoria} />
          </section>
        </div>
      </div>
    </>
  );
}
