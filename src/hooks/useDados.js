import { useEffect, useState } from "react";
import { loadData, saveData } from "../lib/storage";
import { limparDadosAntigos } from "../lib/regras";
import { diaValido } from "../lib/vencimentos";
import { centavos, uid } from "../lib/valores";
import { CORES_CARTAO } from "../cores";
import { CATEGORIA_PADRAO } from "../categorias";

/* Estado persistido do app + todas as ações que o modificam.
   Os componentes não mexem no formato dos dados diretamente:
   chamam estas ações. Assim, regras como arredondamento e
   validação ficam num lugar só.

   Cada ação que altera dados RETORNA o novo estado (ou null/false se
   a entrada era inválida). O App usa isso para o "Desfazer": guarda o
   estado de antes e o de depois da ação. */
export function useDados() {
  // Inicializador "preguiçoso": lê o localStorage só uma vez, no 1º render.
  const [dados, setDados] = useState(() => limparDadosAntigos(loadData()));

  // Salva a cada mudança (inclusive logo após a limpeza automática).
  useEffect(() => {
    saveData(dados);
  }, [dados]);

  const mudar = (novo) => {
    setDados(novo);
    return novo;
  };

  /* -------- montar objetos a partir do que veio do formulário --------
     Usado tanto para criar quanto para editar: a validação é a mesma. */

  const montarCartao = ({ nome, final, gradiente, diaVencimento, limite }) => {
    if (!nome.trim()) return null;
    const cartao = { nome: nome.trim(), final: final.trim() };
    if (Number.isInteger(gradiente)) cartao.gradiente = gradiente;
    const dia = diaValido(diaVencimento);
    if (dia) cartao.diaVencimento = dia;
    if (limite > 0) cartao.limite = centavos(limite);
    return cartao;
  };

  const montarCompra = ({ cartaoId, descricao, valor, parcelas, primeiroMes, categoria }) => {
    if (!descricao.trim() || !(valor > 0)) return null;
    // compra de um cartão que não existe ficaria "órfã" (invisível em todas as telas)
    if (!dados.cartoes.some((c) => c.id === cartaoId)) return null;
    return {
      cartaoId,
      descricao: descricao.trim(),
      valorTotal: centavos(valor),
      parcelas: Math.max(1, parseInt(parcelas) || 1),
      primeiroMes,
      categoria: categoria || CATEGORIA_PADRAO,
    };
  };

  const montarGasto = ({ descricao, valor, tipo, mes, categoria, diaVencimento }) => {
    if (!descricao.trim() || !(valor > 0)) return null;
    const gasto = {
      descricao: descricao.trim(),
      valor: centavos(valor),
      tipo,
      categoria: categoria || CATEGORIA_PADRAO,
    };
    if (tipo === "fixo") gasto.mesInicio = mes;
    else gasto.mes = mes;
    const dia = diaValido(diaVencimento);
    if (dia) gasto.diaVencimento = dia;
    return gasto;
  };

  /* -------- cartões -------- */
  const adicionarCartao = (campos) => {
    const base = montarCartao(campos);
    if (!base) return null;
    const novo = {
      id: uid(),
      gradiente: dados.cartoes.length % CORES_CARTAO.length, // índice da cor (nome herdado)
      ...base,
    };
    mudar({ ...dados, cartoes: [...dados.cartoes, novo] });
    return novo;
  };

  const editarCartao = (id, campos) => {
    const base = montarCartao(campos);
    if (!base) return null;
    return mudar({
      ...dados,
      // substitui os campos editáveis; id (e cor, se não veio) continuam
      cartoes: dados.cartoes.map((c) =>
        c.id === id ? { id: c.id, gradiente: c.gradiente, ...base } : c
      ),
    });
  };

  const removerCartao = (id) =>
    mudar({
      ...dados,
      cartoes: dados.cartoes.filter((c) => c.id !== id),
      compras: dados.compras.filter((c) => c.cartaoId !== id),
    });

  /* -------- compras -------- */
  const adicionarCompra = (campos) => {
    const base = montarCompra(campos);
    if (!base) return null;
    return mudar({ ...dados, compras: [...dados.compras, { id: uid(), ...base }] });
  };

  // Mantém o id: as marcações de "pago" continuam valendo
  const editarCompra = (id, campos) => {
    const base = montarCompra(campos);
    if (!base) return null;
    return mudar({
      ...dados,
      compras: dados.compras.map((c) => (c.id === id ? { id, ...base } : c)),
    });
  };

  const removerCompra = (id) =>
    mudar({ ...dados, compras: dados.compras.filter((c) => c.id !== id) });

  /* -------- contas (gastos gerais) -------- */
  const adicionarGasto = (campos) => {
    const base = montarGasto(campos);
    if (!base) return null;
    return mudar({ ...dados, gastos: [...dados.gastos, { id: uid(), ...base }] });
  };

  const editarGasto = (id, campos) => {
    const base = montarGasto(campos);
    if (!base) return null;
    return mudar({
      ...dados,
      gastos: dados.gastos.map((g) => {
        if (g.id !== id) return g;
        const editado = { id, ...base };
        // valores ajustados por mês só fazem sentido se continuar fixa
        if (base.tipo === "fixo" && g.overrides) editado.overrides = g.overrides;
        return editado;
      }),
    });
  };

  const removerGasto = (id) =>
    mudar({ ...dados, gastos: dados.gastos.filter((x) => x.id !== id) });

  // Valor de uma conta fixa só em um mês. Igual ao padrão (ou 0) remove o override.
  const salvarOverride = (gastoId, mes, v) =>
    mudar({
      ...dados,
      gastos: dados.gastos.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        if (v > 0 && v !== g.valor) overrides[mes] = centavos(v);
        else delete overrides[mes];
        return { ...g, overrides };
      }),
    });

  const removerOverride = (gastoId, mes) =>
    mudar({
      ...dados,
      gastos: dados.gastos.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        delete overrides[mes];
        return { ...g, overrides };
      }),
    });

  /* -------- pago (por mês) -------- */
  const togglePago = (mes, id) => {
    const lista = dados.pagos[mes] || [];
    const nova = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
    return mudar({ ...dados, pagos: { ...dados.pagos, [mes]: nova } });
  };

  // "Pagar tudo": marca vários itens de uma vez (sem desmarcar os já pagos)
  const marcarPagos = (mes, ids) => {
    const lista = dados.pagos[mes] || [];
    const nova = [...lista, ...ids.filter((id) => !lista.includes(id))];
    return mudar({ ...dados, pagos: { ...dados.pagos, [mes]: nova } });
  };

  /* -------- salário -------- */
  const definirSalario = (v) => (v >= 0 ? mudar({ ...dados, salario: centavos(v) }) : null);

  /* -------- backup e desfazer -------- */
  // Troca tudo pelos dados importados (já validados), aplicando a
  // mesma limpeza de retenção do carregamento.
  const substituirDados = (novos) => mudar(limparDadosAntigos(novos));

  // Volta a um estado anterior exato (usado pelo "Desfazer")
  const restaurar = (estadoAnterior) => mudar(estadoAnterior);

  return {
    dados,
    substituirDados,
    restaurar,
    adicionarCartao,
    editarCartao,
    removerCartao,
    adicionarCompra,
    editarCompra,
    removerCompra,
    adicionarGasto,
    editarGasto,
    removerGasto,
    salvarOverride,
    removerOverride,
    togglePago,
    marcarPagos,
    definirSalario,
  };
}
