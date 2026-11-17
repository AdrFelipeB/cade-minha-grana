import { TELAS } from "./telas";

/* Barra fixa embaixo (celular): é onde o polegar alcança.
   aria-current="page" marca a tela atual (o CSS usa o mesmo atributo). */
export default function BarraNavegacao({ tela, onChange, alertaAjustes }) {
  return (
    <nav className="nav" aria-label="Principal">
      <div className="nav__itens">
        {TELAS.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            className="nav__item"
            aria-current={tela === id ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icone size={24} stroke={tela === id ? 2.2 : 1.8} aria-hidden="true" />
            {rotulo}
            {id === "ajustes" && alertaAjustes && (
              <span className="nav__alerta" title="Faça um backup dos seus dados" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
