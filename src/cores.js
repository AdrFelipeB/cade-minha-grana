/* Cor de identificação de cada cartão (a bolinha ao lado do nome).
   Tons médios, legíveis tanto no tema claro quanto no escuro.

   O campo salvo no cartão continua se chamando `gradiente` (nome
   herdado do protótipo) para não precisar migrar os dados: é só o
   índice nesta lista. */
export const CORES_CARTAO = [
  "#8B5CF6", // roxo
  "#0EA5E9", // azul
  "#F97316", // coral
  "#10B981", // esmeralda
  "#EC4899", // rosa
  "#F59E0B", // âmbar
];

export const corCartao = (c) => CORES_CARTAO[c.gradiente ?? 0] ?? CORES_CARTAO[0];

// Cor da barra de comprometimento da renda: <60% ok, <90% atenção, ≥90% perigo
export const corComprometimento = (pct) =>
  pct < 60 ? "var(--success)" : pct < 90 ? "var(--warning-fill)" : "var(--danger-fill)";
