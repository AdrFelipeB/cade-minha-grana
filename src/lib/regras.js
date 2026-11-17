/* Regras de negócio puras (sem React): fáceis de testar isoladamente. */

import { addMeses, diffMeses, hojeMes } from "./meses";
import { calcularParcelas } from "./valores";

// Meses de retenção no passado (navegação e limpeza automática)
export const MESES_RETENCAO = 3;

// Parcela de uma compra em um mês (ou null se a compra não cai nesse mês)
export function parcelaDoMes(compra, mes) {
  const idx = diffMeses(mes, compra.primeiroMes);
  if (idx < 0 || idx >= compra.parcelas) return null;
  const valores = calcularParcelas(compra.valorTotal, compra.parcelas);
  return { ...compra, numeroParcela: idx + 1, valorParcela: valores[idx] };
}

// Uma conta (gasto geral) se aplica ao mês?
export function contaDoMes(gasto, mes) {
  if (gasto.tipo === "fixo") return diffMeses(mes, gasto.mesInicio) >= 0;
  return gasto.mes === mes;
}

// Valor de uma conta em um mês (considera override de contas fixas)
export function valorDaConta(gasto, mes) {
  if (gasto.tipo === "fixo" && gasto.overrides && gasto.overrides[mes] != null) {
    return gasto.overrides[mes];
  }
  return gasto.valor;
}

export const DADOS_VAZIOS = {
  cartoes: [],
  compras: [],
  gastos: [],
  pagos: {},
  salario: 0,
};

/* Limpeza automática (retenção de 3 meses), feita no carregamento:
   - compras totalmente quitadas há mais de 3 meses;
   - gastos momentâneos antigos;
   - entradas antigas de `pagos` e de `overrides`.
   Contas fixas nunca expiram. */
export function limparDadosAntigos(data) {
  if (!data) return DADOS_VAZIOS;

  const limite = addMeses(hojeMes(), -MESES_RETENCAO);

  const comprasValidas = (data.compras || []).filter((c) => {
    const ultimoMes = addMeses(c.primeiroMes, c.parcelas - 1);
    return diffMeses(ultimoMes, limite) >= 0;
  });

  const gastosValidos = (data.gastos || [])
    .filter((g) => g.tipo === "fixo" || diffMeses(g.mes, limite) >= 0)
    .map((g) =>
      g.overrides
        ? {
            ...g,
            overrides: Object.fromEntries(
              Object.entries(g.overrides).filter(([mes]) => diffMeses(mes, limite) >= 0)
            ),
          }
        : g
    );

  const pagosValidos = {};
  for (const [mes, ids] of Object.entries(data.pagos || {})) {
    if (diffMeses(mes, limite) >= 0) pagosValidos[mes] = ids;
  }

  return {
    cartoes: data.cartoes || [],
    compras: comprasValidas,
    gastos: gastosValidos,
    pagos: pagosValidos,
    salario: data.salario || 0,
  };
}
