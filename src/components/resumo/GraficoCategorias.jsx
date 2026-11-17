import { categoriaPorId } from "../../categorias";
import { brl } from "../../lib/valores";

/* "Para onde vai a grana": total do mês por categoria, em barras
   horizontais ordenadas do maior para o menor.

   Por que barras e não pizza/rosca? Com até 10 categorias, uma rosca
   precisaria de 10 cores distinguíveis (não existem, nem para quem
   enxerga todas as cores) e comparar fatias é difícil. Aqui a categoria
   é identificada por ícone + nome, e o tamanho da barra compara valores. */
export default function GraficoCategorias({ totais }) {
  if (totais.length === 0) {
    return <p className="rotulo">Sem gastos neste mês.</p>;
  }

  const total = totais.reduce((s, c) => s + c.total, 0);
  const maior = totais[0].total;

  return (
    <ul className="categorias">
      {totais.map(({ categoria, total: valor }) => {
        const { nome, Icone } = categoriaPorId(categoria);
        const pct = Math.round((valor / total) * 100);
        return (
          <li key={categoria} className="categorias__item">
            <span className="categorias__icone" aria-hidden="true">
              <Icone size={16} />
            </span>
            <span className="categorias__nome">{nome}</span>
            <span className="categorias__valor num">
              {brl(valor)} <span className="texto-3">{pct}%</span>
            </span>
            <span className="categorias__trilho" aria-hidden="true">
              <span className="categorias__barra" style={{ width: `${(valor / maior) * 100}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
