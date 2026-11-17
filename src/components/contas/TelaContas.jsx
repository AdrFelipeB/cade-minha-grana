import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import ItemConta from "./ItemConta";

/* Contas fora do cartão (aluguel, luz, IPTU…) do mês visualizado. */
export default function TelaContas({
  mesAtual,
  resumo,
  edicaoOverride, // { id, valor } | null
  onEdicaoOverrideChange,
  onSalvarOverride,
  onRemoverOverride,
  onTogglePago,
  onRemover,
  onAdicionar,
}) {
  const { gastosDoMes, totalContas, isPago } = resumo;
  const qtdPagas = gastosDoMes.filter((g) => isPago(g.id)).length;
  const temFixaComValor = gastosDoMes.some((g) => g.tipo === "fixo");

  return (
    <>
      <div className="topo-tela">
        <h1>Contas</h1>
        <span className="linha__valor" style={{ fontSize: 18 }}>
          {brl(totalContas)}
        </span>
      </div>

      {gastosDoMes.length === 0 ? (
        <div className="card">
          <EstadoVazio
            titulo={`Nenhuma conta em ${labelMes(mesAtual)}`}
            texto="Cadastre o que você paga fora do cartão: aluguel, luz, água, internet…"
            acao="Adicionar conta"
            onAcao={onAdicionar}
          />
        </div>
      ) : (
        <>
          <p className="rotulo" style={{ margin: "0 2px 8px" }}>
            {qtdPagas} de {gastosDoMes.length} pagas neste mês
          </p>
          <div className="card card--lista">
            {gastosDoMes.map((g) => (
              <ItemConta
                key={g.id}
                gasto={g}
                mesAtual={mesAtual}
                pago={isPago(g.id)}
                overrideInput={edicaoOverride?.id === g.id ? edicaoOverride.valor : null}
                onOverrideInputChange={(valor) => onEdicaoOverrideChange({ id: g.id, valor })}
                onCancelarEdicao={() => onEdicaoOverrideChange(null)}
                onSalvarOverride={() => onSalvarOverride(g.id)}
                onRemoverOverride={() => onRemoverOverride(g.id)}
                onTogglePago={() => onTogglePago(g.id)}
                onRemover={() => onRemover(g.id)}
              />
            ))}
          </div>
          {temFixaComValor && (
            <p className="rotulo" style={{ margin: "0 2px" }}>
              Valor da conta fixa mudou este mês? Toque no valor para ajustar só este mês.
            </p>
          )}
        </>
      )}
    </>
  );
}
