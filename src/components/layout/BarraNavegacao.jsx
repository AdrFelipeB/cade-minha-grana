import {
  IconCreditCard,
  IconLayoutDashboard,
  IconReceipt,
  IconSettings,
} from "@tabler/icons-react";

const TELAS = [
  { id: "resumo", rotulo: "Resumo", Icone: IconLayoutDashboard },
  { id: "contas", rotulo: "Contas", Icone: IconReceipt },
  { id: "cartoes", rotulo: "Cartões", Icone: IconCreditCard },
  { id: "ajustes", rotulo: "Ajustes", Icone: IconSettings },
];

/* Barra fixa embaixo: no celular, é onde o polegar alcança.
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
