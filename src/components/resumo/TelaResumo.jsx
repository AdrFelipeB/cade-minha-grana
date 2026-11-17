import EstadoVazio from "../comum/EstadoVazio";
import CartaoResumo from "./CartaoResumo";
import Historico from "./Historico";
import ListaOrigens from "./ListaOrigens";

/* Tela inicial (celular): o mês num cartão de resumo, depois de onde
   vêm os gastos (contas e cada cartão) e o histórico dos últimos meses. */
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
  const semNada = cartoes.length === 0 && resumo.gastosDoMes.length === 0;

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
          <ListaOrigens
            cartoes={cartoes}
            resumo={resumo}
            onAbrirContas={onAbrirContas}
            onAbrirCartao={onAbrirCartao}
          />
        </>
      )}

      <Historico historico={historico} mesAtual={mesAtual} onSelecionarMes={onSelecionarMes} />
    </>
  );
}
