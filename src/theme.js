/* ============================ TEMA ============================ */

export const T = {
  bg: "#0E0B1E",
  bgCard: "#1B1730",
  border: "#2C2650",
  texto: "#F1EEFF",
  textoSuave: "#9C94C4",
  positivo: "#34D399",
  negativo: "#FB7185",
};

export const GRADIENTES_CARTAO = [
  ["#820AD1", "#B546F5"], // roxo Nubank
  ["#0284C7", "#22D3EE"], // azul elétrico
  ["#E11D48", "#FB923C"], // coral
  ["#059669", "#5EEAD4"], // esmeralda
  ["#DB2777", "#A855F7"], // rosa
  ["#D97706", "#FACC15"], // âmbar
];

export const GRAD_PRIMARIO = "linear-gradient(135deg, #7C3AED, #DB2777)";
export const GRAD_CONTAS = "linear-gradient(135deg, #0891B2, #34D399)";

// Gradiente CSS de um cartão
export const gradCartao = (c) => {
  const [a, b] = GRADIENTES_CARTAO[c.gradiente ?? 0];
  return `linear-gradient(135deg, ${a}, ${b})`;
};

export const S = {
  mono: {
    fontFamily: "ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, monospace",
    fontVariantNumeric: "tabular-nums",
  },
  btn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.1s ease, opacity 0.15s ease",
  },
  painel: {
    background: "#1B1730",
    border: "1px solid #2C2650",
    borderRadius: 16,
    padding: 16,
  },
};

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  fontSize: 14,
  marginTop: 4,
  background: "#141026",
  color: T.texto,
};

/* Zera a aparência padrão de <button> para que um elemento clicável
   pareça igual a um <div>/<span>, mas continue acessível
   (foco pelo Tab, Enter/Espaço, anunciado por leitores de tela). */
export const botaoReset = {
  font: "inherit",
  color: "inherit",
  textAlign: "left",
  margin: 0,
  padding: 0,
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

export const labelStyle = { fontSize: 12, fontWeight: 700, color: T.textoSuave };
