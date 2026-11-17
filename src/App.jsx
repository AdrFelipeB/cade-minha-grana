import { useCallback, useEffect, useMemo, useState } from "react";
import { useDados } from "./hooks/useDados";
import { useHistorico, useResumoDoMes } from "./hooks/useResumoDoMes";
import { QUERY_DESKTOP, useMediaQuery } from "./hooks/useMediaQuery";
import { compromissosFuturos, limiteUsado, totaisPorCategoria } from "./lib/analises";
import { precisaDeBackup } from "./lib/backup";
import { addMeses, diffMeses, hojeMes, labelMes } from "./lib/meses";
import { MESES_RETENCAO } from "./lib/regras";
import {
  lerPreferencia,
  lerUltimoBackup,
  registrarUltimoBackup,
  salvarPreferencia,
} from "./lib/storage";
import { definirModoDiscreto, parseValor, valorParaInput } from "./lib/valores";
import { CATEGORIA_PADRAO } from "./categorias";
import { CORES_CARTAO } from "./cores";
import SeletorMes from "./components/layout/SeletorMes";
import BarraNavegacao from "./components/layout/BarraNavegacao";
import BarraLateral from "./components/layout/BarraLateral";
import BotaoAdicionar from "./components/layout/BotaoAdicionar";
import BotaoDiscreto from "./components/layout/BotaoDiscreto";
import { TELAS } from "./components/layout/telas";
import Sheet from "./components/comum/Sheet";
import AvisoDesfazer from "./components/comum/AvisoDesfazer";
import EscolhaLancamento from "./components/EscolhaLancamento";
import TelaResumo from "./components/resumo/TelaResumo";
import ResumoDesktop from "./components/resumo/ResumoDesktop";
import TelaContas from "./components/contas/TelaContas";
import FormConta from "./components/contas/FormConta";
import TelaCartoes from "./components/cartoes/TelaCartoes";
import CartoesDesktop from "./components/cartoes/CartoesDesktop";
import DetalheCartao from "./components/cartoes/DetalheCartao";
import FormCompra from "./components/cartoes/FormCompra";
import FormCartao from "./components/cartoes/FormCartao";
import TelaAjustes from "./components/ajustes/TelaAjustes";

const TITULOS_TELA = { resumo: "Resumo", contas: "Contas", cartoes: "Cartões", ajustes: "Ajustes" };

const FORM_CARTAO_VAZIO = { nome: "", final: "", gradiente: null, diaVencimento: "", limite: "" };
const formCompraVazio = (mes, cartaoId = "") => ({
  cartaoId,
  descricao: "",
  valor: "",
  parcelas: 1,
  mes,
  categoria: CATEGORIA_PADRAO,
});
const formGastoVazio = (mes) => ({
  descricao: "",
  valor: "",
  tipo: "fixo",
  mes,
  categoria: CATEGORIA_PADRAO,
  diaVencimento: "",
});

const TITULOS_SHEET = {
  escolha: "O que você quer lançar?",
  compra: "Nova compra",
  conta: "Nova conta",
  cartao: "Novo cartão",
};
const TITULOS_EDICAO = { compra: "Editar compra", conta: "Editar conta", cartao: "Editar cartão" };

/* O App guarda o estado de *interface* (tela, mês, painel aberto, rascunhos
   dos formulários, edições em andamento, aviso de desfazer) e repassa para
   as telas. Os *dados* ficam no hook useDados. */
export default function App() {
  const {
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
  } = useDados();
  const { cartoes, compras, gastos } = dados;

  // Navegação
  const [tela, setTela] = useState("resumo"); // "resumo" | "contas" | "cartoes" | "ajustes"
  const [cartaoAberto, setCartaoAberto] = useState(null); // id do cartão no detalhe
  const [mesAtual, setMesAtual] = useState(hojeMes);
  const [focarSalario, setFocarSalario] = useState(false);

  // Painel (sheet), rascunhos de criação e edição
  const [sheet, setSheet] = useState(null); // null | "escolha" | "compra" | "conta" | "cartao"
  const [formCartao, setFormCartao] = useState(FORM_CARTAO_VAZIO);
  const [formCompra, setFormCompra] = useState(() => formCompraVazio(hojeMes()));
  const [formGasto, setFormGasto] = useState(() => formGastoVazio(hojeMes()));
  // Edição de um item existente: { tipo: "compra" | "conta" | "cartao", id, valores }
  // (estado separado dos rascunhos de criação, para um não apagar o outro)
  const [edicao, setEdicao] = useState(null);
  const [edicaoOverride, setEdicaoOverride] = useState(null); // { id, valor } | null

  // Desfazer: { mensagem, antes, depois }. O aviso só aparece enquanto os
  // dados atuais ainda forem exatamente o "depois" — se qualquer outra coisa
  // mudou, desfazer apagaria essa mudança também, então o aviso some.
  const [desfazer, setDesfazer] = useState(null);
  const avisoDesfazer = desfazer && desfazer.depois === dados ? desfazer : null;
  const fecharAviso = useCallback(() => setDesfazer(null), []);

  // Backup
  const [ultimoBackup, setUltimoBackup] = useState(lerUltimoBackup);
  const lembrarBackup = precisaDeBackup(dados, ultimoBackup);

  // Modo discreto (lembrado entre visitas)
  const [discreto, setDiscreto] = useState(() => {
    const ligado = lerPreferencia("discreto") === "1";
    definirModoDiscreto(ligado);
    return ligado;
  });

  // Layout: celular (barra embaixo) ou desktop (menu lateral, várias colunas)
  const desktop = useMediaQuery(QUERY_DESKTOP);

  /* -------- dados derivados -------- */
  const mesMinimo = addMeses(hojeMes(), -MESES_RETENCAO);
  const nomeMes = labelMes(mesAtual).split(" ")[0];
  const resumo = useResumoDoMes(dados, mesAtual);
  const historico = useHistorico(compras, gastos);
  const compromissos = useMemo(() => compromissosFuturos(compras, gastos), [compras, gastos]);
  const totaisCategoria = useMemo(
    () =>
      totaisPorCategoria(
        [
          ...resumo.gastosDoMes.map((g) => ({ categoria: g.categoria, valor: g.valorNoMes })),
          ...Object.values(resumo.parcelasDoMesPorCartao).flatMap((d) =>
            d.itens.map((p) => ({ categoria: p.categoria, valor: p.valorParcela }))
          ),
        ],
        CATEGORIA_PADRAO
      ),
    [resumo.gastosDoMes, resumo.parcelasDoMesPorCartao]
  );

  // No celular, o detalhe só aparece se um cartão foi aberto; no desktop
  // a fatura fica sempre ao lado da lista, então o 1º cartão é o padrão.
  const cartaoAtivo =
    tela !== "cartoes"
      ? null
      : cartoes.find((c) => c.id === cartaoAberto) ?? (desktop ? cartoes[0] ?? null : null);
  const limiteUsadoAtivo = cartaoAtivo
    ? limiteUsado(
        compras.filter((c) => c.cartaoId === cartaoAtivo.id),
        dados.pagos[hojeMes()]
      )
    : 0;

  /* -------- navegação -------- */
  const navegar = (novaTela) => {
    setTela(novaTela);
    setCartaoAberto(null);
    setEdicaoOverride(null);
    setFocarSalario(false);
    window.scrollTo(0, 0);
  };

  const abrirCartao = (id) => {
    setTela("cartoes");
    setCartaoAberto(id);
    setEdicaoOverride(null);
    window.scrollTo(0, 0);
  };

  // Trocar de mês cancela a edição de valor em andamento; senão o OK
  // salvaria o override no mês novo em vez do mês em que você começou.
  const mudarMes = (mes) => {
    setMesAtual(mes);
    setEdicaoOverride(null);
    // Rascunhos acompanham o mês visto (importa no desktop, onde o
    // formulário de conta fica sempre aberto ao lado da lista)
    setFormGasto((f) => ({ ...f, mes }));
    setFormCompra((f) => ({ ...f, mes }));
  };

  const alternarDiscreto = () => {
    const ligado = !discreto;
    definirModoDiscreto(ligado); // antes do setState: o próximo render já sai escondido
    salvarPreferencia("discreto", ligado ? "1" : "0");
    setDiscreto(ligado);
  };

  /* -------- abrir painéis de criação -------- */
  const abrirNovoCartao = () => {
    // pré-seleciona a próxima cor da paleta (dá para trocar no formulário)
    setFormCartao((f) => ({ ...f, gradiente: f.gradiente ?? cartoes.length % CORES_CARTAO.length }));
    setSheet("cartao");
  };

  const abrirNovaCompra = (cartaoId) => {
    if (cartoes.length === 0) return abrirNovoCartao();
    const existe = (id) => cartoes.some((c) => c.id === id);
    const id = existe(cartaoId) ? cartaoId : existe(formCompra.cartaoId) ? formCompra.cartaoId : cartoes[0].id;
    setFormCompra({ ...formCompra, cartaoId: id, mes: mesAtual });
    setSheet("compra");
  };

  const abrirNovaConta = () => {
    setFormGasto({ ...formGasto, mes: mesAtual });
    setSheet("conta");
  };

  // O "+" (e o botão do menu lateral) faz o que faz sentido para a tela atual
  const adicionar = () => {
    if (tela === "contas") abrirNovaConta();
    else if (cartaoAtivo) abrirNovaCompra(cartaoAtivo.id);
    else setSheet("escolha");
  };
  const rotuloAdicionar =
    tela === "contas" ? "Nova conta" : cartaoAtivo ? "Nova compra" : "Novo lançamento";

  /* -------- salvar novos (retornam true/false para o form mostrar erro) -------- */
  const salvarCartao = () => {
    const novo = adicionarCartao({ ...formCartao, limite: parseValor(formCartao.limite) });
    if (!novo) return false;
    setFormCartao(FORM_CARTAO_VAZIO);
    setSheet(null);
    abrirCartao(novo.id);
    return true;
  };

  const salvarCompra = () => {
    const ok = adicionarCompra({
      ...formCompra,
      valor: parseValor(formCompra.valor),
      primeiroMes: formCompra.mes,
    });
    if (ok) {
      setFormCompra(formCompraVazio(mesAtual, formCompra.cartaoId));
      setSheet(null);
    }
    return !!ok;
  };

  const salvarGasto = () => {
    const ok = adicionarGasto({ ...formGasto, valor: parseValor(formGasto.valor) });
    if (ok) {
      setFormGasto(formGastoVazio(mesAtual));
      setSheet(null);
    }
    return !!ok;
  };

  /* -------- editar e excluir -------- */
  const abrirEdicaoCompra = (id) => {
    const c = compras.find((x) => x.id === id);
    if (!c) return;
    setEdicao({
      tipo: "compra",
      id,
      valores: {
        cartaoId: c.cartaoId,
        descricao: c.descricao,
        valor: valorParaInput(c.valorTotal),
        parcelas: c.parcelas,
        mes: c.primeiroMes,
        categoria: c.categoria || CATEGORIA_PADRAO,
      },
    });
  };

  const abrirEdicaoConta = (id) => {
    const g = gastos.find((x) => x.id === id);
    if (!g) return;
    setEdicaoOverride(null);
    setEdicao({
      tipo: "conta",
      id,
      valores: {
        descricao: g.descricao,
        valor: valorParaInput(g.valor),
        tipo: g.tipo,
        mes: g.tipo === "fixo" ? g.mesInicio : g.mes,
        categoria: g.categoria || CATEGORIA_PADRAO,
        diaVencimento: g.diaVencimento ? String(g.diaVencimento) : "",
      },
    });
  };

  const abrirEdicaoCartao = (id) => {
    const c = cartoes.find((x) => x.id === id);
    if (!c) return;
    setEdicao({
      tipo: "cartao",
      id,
      valores: {
        nome: c.nome,
        final: c.final || "",
        gradiente: c.gradiente ?? 0,
        diaVencimento: c.diaVencimento ? String(c.diaVencimento) : "",
        limite: c.limite ? valorParaInput(c.limite) : "",
      },
    });
  };

  const salvarEdicao = () => {
    const { tipo, id, valores: v } = edicao;
    let ok = null;
    if (tipo === "compra") ok = editarCompra(id, { ...v, valor: parseValor(v.valor), primeiroMes: v.mes });
    if (tipo === "conta") ok = editarGasto(id, { ...v, valor: parseValor(v.valor) });
    if (tipo === "cartao") ok = editarCartao(id, { ...v, limite: parseValor(v.limite) });
    if (ok) setEdicao(null);
    return !!ok;
  };

  // Exclui na hora e oferece "Desfazer" (sem janela de confirmação)
  const excluirEdicao = () => {
    const { tipo, id } = edicao;
    const antes = dados;
    let depois = null;
    let mensagem = "";
    if (tipo === "compra") {
      const c = compras.find((x) => x.id === id);
      depois = removerCompra(id);
      mensagem = `Compra “${c?.descricao}” excluída`;
    }
    if (tipo === "conta") {
      const g = gastos.find((x) => x.id === id);
      depois = removerGasto(id);
      mensagem = `Conta “${g?.descricao}” excluída`;
    }
    if (tipo === "cartao") {
      const c = cartoes.find((x) => x.id === id);
      depois = removerCartao(id);
      setCartaoAberto(null);
      mensagem = `Cartão “${c?.nome}” excluído`;
    }
    setEdicao(null);
    setDesfazer({ mensagem, antes, depois });
  };

  const qtdComprasDoCartaoEditado =
    edicao?.tipo === "cartao" ? compras.filter((c) => c.cartaoId === edicao.id).length : 0;

  /* -------- pagar -------- */
  const togglePagoNoMes = (id) => togglePago(mesAtual, id);

  // "Pagar tudo" (fatura, contas ou o mês inteiro), com "Desfazer"
  const pagarVarios = (ids, mensagem) => {
    const antes = dados;
    const depois = marcarPagos(mesAtual, ids);
    setDesfazer({ mensagem, antes, depois });
  };

  /* -------- valor de conta fixa só neste mês -------- */
  const confirmarOverride = (gastoId) => {
    salvarOverride(gastoId, mesAtual, parseValor(edicaoOverride?.valor ?? ""));
    setEdicaoOverride(null);
  };

  const voltarAoPadrao = (gastoId) => {
    removerOverride(gastoId, mesAtual);
    setEdicaoOverride(null);
  };

  /* -------- backup -------- */
  const backupExportado = (iso) => {
    registrarUltimoBackup(iso);
    setUltimoBackup(iso);
  };

  // Depois de restaurar, volta ao resumo do mês atual e fecha o que estiver aberto
  const importarBackup = (novos) => {
    substituirDados(novos);
    setMesAtual(hojeMes());
    setSheet(null);
    setEdicao(null);
    setDesfazer(null);
    navegar("resumo");
  };

  /* -------- atalhos de teclado (só desktop) --------
     N = novo lançamento · ← → = mês · 1–4 = telas · O = ocultar valores.
     Ignorados enquanto se digita num campo ou com um painel aberto. */
  useEffect(() => {
    if (!desktop) return;
    const aoTeclar = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      if (e.target.closest?.("input, select, textarea, [contenteditable]")) return;
      if (document.querySelector("dialog[open]")) return;
      const tecla = e.key.toLowerCase();
      if (tecla === "n") {
        e.preventDefault();
        adicionar();
      } else if (tecla === "o") {
        alternarDiscreto();
      } else if (e.key === "ArrowLeft" && tela !== "ajustes") {
        if (diffMeses(mesAtual, mesMinimo) > 0) mudarMes(addMeses(mesAtual, -1));
      } else if (e.key === "ArrowRight" && tela !== "ajustes") {
        mudarMes(addMeses(mesAtual, 1));
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        navegar(TELAS[Number(e.key) - 1].id);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }); // sem lista de dependências: re-registra a cada render, sempre com os valores atuais

  /* ============================ RENDER ============================ */

  // Props comuns às versões celular e desktop do Resumo
  const propsResumo = {
    mesAtual,
    cartoes,
    salario: dados.salario,
    resumo,
    historico,
    compromissos,
    totaisCategoria,
    onAbrirContas: () => navegar("contas"),
    onAbrirCartao: abrirCartao,
    onAdicionar: () => setSheet("escolha"),
    onDefinirSalario: () => {
      navegar("ajustes");
      setFocarSalario(true);
    },
    onSelecionarMes: mudarMes,
    onTogglePago: togglePagoNoMes,
    onPagarTudo: (ids) => pagarVarios(ids, `Tudo de ${nomeMes} marcado como pago`),
  };

  const propsDetalheCartao = cartaoAtivo && {
    cartao: cartaoAtivo,
    mesAtual,
    resumo,
    limiteUsado: limiteUsadoAtivo,
    onNovaCompra: () => abrirNovaCompra(cartaoAtivo.id),
    onEditarCartao: () => abrirEdicaoCartao(cartaoAtivo.id),
    onTogglePago: togglePagoNoMes,
    onPagarFatura: (ids) => pagarVarios(ids, `Fatura do ${cartaoAtivo.nome} marcada como paga`),
    onEditarCompra: abrirEdicaoCompra,
  };

  const conteudo = (
    <>
      {tela === "resumo" &&
        (desktop ? (
          <ResumoDesktop {...propsResumo} />
        ) : (
          <TelaResumo {...propsResumo} discreto={discreto} onAlternarDiscreto={alternarDiscreto} />
        ))}

      {tela === "contas" && (
        <TelaContas
          desktop={desktop}
          mesAtual={mesAtual}
          resumo={resumo}
          form={formGasto}
          onFormChange={setFormGasto}
          onSalvarForm={salvarGasto}
          edicaoOverride={edicaoOverride}
          onEdicaoOverrideChange={setEdicaoOverride}
          onSalvarOverride={confirmarOverride}
          onRemoverOverride={voltarAoPadrao}
          onTogglePago={togglePagoNoMes}
          onPagarTodas={(ids) => pagarVarios(ids, `Contas de ${nomeMes} marcadas como pagas`)}
          onEditar={abrirEdicaoConta}
          onAdicionar={abrirNovaConta}
        />
      )}

      {tela === "cartoes" && desktop && (
        <CartoesDesktop
          cartoes={cartoes}
          cartaoSelecionado={cartaoAtivo}
          onSelecionar={setCartaoAberto}
          onNovoCartao={abrirNovoCartao}
          {...(propsDetalheCartao || { mesAtual, resumo })}
        />
      )}

      {tela === "cartoes" &&
        !desktop &&
        (cartaoAtivo ? (
          <DetalheCartao {...propsDetalheCartao} onVoltar={() => setCartaoAberto(null)} />
        ) : (
          <TelaCartoes
            cartoes={cartoes}
            resumo={resumo}
            onAbrirCartao={abrirCartao}
            onNovoCartao={abrirNovoCartao}
          />
        ))}

      {tela === "ajustes" && (
        <TelaAjustes
          desktop={desktop}
          dados={dados}
          focarSalario={focarSalario}
          onSalvarSalario={definirSalario}
          ultimoBackup={ultimoBackup}
          precisaBackup={lembrarBackup}
          onExportado={backupExportado}
          onImportar={importarBackup}
        />
      )}
    </>
  );

  const seletorMes = tela !== "ajustes" && (
    <SeletorMes mesAtual={mesAtual} mesMinimo={mesMinimo} onChange={mudarMes} />
  );

  // Formulário do painel: edição tem prioridade sobre criação
  let conteudoSheet = null;
  if (edicao?.tipo === "compra") {
    conteudoSheet = (
      <FormCompra
        valores={edicao.valores}
        cartoes={cartoes}
        onChange={(valores) => setEdicao({ ...edicao, valores })}
        onSalvar={salvarEdicao}
        onExcluir={excluirEdicao}
      />
    );
  } else if (edicao?.tipo === "conta") {
    conteudoSheet = (
      <FormConta
        valores={edicao.valores}
        onChange={(valores) => setEdicao({ ...edicao, valores })}
        onSalvar={salvarEdicao}
        onExcluir={excluirEdicao}
      />
    );
  } else if (edicao?.tipo === "cartao") {
    conteudoSheet = (
      <FormCartao
        valores={edicao.valores}
        onChange={(valores) => setEdicao({ ...edicao, valores })}
        onSalvar={salvarEdicao}
        onExcluir={excluirEdicao}
        textoExcluir={
          qtdComprasDoCartaoEditado > 0
            ? `Excluir cartão e suas ${qtdComprasDoCartaoEditado} compra(s)`
            : "Excluir cartão"
        }
      />
    );
  } else if (sheet === "escolha") {
    conteudoSheet = (
      <EscolhaLancamento
        temCartao={cartoes.length > 0}
        onCompra={() => abrirNovaCompra(null)}
        onConta={abrirNovaConta}
      />
    );
  } else if (sheet === "compra") {
    conteudoSheet = (
      <FormCompra valores={formCompra} cartoes={cartoes} onChange={setFormCompra} onSalvar={salvarCompra} />
    );
  } else if (sheet === "conta") {
    conteudoSheet = <FormConta valores={formGasto} onChange={setFormGasto} onSalvar={salvarGasto} />;
  } else if (sheet === "cartao") {
    conteudoSheet = <FormCartao valores={formCartao} onChange={setFormCartao} onSalvar={salvarCartao} />;
  }

  return (
    <>
      {desktop ? (
        <div className="layout-desktop">
          <BarraLateral
            tela={tela}
            onChange={navegar}
            alertaAjustes={lembrarBackup}
            onAdicionar={adicionar}
            rotuloAdicionar={rotuloAdicionar}
          />
          <main className="conteudo">
            <header className="barra-topo">
              <h1>{TITULOS_TELA[tela]}</h1>
              <div className="barra-topo__acoes">
                <BotaoDiscreto ligado={discreto} onAlternar={alternarDiscreto} />
                {seletorMes}
              </div>
            </header>
            {conteudo}
          </main>
        </div>
      ) : (
        <>
          <main className="app">
            {seletorMes}
            {conteudo}
          </main>
          {tela !== "ajustes" && <BotaoAdicionar onClick={adicionar} rotulo={rotuloAdicionar} />}
          <BarraNavegacao tela={tela} onChange={navegar} alertaAjustes={lembrarBackup} />
        </>
      )}

      <Sheet
        aberto={edicao !== null || sheet !== null}
        onFechar={() => {
          setSheet(null);
          setEdicao(null);
        }}
        titulo={edicao ? TITULOS_EDICAO[edicao.tipo] : TITULOS_SHEET[sheet]}
      >
        {conteudoSheet}
      </Sheet>

      <AvisoDesfazer
        aviso={avisoDesfazer}
        onDesfazer={() => {
          if (avisoDesfazer) restaurar(avisoDesfazer.antes);
          setDesfazer(null);
        }}
        onFechar={fecharAviso}
      />
    </>
  );
}
