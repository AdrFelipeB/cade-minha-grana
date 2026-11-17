import { useState } from "react";
import { useDados } from "./hooks/useDados";
import { useHistorico, useResumoDoMes } from "./hooks/useResumoDoMes";
import { precisaDeBackup } from "./lib/backup";
import { addMeses, hojeMes } from "./lib/meses";
import { MESES_RETENCAO } from "./lib/regras";
import { lerUltimoBackup, registrarUltimoBackup } from "./lib/storage";
import { parseValor } from "./lib/valores";
import SeletorMes from "./components/layout/SeletorMes";
import BarraNavegacao from "./components/layout/BarraNavegacao";
import BotaoAdicionar from "./components/layout/BotaoAdicionar";
import Sheet from "./components/comum/Sheet";
import EscolhaLancamento from "./components/EscolhaLancamento";
import TelaResumo from "./components/resumo/TelaResumo";
import TelaContas from "./components/contas/TelaContas";
import FormConta from "./components/contas/FormConta";
import TelaCartoes from "./components/cartoes/TelaCartoes";
import DetalheCartao from "./components/cartoes/DetalheCartao";
import FormCompra from "./components/cartoes/FormCompra";
import FormCartao from "./components/cartoes/FormCartao";
import TelaAjustes from "./components/ajustes/TelaAjustes";
import BarraLateral from "./components/layout/BarraLateral";
import ResumoDesktop from "./components/resumo/ResumoDesktop";
import CartoesDesktop from "./components/cartoes/CartoesDesktop";
import { QUERY_DESKTOP, useMediaQuery } from "./hooks/useMediaQuery";

const TITULOS_TELA = { resumo: "Resumo", contas: "Contas", cartoes: "Cartões", ajustes: "Ajustes" };

const FORM_CARTAO_VAZIO = { nome: "", final: "" };
const formCompraVazio = (mes, cartaoId = "") => ({ cartaoId, descricao: "", valor: "", parcelas: 1, mes });
const formGastoVazio = (mes) => ({ descricao: "", valor: "", tipo: "fixo", mes });

const TITULOS_SHEET = {
  escolha: "O que você quer lançar?",
  compra: "Nova compra",
  conta: "Nova conta",
  cartao: "Novo cartão",
};

/* O App guarda o estado de *interface* (tela, mês, painel aberto, rascunhos
   dos formulários, edições em andamento) e repassa para as telas.
   Os *dados* ficam no hook useDados. Os rascunhos dos formulários moram
   aqui para sobreviverem a fechar o painel sem salvar. */
export default function App() {
  const {
    dados,
    substituirDados,
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
  } = useDados();
  const { cartoes, compras, gastos } = dados;

  // Navegação
  const [tela, setTela] = useState("resumo"); // "resumo" | "contas" | "cartoes" | "ajustes"
  const [cartaoAberto, setCartaoAberto] = useState(null); // id do cartão no detalhe
  const [mesAtual, setMesAtual] = useState(hojeMes);
  const [focarSalario, setFocarSalario] = useState(false);

  // Painel (sheet) e rascunhos
  const [sheet, setSheet] = useState(null); // null | "escolha" | "compra" | "conta" | "cartao"
  const [formCartao, setFormCartao] = useState(FORM_CARTAO_VAZIO);
  const [formCompra, setFormCompra] = useState(() => formCompraVazio(hojeMes()));
  const [formGasto, setFormGasto] = useState(() => formGastoVazio(hojeMes()));
  const [edicaoOverride, setEdicaoOverride] = useState(null); // { id, valor } | null

  // Backup
  const [ultimoBackup, setUltimoBackup] = useState(lerUltimoBackup);
  const lembrarBackup = precisaDeBackup(dados, ultimoBackup);

  // Layout: celular (barra embaixo) ou desktop (menu lateral, várias colunas)
  const desktop = useMediaQuery(QUERY_DESKTOP);

  const mesMinimo = addMeses(hojeMes(), -MESES_RETENCAO);
  const resumo = useResumoDoMes(dados, mesAtual);
  const historico = useHistorico(compras, gastos);
  // No celular, o detalhe só aparece se um cartão foi aberto; no desktop
  // a fatura fica sempre ao lado da lista, então o 1º cartão é o padrão.
  const cartaoAtivo =
    tela !== "cartoes"
      ? null
      : cartoes.find((c) => c.id === cartaoAberto) ?? (desktop ? cartoes[0] ?? null : null);

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

  /* -------- abrir painéis -------- */
  const abrirNovoCartao = () => setSheet("cartao");

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

  // O "+" faz o que faz sentido para a tela atual
  const adicionar = () => {
    if (tela === "contas") abrirNovaConta();
    else if (cartaoAtivo) abrirNovaCompra(cartaoAtivo.id);
    else setSheet("escolha");
  };
  const rotuloAdicionar =
    tela === "contas" ? "Nova conta" : cartaoAtivo ? "Nova compra" : "Novo lançamento";

  /* -------- salvar (retornam true/false para o form mostrar erro) -------- */
  const salvarCartao = () => {
    const novo = adicionarCartao(formCartao);
    if (!novo) return false;
    setFormCartao(FORM_CARTAO_VAZIO);
    setSheet(null);
    abrirCartao(novo.id);
    return true;
  };

  const salvarCompra = () => {
    const ok = adicionarCompra({
      cartaoId: formCompra.cartaoId,
      descricao: formCompra.descricao,
      valor: parseValor(formCompra.valor),
      parcelas: formCompra.parcelas,
      primeiroMes: formCompra.mes,
    });
    if (ok) {
      setFormCompra(formCompraVazio(mesAtual, formCompra.cartaoId));
      setSheet(null);
    }
    return ok;
  };

  const salvarGasto = () => {
    const ok = adicionarGasto({
      descricao: formGasto.descricao,
      valor: parseValor(formGasto.valor),
      tipo: formGasto.tipo,
      mes: formGasto.mes,
    });
    if (ok) {
      setFormGasto(formGastoVazio(mesAtual));
      setSheet(null);
    }
    return ok;
  };

  /* -------- excluir (com confirmação) -------- */
  const excluirCartao = (id) => {
    if (!confirm("Remover este cartão e todas as compras dele?")) return;
    removerCartao(id);
    setCartaoAberto(null);
  };

  const excluirCompra = (id) => {
    if (!confirm("Remover esta compra (todas as parcelas)?")) return;
    removerCompra(id);
  };

  const excluirGasto = (id) => {
    const g = gastos.find((x) => x.id === id);
    const msg =
      g?.tipo === "fixo"
        ? "Remover esta conta fixa? Ela deixará de aparecer em todos os meses."
        : "Remover esta conta?";
    if (!confirm(msg)) return;
    removerGasto(id);
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
    navegar("resumo");
  };

  const togglePagoNoMes = (id) => togglePago(mesAtual, id);

  /* ============================ RENDER ============================ */

  // Props comuns às versões celular e desktop de cada tela
  const propsResumo = {
    mesAtual,
    cartoes,
    salario: dados.salario,
    resumo,
    historico,
    onAbrirContas: () => navegar("contas"),
    onAbrirCartao: abrirCartao,
    onAdicionar: () => setSheet("escolha"),
    onDefinirSalario: () => {
      navegar("ajustes");
      setFocarSalario(true);
    },
    onSelecionarMes: mudarMes,
  };

  const conteudo = (
    <>
      {tela === "resumo" &&
        (desktop ? (
          <ResumoDesktop {...propsResumo} onTogglePago={togglePagoNoMes} />
        ) : (
          <TelaResumo {...propsResumo} />
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
          onRemover={excluirGasto}
          onAdicionar={abrirNovaConta}
        />
      )}

      {tela === "cartoes" && desktop && (
        <CartoesDesktop
          cartoes={cartoes}
          cartaoSelecionado={cartaoAtivo}
          mesAtual={mesAtual}
          resumo={resumo}
          onSelecionar={setCartaoAberto}
          onNovoCartao={abrirNovoCartao}
          onNovaCompra={() => abrirNovaCompra(cartaoAtivo?.id)}
          onRemoverCartao={() => cartaoAtivo && excluirCartao(cartaoAtivo.id)}
          onTogglePago={togglePagoNoMes}
          onRemoverCompra={excluirCompra}
        />
      )}

      {tela === "cartoes" &&
        !desktop &&
        (cartaoAtivo ? (
          <DetalheCartao
            cartao={cartaoAtivo}
            mesAtual={mesAtual}
            resumo={resumo}
            onVoltar={() => setCartaoAberto(null)}
            onNovaCompra={() => abrirNovaCompra(cartaoAtivo.id)}
            onRemoverCartao={() => excluirCartao(cartaoAtivo.id)}
            onTogglePago={togglePagoNoMes}
            onRemoverCompra={excluirCompra}
          />
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
              {seletorMes}
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

      <Sheet aberto={sheet !== null} onFechar={() => setSheet(null)} titulo={TITULOS_SHEET[sheet]}>
        {sheet === "escolha" && (
          <EscolhaLancamento
            temCartao={cartoes.length > 0}
            onCompra={() => abrirNovaCompra(null)}
            onConta={abrirNovaConta}
          />
        )}
        {sheet === "compra" && (
          <FormCompra
            valores={formCompra}
            cartoes={cartoes}
            onChange={setFormCompra}
            onSalvar={salvarCompra}
          />
        )}
        {sheet === "conta" && (
          <FormConta valores={formGasto} onChange={setFormGasto} onSalvar={salvarGasto} />
        )}
        {sheet === "cartao" && (
          <FormCartao valores={formCartao} onChange={setFormCartao} onSalvar={salvarCartao} />
        )}
      </Sheet>
    </>
  );
}
