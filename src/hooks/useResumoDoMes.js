import { useMemo } from "react";
import { addMeses, hojeMes } from "../lib/meses";
import { contaDoMes, parcelaDoMes, valorDaConta } from "../lib/regras";

/* Tudo o que é *derivado* dos dados para o mês visualizado.
   Nada aqui é salvo: é recalculado quando dados ou mês mudam. */
export function useResumoDoMes({ cartoes, compras, gastos, pagos, salario }, mesAtual) {
  const parcelasDoMesPorCartao = useMemo(() => {
    const mapa = {};
    for (const cartao of cartoes) {
      const itens = compras
        .filter((c) => c.cartaoId === cartao.id)
        .map((c) => parcelaDoMes(c, mesAtual))
        .filter(Boolean);
      mapa[cartao.id] = {
        itens,
        subtotal: itens.reduce((s, p) => s + p.valorParcela, 0),
      };
    }
    return mapa;
  }, [cartoes, compras, mesAtual]);

  const totalCartoes = Object.values(parcelasDoMesPorCartao).reduce(
    (s, c) => s + c.subtotal,
    0
  );

  const gastosDoMes = useMemo(
    () =>
      gastos
        .filter((g) => contaDoMes(g, mesAtual))
        .map((g) => ({ ...g, valorNoMes: valorDaConta(g, mesAtual) })),
    [gastos, mesAtual]
  );

  const totalContas = gastosDoMes.reduce((s, g) => s + g.valorNoMes, 0);
  const totalGeral = totalCartoes + totalContas;

  const isPago = (id) => (pagos[mesAtual] || []).includes(id);

  // total já pago no mês (contas + parcelas)
  const totalPago = useMemo(() => {
    const idsPagos = pagos[mesAtual] || [];
    let soma = 0;
    for (const g of gastosDoMes) {
      if (idsPagos.includes(g.id)) soma += g.valorNoMes;
    }
    for (const dados of Object.values(parcelasDoMesPorCartao)) {
      for (const p of dados.itens) {
        if (idsPagos.includes(p.id)) soma += p.valorParcela;
      }
    }
    return soma;
  }, [pagos, mesAtual, gastosDoMes, parcelasDoMesPorCartao]);

  const totalRestante = totalGeral - totalPago;
  const sobra = salario - totalGeral;
  const pctComprometido =
    salario > 0 ? Math.min(100, (totalGeral / salario) * 100) : 0;

  return {
    parcelasDoMesPorCartao,
    gastosDoMes,
    totalCartoes,
    totalContas,
    totalGeral,
    totalPago,
    totalRestante,
    sobra,
    pctComprometido,
    isPago,
  };
}

/* Totais dos últimos 3 meses + atual (cartões + contas). */
export function useHistorico(compras, gastos) {
  return useMemo(() => {
    return [-3, -2, -1, 0]
      .map((n) => addMeses(hojeMes(), n))
      .map((mes) => {
        const tCartoes = compras
          .map((c) => parcelaDoMes(c, mes))
          .filter(Boolean)
          .reduce((s, p) => s + p.valorParcela, 0);
        const tContas = gastos
          .filter((g) => contaDoMes(g, mes))
          .reduce((s, g) => s + valorDaConta(g, mes), 0);
        return { mes, total: tCartoes + tContas };
      });
  }, [compras, gastos]);
}
