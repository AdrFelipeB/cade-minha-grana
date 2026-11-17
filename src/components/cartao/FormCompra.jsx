import { useId } from "react";
import { addMeses, labelMes } from "../../lib/meses";
import { brl, calcularParcelas, parseValor } from "../../lib/valores";
import { GRAD_PRIMARIO, inputStyle, labelStyle, S } from "../../theme";

// Valor da 1ª parcela para a prévia "10x de R$ X" (ou null se o valor é inválido)
function valorParcelaPreview(valor, parcelas) {
  const v = parseValor(valor);
  const n = Math.max(1, parseInt(parcelas) || 1);
  if (v <= 0) return null;
  return calcularParcelas(v, n)[0];
}

/* Formulário controlado de nova compra (à vista ou parcelada). */
export default function FormCompra({ valores, onChange, onSalvar }) {
  const set = (campo) => (v) => onChange({ ...valores, [campo]: v });
  const preview = valorParcelaPreview(valores.valor, valores.parcelas);
  const nParcelas = parseInt(valores.parcelas);
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
            placeholder="Ex.: Tênis"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle} htmlFor={`${id}-valor`}>Valor total (R$)</label>
          <input
            id={`${id}-valor`}
            value={valores.valor}
            onChange={(e) => set("valor")(e.target.value)}
            placeholder="299,90"
            inputMode="decimal"
            style={{ ...inputStyle, ...S.mono }}
          />
        </div>
        <div style={{ flex: "0 1 100px" }}>
          <label style={labelStyle} htmlFor={`${id}-parcelas`}>Parcelas</label>
          <input
            id={`${id}-parcelas`}
            type="number"
            min={1}
            max={48}
            value={valores.parcelas}
            onChange={(e) => set("parcelas")(e.target.value)}
            style={{ ...inputStyle, ...S.mono }}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle} htmlFor={`${id}-mes`}>1ª parcela em</label>
          <input
            id={`${id}-mes`}
            type="month"
            value={valores.mes}
            onChange={(e) => set("mes")(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      {preview && nParcelas > 1 && (
        <div style={{ fontSize: 13, color: "#A7F3D0", marginTop: 10 }}>
          {valores.parcelas}x de <strong style={S.mono}>{brl(preview)}</strong> — última parcela em{" "}
          {labelMes(addMeses(valores.mes, nParcelas - 1))}
        </div>
      )}
      <button
        onClick={onSalvar}
        style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF", marginTop: 12 }}
      >
        Salvar compra
      </button>
    </div>
  );
}
