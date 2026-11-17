import { useState } from "react";
import { labelMes, MESES } from "../../lib/meses";
import { brl, brlCurto } from "../../lib/valores";

const nomeCurto = (mes) => MESES[Number(mes.split("-")[1]) - 1].slice(0, 3);

/* "Próximos meses": quanto do seu dinheiro já está comprometido.
   Barras empilhadas (parcelas de cartão embaixo, contas em cima) e uma
   linha tracejada no valor do salário, para ver de cara se algum mês
   futuro já está apertado. Responde "posso parcelar mais alguma coisa?".

   Passar o mouse (ou focar com Tab) numa coluna mostra o detalhe embaixo;
   clicar leva até o mês. As cores das 2 séries foram validadas para
   daltonismo nos dois temas (ver --serie-1/--serie-2 no index.css). */
export default function GraficoCompromissos({ compromissos, salario, onSelecionarMes }) {
  const [destaque, setDestaque] = useState(0);
  const maior = Math.max(...compromissos.map((c) => c.total), salario, 1);
  const escala = maior * 1.08; // folga no topo para o rótulo
  const altura = (v) => `${(v / escala) * 100}%`;
  const d = compromissos[destaque];

  return (
    <div className="compromissos">
      <div className="compromissos__legenda" aria-hidden="true">
        <span><i style={{ background: "var(--serie-1)" }} /> Parcelas de cartão</span>
        <span><i style={{ background: "var(--serie-2)" }} /> Contas</span>
        {salario > 0 && <span><i className="compromissos__legenda-linha" /> Salário</span>}
      </div>

      <div className="compromissos__plot">
        {salario > 0 && (
          <div className="compromissos__salario" style={{ bottom: altura(salario) }} aria-hidden="true" />
        )}
        {compromissos.map((c, i) => (
          <button
            key={c.mes}
            type="button"
            className="compromissos__coluna"
            aria-current={i === destaque ? "true" : undefined}
            aria-label={`${labelMes(c.mes)}: ${brl(c.total)} comprometidos (cartões ${brl(c.cartoes)}, contas ${brl(c.contas)})`}
            onMouseEnter={() => setDestaque(i)}
            onFocus={() => setDestaque(i)}
            onClick={() => onSelecionarMes(c.mes)}
          >
            <span className="compromissos__total num">{c.total > 0 ? brlCurto(c.total) : ""}</span>
            {/* contas em cima, cartões embaixo; só o segmento do topo tem cantos arredondados */}
            {c.contas > 0 && (
              <span
                className="compromissos__seg compromissos__seg--contas compromissos__seg--topo"
                style={{ height: altura(c.contas) }}
              />
            )}
            {c.cartoes > 0 && (
              <span
                className={`compromissos__seg compromissos__seg--cartoes${c.contas > 0 ? "" : " compromissos__seg--topo"}`}
                style={{ height: altura(c.cartoes) }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="compromissos__meses" aria-hidden="true">
        {compromissos.map((c, i) => (
          <span key={c.mes} className={i === destaque ? "ativo" : undefined}>
            {nomeCurto(c.mes)}
          </span>
        ))}
      </div>

      {/* Detalhe do mês em destaque (atualiza no hover/foco) */}
      <p className="compromissos__detalhe" aria-live="polite">
        <strong>{labelMes(d.mes)}:</strong> <span className="num">{brl(d.total)}</span> já comprometidos
        {salario > 0 && (
          <>
            {" "}
            · <span className="num">{Math.round((d.total / salario) * 100)}%</span> do salário
          </>
        )}
        <br />
        <span className="rotulo">
          Cartões <span className="num">{brl(d.cartoes)}</span> · Contas{" "}
          <span className="num">{brl(d.contas)}</span>
        </span>
      </p>

      {/* Os mesmos números em tabela, para quem prefere ler (ou não vê o gráfico) */}
      <details className="compromissos__tabela">
        <summary>Ver como tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">Cartões</th>
              <th scope="col">Contas</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {compromissos.map((c) => (
              <tr key={c.mes}>
                <th scope="row">{labelMes(c.mes)}</th>
                <td className="num">{brl(c.cartoes)}</td>
                <td className="num">{brl(c.contas)}</td>
                <td className="num">{brl(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
