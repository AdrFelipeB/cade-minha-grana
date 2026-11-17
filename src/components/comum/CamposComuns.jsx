import { CATEGORIAS } from "../../categorias";

/* Campos reaproveitados pelos formulários de compra, conta e cartão. */

export function CampoCategoria({ id, valor, onChange }) {
  return (
    <div className="campo">
      <label htmlFor={id}>Categoria</label>
      <select id={id} className="input" value={valor} onChange={(e) => onChange(e.target.value)}>
        {CATEGORIAS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CampoDiaVencimento({ id, valor, onChange, rotulo = "Vence todo dia" }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        className="input num"
        type="number"
        min={1}
        max={31}
        inputMode="numeric"
        placeholder="opcional"
        value={valor}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
      />
    </div>
  );
}

/* Rodapé dos formulários: botão principal e, na edição, "Excluir". */
export function RodapeForm({ textoSalvar, onExcluir, textoExcluir }) {
  return (
    <>
      <button type="submit" className="btn btn--primario btn--bloco">
        {textoSalvar}
      </button>
      {onExcluir && (
        <button
          type="button"
          className="btn btn--link btn--perigo"
          onClick={onExcluir}
          style={{ margin: "14px auto 0", display: "flex" }}
        >
          {textoExcluir}
        </button>
      )}
    </>
  );
}
