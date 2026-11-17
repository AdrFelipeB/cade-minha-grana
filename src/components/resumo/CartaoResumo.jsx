import { corComprometimento } from "../../cores";
import { labelMes } from "../../lib/meses";
import { brl } from "../../lib/valores";

/* O número que importa (quanto gastei) em destaque, e o contexto logo abaixo:
   quanto ganho, quanto sobra, quanto da renda está comprometido e o que falta pagar. */
export default function CartaoResumo({ mesAtual, salario, resumo, onDefinirSalario }) {
  const { totalGeral, totalPago, totalRestante, sobra, pctComprometido } = resumo;
  const nomeMes = labelMes(mesAtual).split(" ")[0];

  return (
    <section className="card" aria-label={`Resumo de ${nomeMes}`}>
      <div className="rotulo">Gastos de {nomeMes}</div>
      <div className="valor-grande num">{brl(totalGeral)}</div>

      {salario > 0 ? (
        <>
          <div className="rotulo">
            de <span className="num">{brl(salario)}</span> ·{" "}
            <span className={sobra >= 0 ? "positivo" : "negativo"}>
              {sobra >= 0 ? "sobra" : "faltam"} <span className="num">{brl(Math.abs(sobra))}</span>
            </span>
          </div>
          <div
            className="barra"
            role="progressbar"
            aria-label="Renda comprometida"
            aria-valuenow={Math.round(pctComprometido)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${pctComprometido.toFixed(0)}% da renda comprometida`}
          >
            <div
              className="barra__preenchimento"
              style={{ width: `${pctComprometido}%`, background: corComprometimento(pctComprometido) }}
            />
          </div>
        </>
      ) : (
        <div className="rotulo" style={{ marginBottom: 12 }}>
          <button type="button" className="btn btn--link" onClick={onDefinirSalario}>
            Informe seu salário
          </button>{" "}
          para ver quanto sobra no mês.
        </div>
      )}

      {totalGeral > 0 && (
        <div className="par-valores">
          <span>
            Pago <strong className="num">{brl(totalPago)}</strong>
          </span>
          <span>
            Falta <strong className="num">{brl(totalRestante)}</strong>
          </span>
        </div>
      )}
    </section>
  );
}
