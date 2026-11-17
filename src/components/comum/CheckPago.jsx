import { T } from "../../theme";

/* Check circular de "pago" usado em contas e parcelas.
   aria-pressed faz o leitor de tela anunciar "botão alternar, pressionado". */
export default function CheckPago({ pago, onClick, descricao }) {
  return (
    <button
      onClick={onClick}
      title={pago ? "Marcar como não pago" : "Marcar como pago"}
      aria-label={`${descricao}: pago`}
      aria-pressed={pago}
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        border: pago ? "none" : `2px solid ${T.textoSuave}`,
        background: pago ? "linear-gradient(135deg, #34D399, #A7F3D0)" : "transparent",
        color: "#065F46",
        fontWeight: 900,
        fontSize: 14,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s ease",
      }}
    >
      {pago ? "✓" : ""}
    </button>
  );
}
