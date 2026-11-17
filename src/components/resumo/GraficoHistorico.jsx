import { labelMes, MESES } from "../../lib/meses";
import { brl } from "../../lib/valores";

const brlCurto = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* Gráfico de barras simples (só CSS, sem biblioteca) dos últimos meses.
   Cada barra é um botão: clicar leva até aquele mês. A altura é
   proporcional ao maior total do período. */
export default function GraficoHistorico({ historico, mesAtual, onSelecionarMes }) {
  const maior = Math.max(...historico.map((h) => h.total), 1);

  return (
    <div className="grafico">
      {historico.map((h) => {
        const nome = MESES[Number(h.mes.split("-")[1]) - 1];
        const altura = Math.max(2, (h.total / maior) * 100);
        return (
          <button
            key={h.mes}
            type="button"
            className="grafico__coluna"
            onClick={() => onSelecionarMes(h.mes)}
            aria-current={h.mes === mesAtual ? "date" : undefined}
            aria-label={`${labelMes(h.mes)}: ${brl(h.total)}`}
          >
            <span className="grafico__valor num">{brlCurto(h.total)}</span>
            <span className="grafico__trilho">
              <span className="grafico__barra" style={{ height: `${altura}%` }} />
            </span>
            <span className="grafico__mes">{nome.slice(0, 3)}</span>
          </button>
        );
      })}
    </div>
  );
}
