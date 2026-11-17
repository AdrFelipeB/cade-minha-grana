import { labelMes } from "../../lib/meses";
import EstadoVazio from "../comum/EstadoVazio";
import CartaoResumo from "./CartaoResumo";
import GraficoCategorias from "./GraficoCategorias";
import GraficoCompromissos from "./GraficoCompromissos";
import Historico from "./Historico";
import ListaOrigens from "./ListaOrigens";
import ListaPendentes from "./ListaPendentes";

/* Tela inicial (celular), de cima para baixo na ordem de importância:
   resumo do mês → o que falta pagar → de onde vêm os gastos →
   para onde vai a grana → últimos meses → próximos meses. */
export default function TelaResumo({
  mesAtual,
  cartoes,
  salario,
  resumo,
  historico,
  compromissos,
  totaisCategoria,
  discreto,
  onAlternarDiscreto,
  onAbrirContas,
  onAbrirCartao,
  onAdicionar,
  onDefinirSalario,
  onSelecionarMes,
  onTogglePago,
  onPagarTudo,
}) {
  const semNada = cartoes.length === 0 && resumo.gastosDoMes.length === 0;
  const nomeMes = labelMes(mesAtual).split(" ")[0];

  return (
    <>
      <CartaoResumo
        mesAtual={mesAtual}
        salario={salario}
        resumo={resumo}
        discreto={discreto}
        onAlternarDiscreto={onAlternarDiscreto}
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
          <ListaPendentes
            titulo={`A pagar em ${nomeMes}`}
            cartoes={cartoes}
            mesAtual={mesAtual}
            resumo={resumo}
            onTogglePago={onTogglePago}
            onPagarTudo={onPagarTudo}
          />

          <h2 className="secao-titulo">De onde vêm os gastos</h2>
          <ListaOrigens
            cartoes={cartoes}
            resumo={resumo}
            onAbrirContas={onAbrirContas}
            onAbrirCartao={onAbrirCartao}
          />

          <h2 className="secao-titulo">Para onde vai a grana</h2>
          <section className="card" aria-label="Gastos por categoria">
            <GraficoCategorias totais={totaisCategoria} />
          </section>
        </>
      )}

      <Historico historico={historico} mesAtual={mesAtual} onSelecionarMes={onSelecionarMes} />

      <h2 className="secao-titulo">Próximos meses</h2>
      <section className="card" aria-label="Quanto já está comprometido nos próximos meses">
        <GraficoCompromissos compromissos={compromissos} salario={salario} onSelecionarMes={onSelecionarMes} />
      </section>
    </>
  );
}
