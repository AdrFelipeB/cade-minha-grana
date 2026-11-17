import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import EstadoVazio from "../comum/EstadoVazio";
import FormConta from "./FormConta";
import ItemConta from "./ItemConta";

/* Contas fora do cartão (aluguel, luz, IPTU…) do mês visualizado.
   No desktop ganha uma coluna lateral com o total e o formulário de
   nova conta sempre visível (sem precisar abrir o painel). */
export default function TelaContas({
  mesAtual,
  resumo,
  desktop = false,
  form,
  onFormChange,
  onSalvarForm,
  edicaoOverride, // { id, valor } | null
  onEdicaoOverrideChange,
  onSalvarOverride,
  onRemoverOverride,
  onTogglePago,
  onRemover,
  onAdicionar,
}) {
  const { gastosDoMes, totalContas, isPago } = resumo;
  const pagas = gastosDoMes.filter((g) => isPago(g.id));
  const totalPago = pagas.reduce((s, g) => s + g.valorNoMes, 0);
  const temFixa = gastosDoMes.some((g) => g.tipo === "fixo");

  const lista =
    gastosDoMes.length === 0 ? (
      <div className="card">
        <EstadoVazio
          titulo={`Nenhuma conta em ${labelMes(mesAtual)}`}
          texto="Cadastre o que você paga fora do cartão: aluguel, luz, água, internet…"
          acao={desktop ? undefined : "Adicionar conta"}
          onAcao={onAdicionar}
        />
      </div>
    ) : (
      <>
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
        {temFixa && (
          <p className="rotulo" style={{ margin: "0 2px" }}>
            Valor da conta fixa mudou este mês? Toque no valor para ajustar só este mês.
          </p>
        )}
      </>
    );

  if (desktop) {
    const pct = totalContas > 0 ? (totalPago / totalContas) * 100 : 0;
    return (
      <div className="grade-contas">
        <div>
          <h2 className="secao-titulo">
            {gastosDoMes.length > 0
              ? `${pagas.length} de ${gastosDoMes.length} pagas em ${labelMes(mesAtual)}`
              : labelMes(mesAtual)}
          </h2>
          {lista}
        </div>

        <aside>
          <h2 className="secao-titulo">Total do mês</h2>
          <section className="card">
            <div className="valor-grande num">{brl(totalContas)}</div>
            <div className="barra" style={{ margin: "10px 0" }} aria-hidden="true">
              <div className="barra__preenchimento" style={{ width: `${pct}%`, background: "var(--success)" }} />
            </div>
            <div className="par-valores">
              <span>
                Pago <strong className="num">{brl(totalPago)}</strong>
              </span>
              <span>
                Falta <strong className="num">{brl(totalContas - totalPago)}</strong>
              </span>
            </div>
          </section>

          <h2 className="secao-titulo">Nova conta</h2>
          <section className="card">
            <FormConta valores={form} onChange={onFormChange} onSalvar={onSalvarForm} />
          </section>
        </aside>
      </div>
    );
  }

  return (
    <>
      <div className="topo-tela">
        <h1>Contas</h1>
        <span className="linha__valor" style={{ fontSize: 18 }}>
          {brl(totalContas)}
        </span>
      </div>
      {gastosDoMes.length > 0 && (
        <p className="rotulo" style={{ margin: "0 2px 8px" }}>
          {pagas.length} de {gastosDoMes.length} pagas neste mês
        </p>
      )}
      {lista}
    </>
  );
}
