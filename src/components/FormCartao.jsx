import { useId } from "react";
import { GRAD_PRIMARIO, inputStyle, labelStyle, S } from "../theme";

/* Formulário controlado: os valores vêm de fora (`valores`) e cada
   mudança é avisada por `onChange({ ...valores, campo: novo })`.
   useId gera ids únicos para ligar cada <label htmlFor> ao seu <input>:
   clicar no rótulo foca o campo e o leitor de tela lê o rótulo. */
export default function FormCartao({ valores, onChange, onSalvar }) {
  const id = useId();
  return (
    <div
      style={{
        ...S.painel,
        marginBottom: 16,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      <div style={{ flex: "1 1 160px" }}>
        <label style={labelStyle} htmlFor={`${id}-nome`}>Nome do cartão</label>
        <input
          id={`${id}-nome`}
          value={valores.nome}
          onChange={(e) => onChange({ ...valores, nome: e.target.value })}
          placeholder="Ex.: Nubank"
          style={inputStyle}
        />
      </div>
      <div style={{ flex: "0 1 120px" }}>
        <label style={labelStyle} htmlFor={`${id}-final`}>Final (opcional)</label>
        <input
          id={`${id}-final`}
          inputMode="numeric"
          value={valores.final}
          onChange={(e) =>
            onChange({ ...valores, final: e.target.value.replace(/\D/g, "").slice(0, 4) })
          }
          placeholder="1234"
          style={{ ...inputStyle, ...S.mono }}
        />
      </div>
      <button onClick={onSalvar} style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF" }}>
        Salvar cartão
      </button>
    </div>
  );
}
