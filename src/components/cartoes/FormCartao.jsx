import { useId, useState } from "react";

/* Formulário controlado de novo cartão. */
export default function FormCartao({ valores, onChange, onSalvar }) {
  const id = useId();
  const [erro, setErro] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (!onSalvar()) setErro("Dê um nome ao cartão.");
  };

  return (
    <form onSubmit={enviar} noValidate>
      <div className="grade-2" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
        <div className="campo">
          <label htmlFor={`${id}-nome`}>Nome do cartão</label>
          <input
            id={`${id}-nome`}
            className="input"
            value={valores.nome}
            onChange={(e) => {
              setErro("");
              onChange({ ...valores, nome: e.target.value });
            }}
            placeholder="Nubank"
            autoComplete="off"
          />
        </div>
        <div className="campo">
          <label htmlFor={`${id}-final`}>Final</label>
          <input
            id={`${id}-final`}
            className="input num"
            inputMode="numeric"
            value={valores.final}
            onChange={(e) =>
              onChange({ ...valores, final: e.target.value.replace(/\D/g, "").slice(0, 4) })
            }
            placeholder="1234"
            aria-describedby={`${id}-final-dica`}
          />
        </div>
      </div>
      <p id={`${id}-final-dica`} className="rotulo" style={{ margin: "-6px 0 14px" }}>
        Os 4 últimos dígitos são opcionais e só servem para você diferenciar cartões.
      </p>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <button type="submit" className="btn btn--primario btn--bloco">
        Salvar cartão
      </button>
    </form>
  );
}
