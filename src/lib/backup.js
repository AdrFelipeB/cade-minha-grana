/* ============================================================
   BACKUP EM JSON
   ------------------------------------------------------------
   O localStorage não sincroniza entre aparelhos e é apagado ao
   limpar os dados do navegador. O backup é a forma de o usuário
   levar/guardar os dados — sem servidor nenhum.

   Formato do arquivo:
   {
     "app": "meus-gastos",
     "versao": 1,
     "exportadoEm": "2026-11-16T12:00:00.000Z",
     "dados": { cartoes, compras, gastos, pagos, salario }
   }

   Na importação, NADA é confiado: o arquivo pode estar corrompido,
   ser de outro app ou ter sido editado à mão. Por isso validamos
   campo a campo e montamos um objeto novo só com o que conhecemos.
   ============================================================ */

import { VERSAO_DADOS } from "./storage";

export const APP_ID = "meus-gastos";
export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB: muito acima de qualquer uso real

const MES_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const ehTexto = (v) => typeof v === "string";
const ehNumero = (v) => typeof v === "number" && Number.isFinite(v);
const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const ehMes = (v) => ehTexto(v) && MES_RE.test(v);

class BackupInvalido extends Error {}

function exigir(condicao, mensagem) {
  if (!condicao) throw new BackupInvalido(mensagem);
}

/* -------- exportar -------- */

const dataLocalISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function gerarBackup({ cartoes, compras, gastos, pagos, salario }) {
  const backup = {
    app: APP_ID,
    versao: VERSAO_DADOS,
    exportadoEm: new Date().toISOString(),
    dados: { cartoes, compras, gastos, pagos, salario },
  };
  return {
    nomeArquivo: `meus-gastos-backup-${dataLocalISO()}.json`,
    conteudo: JSON.stringify(backup, null, 2),
  };
}

/* -------- importar -------- */

function validarCartoes(lista, qtdGradientes) {
  exigir(Array.isArray(lista), "a lista de cartões está ausente ou inválida.");
  return lista.map((c, i) => {
    exigir(ehObjeto(c) && ehTexto(c.id) && ehTexto(c.nome) && c.nome.trim(),
      `o cartão nº ${i + 1} está incompleto.`);
    const gradienteOk = Number.isInteger(c.gradiente) && c.gradiente >= 0 && c.gradiente < qtdGradientes;
    return {
      id: c.id,
      nome: c.nome,
      final: ehTexto(c.final) ? c.final.replace(/\D/g, "").slice(0, 4) : "",
      gradiente: gradienteOk ? c.gradiente : i % qtdGradientes,
    };
  });
}

function validarCompras(lista, idsCartoes) {
  exigir(Array.isArray(lista), "a lista de compras está ausente ou inválida.");
  return lista.map((c, i) => {
    const ok =
      ehObjeto(c) &&
      ehTexto(c.id) &&
      ehTexto(c.descricao) &&
      ehNumero(c.valorTotal) && c.valorTotal > 0 &&
      Number.isInteger(c.parcelas) && c.parcelas >= 1 &&
      ehMes(c.primeiroMes);
    exigir(ok, `a compra nº ${i + 1} está incompleta ou com valores inválidos.`);
    exigir(idsCartoes.has(c.cartaoId),
      `a compra "${c.descricao}" pertence a um cartão que não está no backup.`);
    return {
      id: c.id,
      cartaoId: c.cartaoId,
      descricao: c.descricao,
      valorTotal: c.valorTotal,
      parcelas: c.parcelas,
      primeiroMes: c.primeiroMes,
    };
  });
}

function validarGastos(lista) {
  exigir(Array.isArray(lista), "a lista de contas está ausente ou inválida.");
  return lista.map((g, i) => {
    const base =
      ehObjeto(g) && ehTexto(g.id) && ehTexto(g.descricao) && ehNumero(g.valor) && g.valor > 0;
    exigir(base, `a conta nº ${i + 1} está incompleta ou com valor inválido.`);

    if (g.tipo === "momentaneo") {
      exigir(ehMes(g.mes), `a conta "${g.descricao}" está sem mês válido.`);
      return { id: g.id, descricao: g.descricao, valor: g.valor, tipo: "momentaneo", mes: g.mes };
    }

    exigir(g.tipo === "fixo", `a conta "${g.descricao}" tem um tipo desconhecido.`);
    exigir(ehMes(g.mesInicio), `a conta "${g.descricao}" está sem mês de início válido.`);
    const conta = { id: g.id, descricao: g.descricao, valor: g.valor, tipo: "fixo", mesInicio: g.mesInicio };
    if (g.overrides != null) {
      exigir(ehObjeto(g.overrides), `os valores por mês de "${g.descricao}" estão inválidos.`);
      // descarta silenciosamente entradas que não são "YYYY-MM": número
      conta.overrides = Object.fromEntries(
        Object.entries(g.overrides).filter(([mes, v]) => ehMes(mes) && ehNumero(v) && v > 0)
      );
    }
    return conta;
  });
}

function validarPagos(pagos) {
  if (pagos == null) return {};
  exigir(ehObjeto(pagos), "a lista de itens pagos está inválida.");
  const resultado = {};
  for (const [mes, ids] of Object.entries(pagos)) {
    if (ehMes(mes) && Array.isArray(ids)) resultado[mes] = ids.filter(ehTexto);
  }
  return resultado;
}

/* Lê o texto de um arquivo de backup. Retorna { dados, exportadoEm }
   ou lança um Error com mensagem em português para mostrar ao usuário. */
export function lerBackup(texto, { qtdGradientes }) {
  let obj;
  try {
    obj = JSON.parse(texto);
  } catch {
    throw new Error("Esse arquivo não é um backup válido (não é um JSON).");
  }

  try {
    exigir(ehObjeto(obj), "formato não reconhecido.");

    // Aceita o arquivo exportado pelo app ou o conteúdo cru do localStorage.
    const embrulhado = obj.app === APP_ID && ehObjeto(obj.dados);
    const dados = embrulhado ? obj.dados : obj;
    exigir(Array.isArray(dados.cartoes) || Array.isArray(dados.gastos),
      "não parece ser um backup do Meus Gastos.");

    const versao = (embrulhado ? obj.versao : dados.versao) ?? 1;
    exigir(Number.isInteger(versao) && versao >= 1, "a versão do backup é inválida.");
    if (versao > VERSAO_DADOS) {
      throw new Error(
        "Este backup foi feito por uma versão mais nova do app. Recarregue a página e tente de novo."
      );
    }

    const cartoes = validarCartoes(dados.cartoes ?? [], qtdGradientes);
    const compras = validarCompras(dados.compras ?? [], new Set(cartoes.map((c) => c.id)));
    const gastos = validarGastos(dados.gastos ?? []);
    const pagos = validarPagos(dados.pagos);
    const salario = dados.salario ?? 0;
    exigir(ehNumero(salario) && salario >= 0, "o salário está inválido.");

    const exportadoEm =
      embrulhado && ehTexto(obj.exportadoEm) && !isNaN(Date.parse(obj.exportadoEm))
        ? obj.exportadoEm
        : null;

    return { dados: { cartoes, compras, gastos, pagos, salario }, exportadoEm };
  } catch (e) {
    if (e instanceof BackupInvalido) throw new Error(`Backup inválido: ${e.message}`);
    throw e;
  }
}

/* Faz o navegador baixar um arquivo gerado na hora (sem servidor):
   cria um Blob, uma URL temporária para ele e clica num <a download>. */
export function baixarArquivo(nome, conteudo, tipo = "application/json") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
