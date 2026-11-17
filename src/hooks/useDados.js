import { useEffect, useState } from "react";
import { loadData, saveData } from "../lib/storage";
import { limparDadosAntigos } from "../lib/regras";
import { centavos, uid } from "../lib/valores";
import { GRADIENTES_CARTAO } from "../theme";

/* Estado persistido do app + todas as ações que o modificam.
   Os componentes não mexem no formato dos dados diretamente:
   chamam estas ações. Assim, regras como arredondamento e
   validação ficam num lugar só. */
export function useDados() {
  // Inicializador "preguiçoso": lê o localStorage só uma vez, no 1º render.
  const [dados, setDados] = useState(() => limparDadosAntigos(loadData()));

  // Salva a cada mudança (inclusive logo após a limpeza automática).
  useEffect(() => {
    saveData(dados);
  }, [dados]);

  // Atualiza um campo usando o valor mais recente (update funcional)
  const atualizar = (campo, fn) =>
    setDados((d) => ({ ...d, [campo]: fn(d[campo]) }));

  /* -------- cartões -------- */
  const adicionarCartao = ({ nome, final }) => {
    if (!nome.trim()) return null;
    const novo = {
      id: uid(),
      nome: nome.trim(),
      final: final.trim(),
      gradiente: dados.cartoes.length % GRADIENTES_CARTAO.length,
    };
    atualizar("cartoes", (l) => [...l, novo]);
    return novo;
  };

  const removerCartao = (id) => {
    setDados((d) => ({
      ...d,
      cartoes: d.cartoes.filter((c) => c.id !== id),
      compras: d.compras.filter((c) => c.cartaoId !== id),
    }));
  };

  /* -------- compras -------- */
  const adicionarCompra = ({ cartaoId, descricao, valor, parcelas, primeiroMes }) => {
    if (!descricao.trim() || valor <= 0) return false;
    atualizar("compras", (l) => [
      ...l,
      {
        id: uid(),
        cartaoId,
        descricao: descricao.trim(),
        valorTotal: centavos(valor),
        parcelas: Math.max(1, parseInt(parcelas) || 1),
        primeiroMes,
      },
    ]);
    return true;
  };

  const removerCompra = (id) =>
    atualizar("compras", (l) => l.filter((c) => c.id !== id));

  /* -------- contas (gastos gerais) -------- */
  const adicionarGasto = ({ descricao, valor, tipo, mes }) => {
    if (!descricao.trim() || valor <= 0) return false;
    const novo = {
      id: uid(),
      descricao: descricao.trim(),
      valor: centavos(valor),
      tipo,
    };
    if (tipo === "fixo") novo.mesInicio = mes;
    else novo.mes = mes;
    atualizar("gastos", (l) => [...l, novo]);
    return true;
  };

  const removerGasto = (id) =>
    atualizar("gastos", (l) => l.filter((x) => x.id !== id));

  // Valor de uma conta fixa só em um mês. Igual ao padrão (ou 0) remove o override.
  const salvarOverride = (gastoId, mes, v) =>
    atualizar("gastos", (l) =>
      l.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        if (v > 0 && v !== g.valor) overrides[mes] = centavos(v);
        else delete overrides[mes];
        return { ...g, overrides };
      })
    );

  const removerOverride = (gastoId, mes) =>
    atualizar("gastos", (l) =>
      l.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        delete overrides[mes];
        return { ...g, overrides };
      })
    );

  /* -------- pago (por mês) -------- */
  const togglePago = (mes, id) =>
    atualizar("pagos", (pagos) => {
      const lista = pagos[mes] || [];
      const nova = lista.includes(id)
        ? lista.filter((x) => x !== id)
        : [...lista, id];
      return { ...pagos, [mes]: nova };
    });

  /* -------- salário -------- */
  const definirSalario = (v) => {
    if (v >= 0) atualizar("salario", () => centavos(v));
  };

  return {
    dados,
    adicionarCartao,
    removerCartao,
    adicionarCompra,
    removerCompra,
    adicionarGasto,
    removerGasto,
    salvarOverride,
    removerOverride,
    togglePago,
    definirSalario,
  };
}
