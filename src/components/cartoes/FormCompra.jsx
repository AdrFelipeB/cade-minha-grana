import { useId, useState } from "react";
import { addMeses, labelMes } from "../../lib/meses";
import { brl, calcularParcelas, parseValor } from "../../lib/valores";
import { CampoCategoria, RodapeForm } from "../comum/CamposComuns";

// Valor da 1ª parcela para a prévia "10x de R$ X" (ou null se o valor é inválido)
function valorParcelaPreview(valor, parcelas) {
  const v = parseValor(valor);
  const n = Math.max(1, parseInt(parcelas) || 1);
  if (v <= 0) return null;
  return calcularParcelas(v, n)[0];
}

/* Formulário controlado de compra (à vista ou parcelada).
   Serve para criar e para editar; na edição, `onExcluir` mostra o link de excluir. */
export default function FormCompra({ valores, cartoes, onChange, onSalvar, onExcluir }) {
  const id = useId();
  const [erro, setErro] = useState("");
  const set = (campo) => (v) => {
    setErro("");
    onChange({ ...valores, [campo]: v });
  };
  const preview = valorParcelaPreview(valores.valor, valores.parcelas);
  const nParcelas = parseInt(valores.parcelas);

  const enviar = (e) => {
    e.preventDefault();
    if (!onSalvar()) setErro("Informe a descrição e um valor maior que zero.");
  };

  return (
    <form onSubmit={enviar} noValidate>
      {cartoes.length > 1 && (
        <div className="campo">
          <label htmlFor={`${id}-cartao`}>Cartão</label>
          <select
            id={`${id}-cartao`}
            className="input"
            value={valores.cartaoId}
            onChange={(e) => set("cartaoId")(e.target.value)}
          >
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
                {c.final ? ` •• ${c.final}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="campo">
        <label htmlFor={`${id}-desc`}>Descrição</label>
        <input
          id={`${id}-desc`}
          className="input"
          value={valores.descricao}
          onChange={(e) => set("descricao")(e.target.value)}
          placeholder="Tênis"
          autoComplete="off"
        />
      </div>

      <div className="grade-2">
        <div className="campo">
          <label htmlFor={`${id}-valor`}>Valor total (R$)</label>
          <input
            id={`${id}-valor`}
            className="input num"
            value={valores.valor}
            onChange={(e) => set("valor")(e.target.value)}
            placeholder="299,90"
            inputMode="decimal"
          />
        </div>
        <div className="campo">
          <label htmlFor={`${id}-parcelas`}>Parcelas</label>
          <input
            id={`${id}-parcelas`}
            className="input num"
            type="number"
            min={1}
            max={48}
            inputMode="numeric"
            value={valores.parcelas}
            onChange={(e) => set("parcelas")(e.target.value)}
          />
        </div>
      </div>

      <div className="grade-2">
        <div className="campo">
          <label htmlFor={`${id}-mes`}>{nParcelas > 1 ? "1ª parcela em" : "Mês da fatura"}</label>
          <input
            id={`${id}-mes`}
            className="input"
            type="month"
            value={valores.mes}
            onChange={(e) => set("mes")(e.target.value)}
          />
        </div>
        <CampoCategoria id={`${id}-cat`} valor={valores.categoria} onChange={set("categoria")} />
      </div>

      {preview && nParcelas > 1 && (
        <p className="previa">
          {nParcelas}x de <strong className="num">{brl(preview)}</strong> · última em{" "}
          {labelMes(addMeses(valores.mes, nParcelas - 1))}
        </p>
      )}

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <RodapeForm
        textoSalvar={onExcluir ? "Salvar alterações" : "Salvar compra"}
        onExcluir={onExcluir}
        textoExcluir="Excluir compra (todas as parcelas)"
      />
    </form>
  );
}
