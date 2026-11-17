import { labelMes, MESES } from "../../lib/meses";
import { brl } from "../../lib/valores";

/* Totais dos últimos 3 meses + atual; tocar num mês leva até ele.
   aria-current marca para o leitor de tela qual mês está aberto. */
export default function Historico({ historico, mesAtual, onSelecionarMes }) {
  return (
    <>
      <h2 className="secao-titulo">Últimos meses</h2>
      <div className="historico">
        {historico.map((h) => {
          const nome = MESES[Number(h.mes.split("-")[1]) - 1];
          return (
            <button
              key={h.mes}
              type="button"
              className="historico__item"
              onClick={() => onSelecionarMes(h.mes)}
              aria-current={h.mes === mesAtual ? "date" : undefined}
              aria-label={`${labelMes(h.mes)}: ${brl(h.total)}`}
            >
              <div className="rotulo">{nome}</div>
              <div className="num" style={{ fontWeight: 600 }}>
                {brl(h.total)}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
