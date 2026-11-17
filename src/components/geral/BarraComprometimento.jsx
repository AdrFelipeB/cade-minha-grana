/* Barra de comprometimento da renda: verde <60%, amarela <90%, vermelha ≥90%. */
function corDaBarra(pct) {
  if (pct < 60) return "linear-gradient(90deg, #34D399, #A7F3D0)";
  if (pct < 90) return "linear-gradient(90deg, #FACC15, #FDE68A)";
  return "linear-gradient(90deg, #FB7185, #FECDD3)";
}

export default function BarraComprometimento({ pct }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: corDaBarra(pct),
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>
        {pct.toFixed(0)}% da sua renda comprometida neste mês
      </div>
    </div>
  );
}
