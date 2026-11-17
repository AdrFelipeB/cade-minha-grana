import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";
import { gradCartao, S } from "../../theme";

/* Cabeçalho da aba de um cartão, desenhado como um "cartão de crédito". */
export default function CartaoVisual({ cartao, mesAtual, subtotal, pago, onRemover }) {
  return (
    <div
      style={{
        background: gradCartao(cartao),
        borderRadius: 18,
        padding: "22px 24px",
        marginBottom: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* círculo decorativo */}
      <div
        style={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#FFF" }}>{cartao.nome}</div>
          {cartao.final && (
            <div style={{ ...S.mono, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              •••• •••• •••• {cartao.final}
            </div>
          )}
        </div>
        <button
          onClick={onRemover}
          style={{
            ...S.btn,
            background: "rgba(0,0,0,0.25)",
            color: "#FFF",
            fontSize: 12,
            padding: "6px 10px",
          }}
        >
          Remover
        </button>
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
        Fatura de {labelMes(mesAtual)}
      </div>
      <div style={{ ...S.mono, fontSize: 30, fontWeight: 800, color: "#FFF" }}>{brl(subtotal)}</div>
      {pago > 0 && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
          ✓ pago {brl(pago)} · falta {brl(subtotal - pago)}
        </div>
      )}
    </div>
  );
}
