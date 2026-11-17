import { useId, useState } from "react";

const TIPOS = [
  { id: "fixo", rotulo: "Fixa", dica: "repete todo mês" },
  { id: "momentaneo", rotulo: "Avulsa", dica: "só em um mês" },
];

/* Formulário controlado de nova conta (fixa ou avulsa).
   Os valores moram no App (sobrevivem a fechar o painel sem salvar);
   aqui fica só a mensagem de erro, que é passageira. */
export default function FormConta({ valores, onChange, onSalvar }) {
  const id = useId();
  const [erro, setErro] = useState("");
  const set = (campo) => (v) => {
    setErro("");
    onChange({ ...valores, [campo]: v });
  };
  const fixo = valores.tipo === "fixo";

  const enviar = (e) => {
    e.preventDefault(); // não recarregar a página (comportamento padrão de <form>)
    if (!onSalvar()) setErro("Informe a descrição e um valor maior que zero.");
  };

  return (
    <form onSubmit={enviar} noValidate>
      <div className="campo">
        <span className="campo__rotulo" id={`${id}-tipo`}>
          Tipo
        </span>
        <div className="segmentado" role="group" aria-labelledby={`${id}-tipo`}>
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={valores.tipo === t.id}
              onClick={() => set("tipo")(t.id)}
            >
              {t.rotulo}
              <small>{t.dica}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="campo">
        <label htmlFor={`${id}-desc`}>Descrição</label>
        <input
          id={`${id}-desc`}
          className="input"
          value={valores.descricao}
          onChange={(e) => set("descricao")(e.target.value)}
          placeholder={fixo ? "Aluguel" : "IPTU"}
          autoComplete="off"
        />
      </div>

      <div className="grade-2">
        <div className="campo">
          <label htmlFor={`${id}-valor`}>{fixo ? "Valor mensal (R$)" : "Valor (R$)"}</label>
          <input
            id={`${id}-valor`}
            className="input num"
            value={valores.valor}
            onChange={(e) => set("valor")(e.target.value)}
            placeholder="850,00"
            inputMode="decimal"
          />
        </div>
        <div className="campo">
          <label htmlFor={`${id}-mes`}>{fixo ? "A partir de" : "Mês"}</label>
          <input
            id={`${id}-mes`}
            className="input"
            type="month"
            value={valores.mes}
            onChange={(e) => set("mes")(e.target.value)}
          />
        </div>
      </div>

      {fixo && (
        <p className="dica">
          Valor muda todo mês, como luz e água? Cadastre uma média e ajuste o valor exato
          mês a mês tocando nele na lista.
        </p>
      )}

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <button type="submit" className="btn btn--primario btn--bloco">
        Salvar conta
      </button>
    </form>
  );
}
