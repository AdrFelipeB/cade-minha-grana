/* Análises derivadas dos dados (puras, sem React). */

import { addMeses, diffMeses, hojeMes } from "./meses";
import { contaDoMes, parcelaDoMes, valorDaConta } from "./regras";
import { calcularParcelas } from "./valores";

/* Quanto já está comprometido nos próximos meses, separado em
   parcelas de cartão e contas (fixas + avulsas já lançadas).
   Começa no mês seguinte ao atual. */
export function compromissosFuturos(compras, gastos, quantidade = 6) {
  const inicio = addMeses(hojeMes(), 1);
  return Array.from({ length: quantidade }, (_, i) => {
    const mes = addMeses(inicio, i);
    const cartoes = compras
      .map((c) => parcelaDoMes(c, mes))
      .filter(Boolean)
      .reduce((s, p) => s + p.valorParcela, 0);
    const contas = gastos
      .filter((g) => contaDoMes(g, mes))
      .reduce((s, g) => s + valorDaConta(g, mes), 0);
    return { mes, cartoes, contas, total: cartoes + contas };
  });
}

/* Total do mês por categoria, do maior para o menor (só categorias com gasto).
   `itens` = lista de { categoria, valor } (contas e parcelas do mês). */
export function totaisPorCategoria(itens, categoriaPadrao) {
  const mapa = new Map();
  for (const { categoria, valor } of itens) {
    const id = categoria || categoriaPadrao;
    mapa.set(id, (mapa.get(id) || 0) + valor);
  }
  return [...mapa.entries()]
    .map(([categoria, total]) => ({ categoria, total }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

/* Limite usado de um cartão: tudo o que ainda vai ser cobrado nele,
   ou seja, as parcelas do mês atual em diante — menos as do mês atual
   que já foram marcadas como pagas. (É assim que o banco "segura" o
   limite: a compra parcelada ocupa o valor total até ser paga.) */
export function limiteUsado(comprasDoCartao, idsPagosNoMesAtual = []) {
  const hoje = hojeMes();
  let usado = 0;
  for (const c of comprasDoCartao) {
    const valores = calcularParcelas(c.valorTotal, c.parcelas);
    valores.forEach((valor, i) => {
      const mes = addMeses(c.primeiroMes, i);
      const d = diffMeses(mes, hoje);
      if (d > 0 || (d === 0 && !idsPagosNoMesAtual.includes(c.id))) usado += valor;
    });
  }
  return usado;
}
