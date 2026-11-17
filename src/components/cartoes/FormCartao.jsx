import { useId, useState } from "react";
import { CORES_CARTAO } from "../../cores";
import { CampoDiaVencimento, RodapeForm } from "../comum/CamposComuns";

const NOMES_CORES = ["Roxo", "Azul", "Coral", "Verde", "Rosa", "Âmbar"];

/* Formulário controlado de cartão, para criar ou editar.
   `valores.gradiente` = índice da cor (null = escolher automaticamente). */
export default function FormCartao({ valores, onChange, onSalvar, onExcluir, textoExcluir }) {
  const id = useId();
  const [erro, setErro] = useState("");
  const set = (campo) => (v) => {
    setErro("");
    onChange({ ...valores, [campo]: v });
  };

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
            onChange={(e) => set("nome")(e.target.value)}
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
            onChange={(e) => set("final")(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="1234"
          />
        </div>
      </div>

      {/* Cores como botões de rádio de verdade: setas do teclado trocam a cor */}
      <fieldset className="campo seletor-cor">
        <legend className="campo__rotulo">Cor</legend>
        <div className="seletor-cor__opcoes">
          {CORES_CARTAO.map((cor, i) => (
            <label key={cor} className="seletor-cor__item" title={NOMES_CORES[i]}>
              <input
                type="radio"
                name={`${id}-cor`}
                value={i}
                checked={valores.gradiente === i}
                onChange={() => set("gradiente")(i)}
                aria-label={NOMES_CORES[i]}
              />
              <span style={{ background: cor }} />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grade-2">
        <CampoDiaVencimento
          id={`${id}-dia`}
          valor={valores.diaVencimento}
          onChange={set("diaVencimento")}
          rotulo="Fatura vence dia"
        />
        <div className="campo">
          <label htmlFor={`${id}-limite`}>Limite (R$)</label>
          <input
            id={`${id}-limite`}
            className="input num"
            inputMode="decimal"
            placeholder="opcional"
            value={valores.limite}
            onChange={(e) => set("limite")(e.target.value)}
          />
        </div>
      </div>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <RodapeForm
        textoSalvar={onExcluir ? "Salvar alterações" : "Salvar cartão"}
        onExcluir={onExcluir}
        textoExcluir={textoExcluir}
      />
    </form>
  );
}
