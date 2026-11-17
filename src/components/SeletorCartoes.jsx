import { gradCartao, S, T } from "../theme";

/* Seção "💳 Seus cartões": uma aba por cartão + botão "+ Cartão". */
export default function SeletorCartoes({ cartoes, abaAtiva, onSelecionar, onNovoCartao, formAberto }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: T.textoSuave,
          marginBottom: 8,
        }}
      >
        💳 Seus cartões
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {cartoes.map((c) => {
          const ativo = abaAtiva === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelecionar(c.id)}
              aria-pressed={ativo}
              style={{
                ...S.btn,
                background: ativo ? gradCartao(c) : T.bgCard,
                color: T.texto,
                border: `1px solid ${ativo ? "transparent" : T.border}`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {c.nome}
              {c.final && (
                <span style={{ ...S.mono, fontSize: 12, opacity: 0.75 }}>
                  •••• {c.final}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={onNovoCartao}
          aria-expanded={formAberto}
          style={{
            ...S.btn,
            background: "transparent",
            border: `1px dashed ${T.textoSuave}`,
            color: T.textoSuave,
            borderRadius: 12,
          }}
        >
          + Cartão
        </button>
      </div>
    </div>
  );
}
