import { S } from "../../theme";
import CheckPago from "./CheckPago";

/* Linha de lista com check de pago à esquerda (contas e parcelas).
   - titulo: texto principal (fica riscado quando pago)
   - detalhe: linha secundária abaixo do título
   - children: lado direito (valor, botões) */
export default function LinhaItem({ pago, onTogglePago, titulo, detalhe, gapDireita = 12, children }) {
  return (
    <div
      style={{
        ...S.painel,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 12,
        gap: 12,
        opacity: pago ? 0.65 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <CheckPago pago={pago} onClick={onTogglePago} descricao={titulo} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              textDecoration: pago ? "line-through" : "none",
            }}
          >
            {titulo}
          </div>
          {detalhe}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: gapDireita, flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}
