import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import { GRAD_CONTAS, S } from "../../theme";
import VazioMsg from "../comum/VazioMsg";
import FormConta from "./FormConta";
import ItemConta from "./ItemConta";

export default function AbaContas({
  mesAtual,
  resumo,
  mostrarForm,
  onToggleForm,
  form,
  onFormChange,
  onSalvarForm,
  edicaoOverride, // { id, valor } | null
  onEdicaoOverrideChange,
  onSalvarOverride,
  onRemoverOverride,
  onTogglePago,
  onRemover,
}) {
  const { gastosDoMes, totalContas, isPago } = resumo;
  const qtdPagas = gastosDoMes.filter((g) => isPago(g.id)).length;

  return (
    <>
      <div
        style={{
          background: GRAD_CONTAS,
          borderRadius: 18,
          padding: "22px 24px",
          marginBottom: 16,
          boxShadow: "0 12px 40px rgba(8,145,178,0.35)",
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
          Contas de {labelMes(mesAtual)}
        </div>
        <div style={{ ...S.mono, fontSize: 30, fontWeight: 800, color: "#FFF" }}>
          {brl(totalContas)}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
          {qtdPagas} de {gastosDoMes.length} conta(s) paga(s) neste mês
        </div>
      </div>

      <button
        onClick={onToggleForm}
        aria-expanded={mostrarForm}
        style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", marginBottom: 14 }}
      >
        + Nova conta
      </button>

      {mostrarForm && <FormConta valores={form} onChange={onFormChange} onSalvar={onSalvarForm} />}

      {gastosDoMes.length === 0 ? (
        <VazioMsg texto={`Nenhuma conta em ${labelMes(mesAtual)}. Cadastre o aluguel, luz, água…`} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gastosDoMes.map((g) => (
            <ItemConta
              key={g.id}
              gasto={g}
              mesAtual={mesAtual}
              pago={isPago(g.id)}
              overrideInput={edicaoOverride?.id === g.id ? edicaoOverride.valor : null}
              onOverrideInputChange={(valor) => onEdicaoOverrideChange({ id: g.id, valor })}
              onSalvarOverride={() => onSalvarOverride(g.id)}
              onRemoverOverride={() => onRemoverOverride(g.id)}
              onTogglePago={() => onTogglePago(g.id)}
              onRemover={() => onRemover(g.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
