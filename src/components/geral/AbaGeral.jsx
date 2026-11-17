import { GRAD_CONTAS, gradCartao, S, T } from "../../theme";
import VazioMsg from "../comum/VazioMsg";
import Historico from "./Historico";
import LinhaResumo from "./LinhaResumo";
import PainelSalario from "./PainelSalario";

export default function AbaGeral({
  mesAtual,
  cartoes,
  salario,
  resumo,
  historico,
  salarioInput,
  onSalarioInputChange,
  onSalvarSalario,
  onIrParaAba,
  onSelecionarMes,
}) {
  const { gastosDoMes, totalContas, parcelasDoMesPorCartao, isPago } = resumo;

  return (
    <>
      <PainelSalario
        mesAtual={mesAtual}
        salario={salario}
        salarioInput={salarioInput}
        onSalarioInputChange={onSalarioInputChange}
        onSalvarSalario={onSalvarSalario}
        resumo={resumo}
      />

      {/* Contas do mês (resumo) */}
      <LinhaResumo
        gradiente={GRAD_CONTAS}
        titulo={<strong>Contas do mês</strong>}
        subtitulo={`${gastosDoMes.filter((g) => isPago(g.id)).length}/${gastosDoMes.length} paga(s)`}
        valor={totalContas}
        onClick={() => onIrParaAba("contas")}
        style={{ marginBottom: 10 }}
      />

      {/* Por cartão */}
      {cartoes.length === 0 ? (
        <VazioMsg texto="Nenhum cartão cadastrado ainda. Comece adicionando um na aba “+ Cartão”." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {cartoes.map((c) => (
            <LinhaResumo
              key={c.id}
              gradiente={gradCartao(c)}
              titulo={
                <>
                  <strong>{c.nome}</strong>{" "}
                  {c.final && (
                    <span style={{ ...S.mono, fontSize: 12, color: T.textoSuave }}>
                      •••• {c.final}
                    </span>
                  )}
                </>
              }
              subtitulo={`${parcelasDoMesPorCartao[c.id]?.itens.length || 0} lançamento(s) no mês`}
              valor={parcelasDoMesPorCartao[c.id]?.subtotal || 0}
              onClick={() => onIrParaAba(c.id)}
            />
          ))}
        </div>
      )}

      <Historico historico={historico} mesAtual={mesAtual} onSelecionarMes={onSelecionarMes} />
    </>
  );
}
