/* Helpers de dinheiro e ids. */

export const brl = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Ponto só como separador de milhar: "1.500", "12.345.678"
const SO_MILHAR = /^\d{1,3}(\.\d{3})+$/;

// Aceita "1.234,56", "1234,56", "1234.56" e "1.500" (= mil e quinhentos).
export const parseValor = (s) => {
  const limpo = String(s).trim();
  let v;
  if (limpo.includes(",")) {
    // formato BR: pontos são milhar, vírgula é decimal
    v = parseFloat(limpo.replace(/\./g, "").replace(",", "."));
  } else if (SO_MILHAR.test(limpo)) {
    // "1.500" sem vírgula: quem digita em pt-BR quer dizer 1500, não 1,50
    v = parseFloat(limpo.replace(/\./g, ""));
  } else {
    v = parseFloat(limpo);
  }
  return isNaN(v) ? 0 : v;
};

// Arredonda para centavos
export const centavos = (v) => Math.round(v * 100) / 100;

// Valor -> texto para preencher um input ("1234.5" -> "1234,5")
export const valorParaInput = (v) => String(v).replace(".", ",");

// Parcelas com floor em centavos; a última ajusta para o total bater exato.
export function calcularParcelas(total, n) {
  const base = Math.floor((total / n) * 100) / 100;
  const parcelas = Array(n).fill(base);
  parcelas[n - 1] = Math.round((base + (total - base * n)) * 100) / 100;
  return parcelas;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
