import { useId } from "react";
import { GRAD_CONTAS, inputStyle, labelStyle, S, T } from "../../theme";

const TIPOS = [
  { id: "fixo", rotulo: "🔁 Fixo", dica: "repete todo mês" },
  { id: "momentaneo", rotulo: "📌 Momentâneo", dica: "só neste mês" },
];

/* Formulário controlado de nova conta (fixa ou momentânea). */
export default function FormConta({ valores, onChange, onSalvar }) {
  const set = (campo) => (v) => onChange({ ...valores, [campo]: v });
  const fixo = valores.tipo === "fixo";
  const id = useId();

  return (
    <div style={{ ...S.painel, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 200px" }}>
          <label style={labelStyle} htmlFor={`${id}-desc`}>Descrição</label>
          <input
            id={`${id}-desc`}
            value={valores.descricao}
            onChange={(e) => set("descricao")(e.target.value)}
            placeholder="Ex.: Aluguel"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle} htmlFor={`${id}-valor`}>
            {fixo ? "Valor padrão (R$)" : "Valor (R$)"}
          </label>
          <input
            id={`${id}-valor`}
            value={valores.valor}
            onChange={(e) => set("valor")(e.target.value)}
            placeholder="850,00"
            inputMode="decimal"
            style={{ ...inputStyle, ...S.mono }}
          />
        </div>
      </div>

      {/* Toggle fixo / momentâneo */}
      <div style={{ marginTop: 12 }}>
        <span style={labelStyle} id={`${id}-tipo`}>Tipo de gasto</span>
        <div
          role="group"
          aria-labelledby={`${id}-tipo`}
          style={{ display: "flex", gap: 8, marginTop: 6 }}
        >
          {TIPOS.map((t) => {
            const ativo = valores.tipo === t.id;
            return (
              <button
                key={t.id}
                onClick={() => set("tipo")(t.id)}
                aria-pressed={ativo}
                style={{
                  ...S.btn,
                  flex: 1,
                  background: ativo ? GRAD_CONTAS : "#141026",
                  color: T.texto,
                  border: `1px solid ${ativo ? "transparent" : T.border}`,
                }}
              >
                {t.rotulo}
                <span style={{ display: "block", fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
                  {t.dica}
                </span>
              </button>
            );
          })}
        </div>
        {fixo && (
          <div style={{ fontSize: 12, color: T.textoSuave, marginTop: 6 }}>
            💡 Contas fixas de valor variável (luz, água): cadastre com um valor médio e
            ajuste o valor exato mês a mês na lista abaixo.
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, maxWidth: 200 }}>
        <label style={labelStyle} htmlFor={`${id}-mes`}>
          {fixo ? "A partir de" : "Mês do gasto"}
        </label>
        <input
          id={`${id}-mes`}
          type="month"
          value={valores.mes}
          onChange={(e) => set("mes")(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button
        onClick={onSalvar}
        style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", marginTop: 14 }}
      >
        Salvar conta
      </button>
    </div>
  );
}
