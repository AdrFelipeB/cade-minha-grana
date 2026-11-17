import { useId, useState } from "react";
import { brl, parseValor, valorParaInput } from "../../lib/valores";

/* Salário mensal. O rascunho do campo é estado local: só vira dado
   de verdade quando a pessoa toca em "Salvar". */
export default function CampoSalario({ salario, onSalvar, autoFocus }) {
  const id = useId();
  const [texto, setTexto] = useState(salario ? valorParaInput(salario) : "");
  const [salvo, setSalvo] = useState(false);
  const alterado = parseValor(texto) !== salario;

  const enviar = (e) => {
    e.preventDefault();
    onSalvar(parseValor(texto));
    setSalvo(true);
  };

  return (
    <form onSubmit={enviar} noValidate>
      <div className="campo" style={{ marginBottom: 8 }}>
        <label htmlFor={`${id}-salario`}>Salário mensal (R$)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id={`${id}-salario`}
            className="input num"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setSalvo(false);
            }}
            placeholder="3.500,00"
            inputMode="decimal"
            autoFocus={autoFocus}
            aria-describedby={`${id}-salario-dica`}
          />
          <button type="submit" className="btn btn--primario">
            Salvar
          </button>
        </div>
      </div>
      <p id={`${id}-salario-dica`} className="rotulo" role="status">
        {salvo && !alterado
          ? `Salvo: ${brl(salario)}.`
          : "Usado para calcular quanto sobra no mês e quanto da renda está comprometido."}
      </p>
    </form>
  );
}
