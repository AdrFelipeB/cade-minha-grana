/* Dia de vencimento de contas e faturas.

   O vencimento é só um DIA (1–31); a data real é esse dia dentro do mês
   visto. Em meses mais curtos o dia é ajustado: "dia 31" em fevereiro
   vira o último dia de fevereiro. */

// Converte o que veio do input em dia válido (1–31) ou null
export function diaValido(valor) {
  const n = Number.parseInt(valor, 10);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

export function dataVencimento(mes, dia) {
  const [ano, m] = mes.split("-").map(Number);
  const ultimoDia = new Date(ano, m, 0).getDate(); // dia 0 do mês seguinte = último deste
  return new Date(ano, m - 1, Math.min(dia, ultimoDia));
}

/* Situação de um item quanto ao vencimento, relativa a HOJE.
   tipo: "atrasado" | "hoje" | "breve" (até 5 dias) | "normal" | "pago"
   `dias` = dias até vencer (negativo = já venceu), útil para ordenar. */
export function situacaoVencimento(mes, dia, pago, hoje = new Date()) {
  if (!dia) return null;
  const data = dataVencimento(mes, dia);
  const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.round((data - hojeZero) / 86_400_000);
  const diaReal = data.getDate();

  if (pago) return { tipo: "pago", dias, texto: `vence dia ${diaReal}` };
  if (dias < 0) {
    return { tipo: "atrasado", dias, texto: dias === -1 ? "venceu ontem" : `venceu há ${-dias} dias` };
  }
  if (dias === 0) return { tipo: "hoje", dias, texto: "vence hoje" };
  if (dias === 1) return { tipo: "breve", dias, texto: "vence amanhã" };
  if (dias <= 5) return { tipo: "breve", dias, texto: `vence em ${dias} dias` };
  return { tipo: "normal", dias, texto: `vence dia ${diaReal}` };
}
