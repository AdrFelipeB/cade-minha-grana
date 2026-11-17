import { useState, useEffect, useMemo } from "react";

/* ============================================================
   CAMADA DE ARMAZENAMENTO
   ------------------------------------------------------------
   Artifacts no Claude.ai NÃO suportam localStorage, então aqui
   uso o storage persistente do artifact (window.storage).

   No seu projeto React local, troque só estas duas funções:

   const loadData = () => {
     const raw = localStorage.getItem(STORAGE_KEY);
     return raw ? JSON.parse(raw) : null;
   };
   const saveData = (data) => {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
   };
   ============================================================ */

const STORAGE_KEY = "gerenciador-cartoes";

async function loadData() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    return result ? JSON.parse(result.value) : null;
  } catch {
    return null;
  }
}

async function saveData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Falha ao salvar:", e);
  }
}

/* ============================ UTILS ============================ */

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const hojeMes = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const addMeses = (ym, n) => {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
};

const diffMeses = (a, b) => {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return ay * 12 + am - (by * 12 + bm);
};

const labelMes = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MESES[m - 1]} ${y}`;
};

const brl = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseValor = (s) => {
  const limpo = String(s).trim();
  // aceita "1.234,56" e "1234.56"
  const v = limpo.includes(",")
    ? parseFloat(limpo.replace(/\./g, "").replace(",", "."))
    : parseFloat(limpo);
  return isNaN(v) ? 0 : v;
};

function calcularParcelas(total, n) {
  const base = Math.floor((total / n) * 100) / 100;
  const parcelas = Array(n).fill(base);
  parcelas[n - 1] = Math.round((base + (total - base * n)) * 100) / 100;
  return parcelas;
}

function parcelaDoMes(compra, mes) {
  const idx = diffMeses(mes, compra.primeiroMes);
  if (idx < 0 || idx >= compra.parcelas) return null;
  const valores = calcularParcelas(compra.valorTotal, compra.parcelas);
  return { ...compra, numeroParcela: idx + 1, valorParcela: valores[idx] };
}

// Uma conta (gasto geral) se aplica ao mês?
function contaDoMes(gasto, mes) {
  if (gasto.tipo === "fixo") return diffMeses(mes, gasto.mesInicio) >= 0;
  return gasto.mes === mes;
}

// Valor de uma conta em um mês (considera override de contas fixas)
function valorDaConta(gasto, mes) {
  if (gasto.tipo === "fixo" && gasto.overrides && gasto.overrides[mes] != null) {
    return gasto.overrides[mes];
  }
  return gasto.valor;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ============================ TEMA ============================ */

const T = {
  bg: "#0E0B1E",
  bgCard: "#1B1730",
  border: "#2C2650",
  texto: "#F1EEFF",
  textoSuave: "#9C94C4",
  positivo: "#34D399",
  negativo: "#FB7185",
};

const GRADIENTES_CARTAO = [
  ["#820AD1", "#B546F5"],
  ["#0284C7", "#22D3EE"],
  ["#E11D48", "#FB923C"],
  ["#059669", "#5EEAD4"],
  ["#DB2777", "#A855F7"],
  ["#D97706", "#FACC15"],
];

const GRAD_PRIMARIO = "linear-gradient(135deg, #7C3AED, #DB2777)";
const GRAD_CONTAS = "linear-gradient(135deg, #0891B2, #34D399)";

const S = {
  mono: {
    fontFamily: "ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, monospace",
    fontVariantNumeric: "tabular-nums",
  },
  btn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.1s ease, opacity 0.15s ease",
  },
  painel: {
    background: "#1B1730",
    border: "1px solid #2C2650",
    borderRadius: 16,
    padding: 16,
  },
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  fontSize: 14,
  marginTop: 4,
  background: "#141026",
  color: T.texto,
  outline: "none",
};

const labelStyle = { fontSize: 12, fontWeight: 700, color: T.textoSuave };

/* ---------- check de pago ---------- */
function CheckPago({ pago, onClick }) {
  return (
    <button
      onClick={onClick}
      title={pago ? "Marcar como não pago" : "Marcar como pago"}
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        border: pago ? "none" : `2px solid ${T.textoSuave}`,
        background: pago ? "linear-gradient(135deg, #34D399, #A7F3D0)" : "transparent",
        color: "#065F46",
        fontWeight: 900,
        fontSize: 14,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s ease",
      }}
    >
      {pago ? "✓" : ""}
    </button>
  );
}

/* ============================ COMPONENTE ============================ */

export default function GerenciadorCartoes() {
  const [carregado, setCarregado] = useState(false);
  const [cartoes, setCartoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [pagos, setPagos] = useState({}); // { "2026-07": ["id1", "id2"] }
  const [salario, setSalario] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState("geral");
  const [mesAtual, setMesAtual] = useState(hojeMes());
  const [mostrarFormCartao, setMostrarFormCartao] = useState(false);
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [editandoSalario, setEditandoSalario] = useState(false);
  const [salarioInput, setSalarioInput] = useState("");
  const [editandoOverride, setEditandoOverride] = useState(null); // id do gasto
  const [overrideInput, setOverrideInput] = useState("");

  // form cartão
  const [nomeCartao, setNomeCartao] = useState("");
  const [finalCartao, setFinalCartao] = useState("");

  // form compra
  const [descCompra, setDescCompra] = useState("");
  const [valorCompra, setValorCompra] = useState("");
  const [parcelasCompra, setParcelasCompra] = useState(1);
  const [mesCompra, setMesCompra] = useState(hojeMes());

  // form gasto geral
  const [descGasto, setDescGasto] = useState("");
  const [valorGasto, setValorGasto] = useState("");
  const [tipoGasto, setTipoGasto] = useState("fixo");
  const [mesGasto, setMesGasto] = useState(hojeMes());

  const mesMinimo = addMeses(hojeMes(), -3);

  /* -------- carregar / salvar -------- */
  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data) {
        const limite = addMeses(hojeMes(), -3);
        const comprasValidas = (data.compras || []).filter((c) => {
          const ultimoMes = addMeses(c.primeiroMes, c.parcelas - 1);
          return diffMeses(ultimoMes, limite) >= 0;
        });
        const gastosValidos = (data.gastos || []).filter(
          (g) => g.tipo === "fixo" || diffMeses(g.mes, limite) >= 0
        );
        // limpa pagos e overrides de meses antigos demais
        const pagosValidos = {};
        for (const [mes, ids] of Object.entries(data.pagos || {})) {
          if (diffMeses(mes, limite) >= 0) pagosValidos[mes] = ids;
        }
        for (const g of gastosValidos) {
          if (g.overrides) {
            g.overrides = Object.fromEntries(
              Object.entries(g.overrides).filter(([mes]) => diffMeses(mes, limite) >= 0)
            );
          }
        }
        setCartoes(data.cartoes || []);
        setCompras(comprasValidas);
        setGastos(gastosValidos);
        setPagos(pagosValidos);
        setSalario(data.salario || 0);
      }
      setCarregado(true);
    })();
  }, []);

  useEffect(() => {
    if (!carregado) return;
    saveData({ cartoes, compras, gastos, pagos, salario });
  }, [cartoes, compras, gastos, pagos, salario, carregado]);

  /* -------- pago -------- */
  const isPago = (id) => (pagos[mesAtual] || []).includes(id);

  const togglePago = (id) => {
    const lista = pagos[mesAtual] || [];
    const nova = lista.includes(id)
      ? lista.filter((x) => x !== id)
      : [...lista, id];
    setPagos({ ...pagos, [mesAtual]: nova });
  };

  /* -------- ações -------- */
  const adicionarCartao = () => {
    if (!nomeCartao.trim()) return;
    const novo = {
      id: uid(),
      nome: nomeCartao.trim(),
      final: finalCartao.trim(),
      gradiente: cartoes.length % GRADIENTES_CARTAO.length,
    };
    setCartoes([...cartoes, novo]);
    setNomeCartao("");
    setFinalCartao("");
    setMostrarFormCartao(false);
    setAbaAtiva(novo.id);
  };

  const removerCartao = (id) => {
    if (!confirm("Remover este cartão e todas as compras dele?")) return;
    setCartoes(cartoes.filter((c) => c.id !== id));
    setCompras(compras.filter((c) => c.cartaoId !== id));
    setAbaAtiva("geral");
  };

  const adicionarCompra = () => {
    const valor = parseValor(valorCompra);
    if (!descCompra.trim() || valor <= 0) return;
    setCompras([
      ...compras,
      {
        id: uid(),
        cartaoId: abaAtiva,
        descricao: descCompra.trim(),
        valorTotal: Math.round(valor * 100) / 100,
        parcelas: Math.max(1, parseInt(parcelasCompra) || 1),
        primeiroMes: mesCompra,
      },
    ]);
    setDescCompra("");
    setValorCompra("");
    setParcelasCompra(1);
    setMesCompra(mesAtual);
    setMostrarFormCompra(false);
  };

  const removerCompra = (id) => {
    if (!confirm("Remover esta compra (todas as parcelas)?")) return;
    setCompras(compras.filter((c) => c.id !== id));
  };

  const adicionarGasto = () => {
    const valor = parseValor(valorGasto);
    if (!descGasto.trim() || valor <= 0) return;
    const novo = {
      id: uid(),
      descricao: descGasto.trim(),
      valor: Math.round(valor * 100) / 100,
      tipo: tipoGasto,
    };
    if (tipoGasto === "fixo") novo.mesInicio = mesGasto;
    else novo.mes = mesGasto;
    setGastos([...gastos, novo]);
    setDescGasto("");
    setValorGasto("");
    setTipoGasto("fixo");
    setMesGasto(mesAtual);
    setMostrarFormGasto(false);
  };

  const removerGasto = (id) => {
    const g = gastos.find((x) => x.id === id);
    const msg =
      g?.tipo === "fixo"
        ? "Remover esta conta fixa? Ela deixará de aparecer em todos os meses."
        : "Remover este gasto?";
    if (!confirm(msg)) return;
    setGastos(gastos.filter((x) => x.id !== id));
  };

  const salvarOverride = (gastoId) => {
    const v = parseValor(overrideInput);
    setGastos(
      gastos.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        if (v > 0 && v !== g.valor) overrides[mesAtual] = Math.round(v * 100) / 100;
        else delete overrides[mesAtual];
        return { ...g, overrides };
      })
    );
    setEditandoOverride(null);
    setOverrideInput("");
  };

  const removerOverride = (gastoId) => {
    setGastos(
      gastos.map((g) => {
        if (g.id !== gastoId) return g;
        const overrides = { ...(g.overrides || {}) };
        delete overrides[mesAtual];
        return { ...g, overrides };
      })
    );
    setEditandoOverride(null);
  };

  const salvarSalario = () => {
    const v = parseValor(salarioInput);
    if (v >= 0) setSalario(Math.round(v * 100) / 100);
    setEditandoSalario(false);
  };

  /* -------- derivados -------- */
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

  const historico = useMemo(() => {
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

  const valorParcelaPreview = () => {
    const v = parseValor(valorCompra);
    const n = Math.max(1, parseInt(parcelasCompra) || 1);
    if (v <= 0) return null;
    return calcularParcelas(v, n)[0];
  };

  const grad = (c) => {
    const [a, b] = GRADIENTES_CARTAO[c.gradiente ?? 0];
    return `linear-gradient(135deg, ${a}, ${b})`;
  };

  if (!carregado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textoSuave,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Carregando…
      </div>
    );
  }

  const cartaoAtivo = cartoes.find((c) => c.id === abaAtiva);
  const dadosCartaoAtivo = cartaoAtivo
    ? parcelasDoMesPorCartao[cartaoAtivo.id] || { itens: [], subtotal: 0 }
    : null;
  const pagoCartaoAtivo = dadosCartaoAtivo
    ? dadosCartaoAtivo.itens
        .filter((p) => isPago(p.id))
        .reduce((s, p) => s + p.valorParcela, 0)
    : 0;

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
        {/* Cabeçalho */}
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, #C4B5FD, #F0ABFC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Meus Gastos
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textoSuave }}>
            Cartões, contas e parcelas sob controle — sem vincular banco nenhum.
          </p>
        </header>

        {/* Navegação de mês */}
        <div
          style={{
            ...S.painel,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <button
            style={{
              ...S.btn,
              background: "#2C2650",
              color: T.texto,
              fontSize: 16,
              padding: "6px 14px",
              opacity: diffMeses(mesAtual, mesMinimo) <= 0 ? 0.3 : 1,
            }}
            onClick={() => setMesAtual(addMeses(mesAtual, -1))}
            disabled={diffMeses(mesAtual, mesMinimo) <= 0}
          >
            ◀
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{labelMes(mesAtual)}</div>
            {mesAtual !== hojeMes() && (
              <button
                style={{
                  ...S.btn,
                  background: "transparent",
                  color: "#C4B5FD",
                  fontSize: 12,
                  padding: 0,
                  textDecoration: "underline",
                }}
                onClick={() => setMesAtual(hojeMes())}
              >
                voltar ao mês atual
              </button>
            )}
          </div>
          <button
            style={{
              ...S.btn,
              background: "#2C2650",
              color: T.texto,
              fontSize: 16,
              padding: "6px 14px",
            }}
            onClick={() => setMesAtual(addMeses(mesAtual, 1))}
          >
            ▶
          </button>
        </div>

        {/* Navegação principal: Geral | Contas (controle segmentado) */}
        <div
          style={{
            display: "flex",
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: 4,
            gap: 4,
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => setAbaAtiva("geral")}
            style={{
              ...S.btn,
              flex: 1,
              background: abaAtiva === "geral" ? GRAD_PRIMARIO : "transparent",
              color: abaAtiva === "geral" ? "#FFF" : T.textoSuave,
              borderRadius: 999,
            }}
          >
            📊 Geral
          </button>
          <button
            onClick={() => setAbaAtiva("contas")}
            style={{
              ...S.btn,
              flex: 1,
              background: abaAtiva === "contas" ? GRAD_CONTAS : "transparent",
              color: abaAtiva === "contas" ? "#FFF" : T.textoSuave,
              borderRadius: 999,
            }}
          >
            🏠 Contas
          </button>
        </div>

        {/* Seção de cartões */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: T.textoSuave,
              marginBottom: 8,
            }}
          >
            💳 Seus cartões
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cartoes.map((c) => (
              <button
                key={c.id}
                onClick={() => setAbaAtiva(c.id)}
                style={{
                  ...S.btn,
                  background: abaAtiva === c.id ? grad(c) : T.bgCard,
                  color: T.texto,
                  border: `1px solid ${abaAtiva === c.id ? "transparent" : T.border}`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {c.nome}
                {c.final && (
                  <span style={{ ...S.mono, fontSize: 12, opacity: 0.75 }}>
                    •••• {c.final}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => setMostrarFormCartao(!mostrarFormCartao)}
              style={{
                ...S.btn,
                background: "transparent",
                border: `1px dashed ${T.textoSuave}`,
                color: T.textoSuave,
                borderRadius: 12,
              }}
            >
              + Cartão
            </button>
          </div>
        </div>

        {/* Form novo cartão */}
        {mostrarFormCartao && (
          <div
            style={{
              ...S.painel,
              marginBottom: 16,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 160px" }}>
              <label style={labelStyle}>Nome do cartão</label>
              <input
                value={nomeCartao}
                onChange={(e) => setNomeCartao(e.target.value)}
                placeholder="Ex.: Nubank"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: "0 1 120px" }}>
              <label style={labelStyle}>Final (opcional)</label>
              <input
                value={finalCartao}
                onChange={(e) =>
                  setFinalCartao(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="1234"
                style={{ ...inputStyle, ...S.mono }}
              />
            </div>
            <button
              onClick={adicionarCartao}
              style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF" }}
            >
              Salvar cartão
            </button>
          </div>
        )}

        {/* ================= ABA GERAL ================= */}
        {abaAtiva === "geral" && (
          <>
            {/* Painel salário × gastos × sobra */}
            <div
              style={{
                borderRadius: 18,
                padding: "22px 24px",
                marginBottom: 16,
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(219,39,119,0.85))",
                boxShadow: "0 12px 40px rgba(124,58,237,0.35)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 16,
                }}
              >
                {/* Salário */}
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>
                    Salário mensal
                  </div>
                  {editandoSalario ? (
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <input
                        autoFocus
                        value={salarioInput}
                        onChange={(e) => setSalarioInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && salvarSalario()}
                        placeholder="3500,00"
                        inputMode="decimal"
                        style={{
                          ...inputStyle,
                          ...S.mono,
                          marginTop: 0,
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.35)",
                          maxWidth: 140,
                        }}
                      />
                      <button
                        onClick={salvarSalario}
                        style={{ ...S.btn, background: "rgba(255,255,255,0.25)", color: "#FFF", padding: "6px 12px" }}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setSalarioInput(salario ? String(salario).replace(".", ",") : "");
                        setEditandoSalario(true);
                      }}
                      style={{ cursor: "pointer" }}
                      title="Clique para editar"
                    >
                      <span style={{ ...S.mono, fontSize: 24, fontWeight: 800 }}>
                        {brl(salario)}
                      </span>
                      <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 8 }}>✎ editar</span>
                    </div>
                  )}
                </div>

                {/* Gastos do mês */}
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>
                    Gastos de {labelMes(mesAtual).split(" ")[0]}
                  </div>
                  <div style={{ ...S.mono, fontSize: 24, fontWeight: 800, marginTop: 2 }}>
                    {brl(totalGeral)}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                    Cartões {brl(totalCartoes)} · Contas {brl(totalContas)}
                  </div>
                </div>

                {/* Sobra */}
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>
                    {sobra >= 0 ? "Vai sobrar" : "Vai faltar"}
                  </div>
                  <div
                    style={{
                      ...S.mono,
                      fontSize: 24,
                      fontWeight: 800,
                      marginTop: 2,
                      color: sobra >= 0 ? "#A7F3D0" : "#FECDD3",
                    }}
                  >
                    {brl(Math.abs(sobra))}
                  </div>
                </div>
              </div>

              {/* Já pago × restante */}
              {totalGeral > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    fontSize: 13,
                  }}
                >
                  <span>
                    ✓ Já pago:{" "}
                    <strong style={{ ...S.mono, color: "#A7F3D0" }}>{brl(totalPago)}</strong>
                  </span>
                  <span>
                    Falta pagar:{" "}
                    <strong style={{ ...S.mono, color: totalRestante > 0 ? "#FDE68A" : "#A7F3D0" }}>
                      {brl(totalRestante)}
                    </strong>
                  </span>
                </div>
              )}

              {/* Barra de comprometimento */}
              {salario > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.3)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pctComprometido}%`,
                        borderRadius: 999,
                        background:
                          pctComprometido < 60
                            ? "linear-gradient(90deg, #34D399, #A7F3D0)"
                            : pctComprometido < 90
                            ? "linear-gradient(90deg, #FACC15, #FDE68A)"
                            : "linear-gradient(90deg, #FB7185, #FECDD3)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>
                    {pctComprometido.toFixed(0)}% da sua renda comprometida neste mês
                  </div>
                </div>
              )}
            </div>

            {/* Contas do mês (resumo) */}
            <div
              onClick={() => setAbaAtiva("contas")}
              style={{
                ...S.painel,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  background: GRAD_CONTAS,
                }}
              />
              <div style={{ paddingLeft: 8 }}>
                <strong>Contas do mês</strong>
                <div style={{ fontSize: 12, color: T.textoSuave }}>
                  {gastosDoMes.filter((g) => isPago(g.id)).length}/{gastosDoMes.length} paga(s)
                </div>
              </div>
              <div style={{ ...S.mono, fontWeight: 800, fontSize: 18 }}>
                {brl(totalContas)}
              </div>
            </div>

            {/* Por cartão */}
            {cartoes.length === 0 ? (
              <VazioMsg texto="Nenhum cartão cadastrado ainda. Comece adicionando um na aba “+ Cartão”." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {cartoes.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setAbaAtiva(c.id)}
                    style={{
                      ...S.painel,
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        background: grad(c),
                      }}
                    />
                    <div style={{ paddingLeft: 8 }}>
                      <strong>{c.nome}</strong>{" "}
                      {c.final && (
                        <span style={{ ...S.mono, fontSize: 12, color: T.textoSuave }}>
                          •••• {c.final}
                        </span>
                      )}
                      <div style={{ fontSize: 12, color: T.textoSuave }}>
                        {parcelasDoMesPorCartao[c.id]?.itens.length || 0} lançamento(s) no mês
                      </div>
                    </div>
                    <div style={{ ...S.mono, fontWeight: 800, fontSize: 18 }}>
                      {brl(parcelasDoMesPorCartao[c.id]?.subtotal || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Histórico */}
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>
              Histórico (últimos 3 meses + atual)
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {historico.map((h) => (
                <div
                  key={h.mes}
                  onClick={() => setMesAtual(h.mes)}
                  style={{
                    ...S.painel,
                    padding: "12px 14px",
                    cursor: "pointer",
                    border:
                      h.mes === mesAtual
                        ? "1px solid #7C3AED"
                        : `1px solid ${T.border}`,
                    boxShadow:
                      h.mes === mesAtual ? "0 0 0 3px rgba(124,58,237,0.25)" : "none",
                  }}
                >
                  <div style={{ fontSize: 12, color: T.textoSuave }}>{labelMes(h.mes)}</div>
                  <div style={{ ...S.mono, fontWeight: 800, fontSize: 16 }}>{brl(h.total)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= ABA CONTAS ================= */}
        {abaAtiva === "contas" && (
          <>
            <div
              style={{
                background: GRAD_CONTAS,
                borderRadius: 18,
                padding: "22px 24px",
                marginBottom: 16,
                boxShadow: "0 12px 40px rgba(8,145,178,0.35)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                Contas de {labelMes(mesAtual)}
              </div>
              <div style={{ ...S.mono, fontSize: 30, fontWeight: 800, color: "#FFF" }}>
                {brl(totalContas)}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                {gastosDoMes.filter((g) => isPago(g.id)).length} de {gastosDoMes.length} conta(s)
                paga(s) neste mês
              </div>
            </div>

            <button
              onClick={() => {
                setMesGasto(mesAtual);
                setMostrarFormGasto(!mostrarFormGasto);
              }}
              style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", marginBottom: 14 }}
            >
              + Nova conta
            </button>

            {/* Form novo gasto */}
            {mostrarFormGasto && (
              <div style={{ ...S.painel, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "2 1 200px" }}>
                    <label style={labelStyle}>Descrição</label>
                    <input
                      value={descGasto}
                      onChange={(e) => setDescGasto(e.target.value)}
                      placeholder="Ex.: Aluguel"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: "1 1 120px" }}>
                    <label style={labelStyle}>
                      {tipoGasto === "fixo" ? "Valor padrão (R$)" : "Valor (R$)"}
                    </label>
                    <input
                      value={valorGasto}
                      onChange={(e) => setValorGasto(e.target.value)}
                      placeholder="850,00"
                      inputMode="decimal"
                      style={{ ...inputStyle, ...S.mono }}
                    />
                  </div>
                </div>

                {/* Toggle fixo / momentâneo */}
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Tipo de gasto</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => setTipoGasto("fixo")}
                      style={{
                        ...S.btn,
                        flex: 1,
                        background: tipoGasto === "fixo" ? GRAD_CONTAS : "#141026",
                        color: T.texto,
                        border: `1px solid ${tipoGasto === "fixo" ? "transparent" : T.border}`,
                      }}
                    >
                      🔁 Fixo
                      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
                        repete todo mês
                      </div>
                    </button>
                    <button
                      onClick={() => setTipoGasto("momentaneo")}
                      style={{
                        ...S.btn,
                        flex: 1,
                        background: tipoGasto === "momentaneo" ? GRAD_CONTAS : "#141026",
                        color: T.texto,
                        border: `1px solid ${tipoGasto === "momentaneo" ? "transparent" : T.border}`,
                      }}
                    >
                      📌 Momentâneo
                      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
                        só neste mês
                      </div>
                    </button>
                  </div>
                  {tipoGasto === "fixo" && (
                    <div style={{ fontSize: 12, color: T.textoSuave, marginTop: 6 }}>
                      💡 Contas fixas de valor variável (luz, água): cadastre com um valor médio e
                      ajuste o valor exato mês a mês na lista abaixo.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12, maxWidth: 200 }}>
                  <label style={labelStyle}>
                    {tipoGasto === "fixo" ? "A partir de" : "Mês do gasto"}
                  </label>
                  <input
                    type="month"
                    value={mesGasto}
                    onChange={(e) => setMesGasto(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={adicionarGasto}
                  style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", marginTop: 14 }}
                >
                  Salvar conta
                </button>
              </div>
            )}

            {/* Lista de contas do mês */}
            {gastosDoMes.length === 0 ? (
              <VazioMsg texto={`Nenhuma conta em ${labelMes(mesAtual)}. Cadastre o aluguel, luz, água…`} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {gastosDoMes.map((g) => {
                  const pago = isPago(g.id);
                  const temOverride =
                    g.tipo === "fixo" && g.overrides && g.overrides[mesAtual] != null;
                  return (
                    <div
                      key={g.id}
                      style={{
                        ...S.painel,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 12,
                        gap: 12,
                        opacity: pago ? 0.65 : 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <CheckPago pago={pago} onClick={() => togglePago(g.id)} />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              textDecoration: pago ? "line-through" : "none",
                            }}
                          >
                            {g.descricao}
                          </div>
                          <div style={{ fontSize: 12 }}>
                            {g.tipo === "fixo" ? (
                              <span style={{ color: "#5EEAD4" }}>
                                🔁 Fixo · desde {labelMes(g.mesInicio)}
                                {temOverride && (
                                  <span style={{ color: "#FDE68A" }}>
                                    {" "}· padrão {brl(g.valor)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span style={{ color: "#FDE68A" }}>
                                📌 Momentâneo · {labelMes(g.mes)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        {editandoOverride === g.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              autoFocus
                              value={overrideInput}
                              onChange={(e) => setOverrideInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && salvarOverride(g.id)}
                              inputMode="decimal"
                              placeholder={String(g.valor).replace(".", ",")}
                              style={{ ...inputStyle, ...S.mono, marginTop: 0, width: 100 }}
                            />
                            <button
                              onClick={() => salvarOverride(g.id)}
                              style={{ ...S.btn, background: GRAD_CONTAS, color: "#FFF", padding: "6px 10px", fontSize: 12 }}
                            >
                              OK
                            </button>
                            {temOverride && (
                              <button
                                onClick={() => removerOverride(g.id)}
                                title="Voltar ao valor padrão"
                                style={{ ...S.btn, background: "#2C2650", color: T.texto, padding: "6px 10px", fontSize: 12 }}
                              >
                                padrão
                              </button>
                            )}
                          </div>
                        ) : (
                          <span
                            onClick={() => {
                              if (g.tipo !== "fixo") return;
                              setOverrideInput(String(g.valorNoMes).replace(".", ","));
                              setEditandoOverride(g.id);
                            }}
                            title={
                              g.tipo === "fixo"
                                ? "Clique para ajustar o valor deste mês"
                                : undefined
                            }
                            style={{
                              ...S.mono,
                              fontWeight: 800,
                              cursor: g.tipo === "fixo" ? "pointer" : "default",
                              borderBottom:
                                g.tipo === "fixo" ? `1px dashed ${T.textoSuave}` : "none",
                              color: temOverride ? "#FDE68A" : T.texto,
                            }}
                          >
                            {brl(g.valorNoMes)}
                          </span>
                        )}
                        <button
                          onClick={() => removerGasto(g.id)}
                          title="Remover conta"
                          style={{
                            ...S.btn,
                            background: "transparent",
                            color: T.negativo,
                            fontSize: 14,
                            padding: "4px 6px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ================= ABA DE UM CARTÃO ================= */}
        {cartaoAtivo && (
          <>
            <div
              style={{
                background: grad(cartaoAtivo),
                borderRadius: 18,
                padding: "22px 24px",
                marginBottom: 16,
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -40,
                  top: -40,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#FFF" }}>
                    {cartaoAtivo.nome}
                  </div>
                  {cartaoAtivo.final && (
                    <div style={{ ...S.mono, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                      •••• •••• •••• {cartaoAtivo.final}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removerCartao(cartaoAtivo.id)}
                  style={{
                    ...S.btn,
                    background: "rgba(0,0,0,0.25)",
                    color: "#FFF",
                    fontSize: 12,
                    padding: "6px 10px",
                  }}
                >
                  Remover
                </button>
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                Fatura de {labelMes(mesAtual)}
              </div>
              <div style={{ ...S.mono, fontSize: 30, fontWeight: 800, color: "#FFF" }}>
                {brl(dadosCartaoAtivo.subtotal)}
              </div>
              {pagoCartaoAtivo > 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                  ✓ pago {brl(pagoCartaoAtivo)} · falta{" "}
                  {brl(dadosCartaoAtivo.subtotal - pagoCartaoAtivo)}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setMesCompra(mesAtual);
                setMostrarFormCompra(!mostrarFormCompra);
              }}
              style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF", marginBottom: 14 }}
            >
              + Nova compra
            </button>

            {/* Form nova compra */}
            {mostrarFormCompra && (
              <div style={{ ...S.painel, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "2 1 200px" }}>
                    <label style={labelStyle}>Descrição</label>
                    <input
                      value={descCompra}
                      onChange={(e) => setDescCompra(e.target.value)}
                      placeholder="Ex.: Tênis"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: "1 1 120px" }}>
                    <label style={labelStyle}>Valor total (R$)</label>
                    <input
                      value={valorCompra}
                      onChange={(e) => setValorCompra(e.target.value)}
                      placeholder="299,90"
                      inputMode="decimal"
                      style={{ ...inputStyle, ...S.mono }}
                    />
                  </div>
                  <div style={{ flex: "0 1 100px" }}>
                    <label style={labelStyle}>Parcelas</label>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={parcelasCompra}
                      onChange={(e) => setParcelasCompra(e.target.value)}
                      style={{ ...inputStyle, ...S.mono }}
                    />
                  </div>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={labelStyle}>1ª parcela em</label>
                    <input
                      type="month"
                      value={mesCompra}
                      onChange={(e) => setMesCompra(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                {valorParcelaPreview() && parseInt(parcelasCompra) > 1 && (
                  <div style={{ fontSize: 13, color: "#A7F3D0", marginTop: 10 }}>
                    {parcelasCompra}x de{" "}
                    <strong style={S.mono}>{brl(valorParcelaPreview())}</strong> — última
                    parcela em {labelMes(addMeses(mesCompra, parseInt(parcelasCompra) - 1))}
                  </div>
                )}
                <button
                  onClick={adicionarCompra}
                  style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF", marginTop: 12 }}
                >
                  Salvar compra
                </button>
              </div>
            )}

            {/* Lançamentos do mês */}
            {dadosCartaoAtivo.itens.length === 0 ? (
              <VazioMsg texto={`Nenhum lançamento em ${labelMes(mesAtual)} para este cartão.`} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dadosCartaoAtivo.itens.map((p) => {
                  const pago = isPago(p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        ...S.painel,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 12,
                        gap: 12,
                        opacity: pago ? 0.65 : 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <CheckPago pago={pago} onClick={() => togglePago(p.id)} />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              textDecoration: pago ? "line-through" : "none",
                            }}
                          >
                            {p.descricao}
                          </div>
                          <div style={{ fontSize: 12, color: T.textoSuave }}>
                            {p.parcelas > 1 ? (
                              <>
                                Parcela{" "}
                                <span style={{ color: "#C4B5FD", fontWeight: 700 }}>
                                  {p.numeroParcela}/{p.parcelas}
                                </span>{" "}
                                · total {brl(p.valorTotal)}
                              </>
                            ) : (
                              "À vista"
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <span style={{ ...S.mono, fontWeight: 800 }}>{brl(p.valorParcela)}</span>
                        <button
                          onClick={() => removerCompra(p.id)}
                          title="Remover compra"
                          style={{
                            ...S.btn,
                            background: "transparent",
                            color: T.negativo,
                            fontSize: 14,
                            padding: "4px 6px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- auxiliares ---------- */

function VazioMsg({ texto }) {
  return (
    <div
      style={{
        border: "1px dashed #4A4374",
        borderRadius: 14,
        padding: "28px 20px",
        textAlign: "center",
        color: "#9C94C4",
        fontSize: 14,
        marginBottom: 24,
      }}
    >
      {texto}
    </div>
  );
}
