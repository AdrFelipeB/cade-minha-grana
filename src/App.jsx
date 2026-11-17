import { useState } from "react";
import { useDados } from "./hooks/useDados";
import { useHistorico, useResumoDoMes } from "./hooks/useResumoDoMes";
import { addMeses, hojeMes } from "./lib/meses";
import { MESES_RETENCAO } from "./lib/regras";
import { parseValor } from "./lib/valores";
import { T } from "./theme";
import Cabecalho from "./components/Cabecalho";
import NavegacaoMes from "./components/NavegacaoMes";
import NavegacaoPrincipal from "./components/NavegacaoPrincipal";
import SeletorCartoes from "./components/SeletorCartoes";
import FormCartao from "./components/FormCartao";
import AbaGeral from "./components/geral/AbaGeral";
import AbaContas from "./components/contas/AbaContas";
import AbaCartao from "./components/cartao/AbaCartao";

const FORM_CARTAO_VAZIO = { nome: "", final: "" };
const formCompraVazio = (mes) => ({ descricao: "", valor: "", parcelas: 1, mes });
const formGastoVazio = (mes) => ({ descricao: "", valor: "", tipo: "fixo", mes });

/* O App guarda o estado de *interface* (aba, mês, forms abertos, edições
   em andamento) e repassa para as abas. Os *dados* ficam no hook useDados.
   O estado dos formulários mora aqui (e não dentro de cada form) para que,
   ao trocar de aba e voltar, o que você digitou continue lá — igual ao protótipo. */
export default function App() {
  const {
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
  } = useDados();
  const { cartoes, compras, gastos, salario } = dados;

  const [abaAtiva, setAbaAtiva] = useState("geral"); // "geral" | "contas" | id do cartão
  const [mesAtual, setMesAtual] = useState(hojeMes);

  const [mostrarFormCartao, setMostrarFormCartao] = useState(false);
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [formCartao, setFormCartao] = useState(FORM_CARTAO_VAZIO);
  const [formCompra, setFormCompra] = useState(() => formCompraVazio(hojeMes()));
  const [formGasto, setFormGasto] = useState(() => formGastoVazio(hojeMes()));

  const [salarioInput, setSalarioInput] = useState(null); // null = não está editando
  const [edicaoOverride, setEdicaoOverride] = useState(null); // { id, valor } | null

  const mesMinimo = addMeses(hojeMes(), -MESES_RETENCAO);
  const resumo = useResumoDoMes(dados, mesAtual);
  const historico = useHistorico(compras, gastos);
  const cartaoAtivo = cartoes.find((c) => c.id === abaAtiva);

  /* -------- handlers -------- */
  // Trocar de mês cancela a edição de valor em andamento; senão o OK
  // salvaria o override no mês novo em vez do mês em que você começou.
  const mudarMes = (mes) => {
    setMesAtual(mes);
    setEdicaoOverride(null);
  };

  const salvarCartao = () => {
    const novo = adicionarCartao(formCartao);
    if (!novo) return;
    setFormCartao(FORM_CARTAO_VAZIO);
    setMostrarFormCartao(false);
    setAbaAtiva(novo.id);
  };

  const excluirCartao = (id) => {
    if (!confirm("Remover este cartão e todas as compras dele?")) return;
    removerCartao(id);
    setAbaAtiva("geral");
  };

  const salvarCompra = () => {
    const ok = adicionarCompra({
      cartaoId: abaAtiva,
      descricao: formCompra.descricao,
      valor: parseValor(formCompra.valor),
      parcelas: formCompra.parcelas,
      primeiroMes: formCompra.mes,
    });
    if (!ok) return;
    setFormCompra(formCompraVazio(mesAtual));
    setMostrarFormCompra(false);
  };

  const excluirCompra = (id) => {
    if (!confirm("Remover esta compra (todas as parcelas)?")) return;
    removerCompra(id);
  };

  const salvarGasto = () => {
    const ok = adicionarGasto({
      descricao: formGasto.descricao,
      valor: parseValor(formGasto.valor),
      tipo: formGasto.tipo,
      mes: formGasto.mes,
    });
    if (!ok) return;
    setFormGasto(formGastoVazio(mesAtual));
    setMostrarFormGasto(false);
  };

  const excluirGasto = (id) => {
    const g = gastos.find((x) => x.id === id);
    const msg =
      g?.tipo === "fixo"
        ? "Remover esta conta fixa? Ela deixará de aparecer em todos os meses."
        : "Remover este gasto?";
    if (!confirm(msg)) return;
    removerGasto(id);
  };

  const confirmarOverride = (gastoId) => {
    salvarOverride(gastoId, mesAtual, parseValor(edicaoOverride?.valor ?? ""));
    setEdicaoOverride(null);
  };

  const voltarAoPadrao = (gastoId) => {
    removerOverride(gastoId, mesAtual);
    setEdicaoOverride(null);
  };

  const salvarSalario = () => {
    definirSalario(parseValor(salarioInput ?? ""));
    setSalarioInput(null);
  };

  /* ============================ RENDER ============================ */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1200px 500px at 80% -10%, rgba(124,58,237,0.25), transparent), ${T.bg}`,
        color: T.texto,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: "28px 16px 72px",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <Cabecalho />

        <NavegacaoMes mesAtual={mesAtual} mesMinimo={mesMinimo} onChange={mudarMes} />

        <NavegacaoPrincipal abaAtiva={abaAtiva} onChange={setAbaAtiva} />

        <SeletorCartoes
          cartoes={cartoes}
          abaAtiva={abaAtiva}
          onSelecionar={setAbaAtiva}
          onNovoCartao={() => setMostrarFormCartao(!mostrarFormCartao)}
          formAberto={mostrarFormCartao}
        />

        {mostrarFormCartao && (
          <FormCartao valores={formCartao} onChange={setFormCartao} onSalvar={salvarCartao} />
        )}

        {abaAtiva === "geral" && (
          <AbaGeral
            mesAtual={mesAtual}
            cartoes={cartoes}
            salario={salario}
            resumo={resumo}
            historico={historico}
            salarioInput={salarioInput}
            onSalarioInputChange={setSalarioInput}
            onSalvarSalario={salvarSalario}
            onIrParaAba={setAbaAtiva}
            onSelecionarMes={mudarMes}
          />
        )}

        {abaAtiva === "contas" && (
          <AbaContas
            mesAtual={mesAtual}
            resumo={resumo}
            mostrarForm={mostrarFormGasto}
            onToggleForm={() => {
              setFormGasto({ ...formGasto, mes: mesAtual });
              setMostrarFormGasto(!mostrarFormGasto);
            }}
            form={formGasto}
            onFormChange={setFormGasto}
            onSalvarForm={salvarGasto}
            edicaoOverride={edicaoOverride}
            onEdicaoOverrideChange={setEdicaoOverride}
            onSalvarOverride={confirmarOverride}
            onRemoverOverride={voltarAoPadrao}
            onTogglePago={(id) => togglePago(mesAtual, id)}
            onRemover={excluirGasto}
          />
        )}

        {cartaoAtivo && (
          <AbaCartao
            cartao={cartaoAtivo}
            mesAtual={mesAtual}
            resumo={resumo}
            mostrarForm={mostrarFormCompra}
            onToggleForm={() => {
              setFormCompra({ ...formCompra, mes: mesAtual });
              setMostrarFormCompra(!mostrarFormCompra);
            }}
            form={formCompra}
            onFormChange={setFormCompra}
            onSalvarForm={salvarCompra}
            onRemoverCartao={() => excluirCartao(cartaoAtivo.id)}
            onTogglePago={(id) => togglePago(mesAtual, id)}
            onRemoverCompra={excluirCompra}
          />
        )}
      </div>
    </div>
  );
}
