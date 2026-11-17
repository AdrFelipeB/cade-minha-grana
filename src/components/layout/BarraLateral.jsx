import { IconLock, IconPlus, IconWallet } from "@tabler/icons-react";
import { NOME_APP } from "../../marca";
import { TELAS } from "./telas";

/* Menu lateral fixo (desktop): marca, ação principal e as 4 telas. */
export default function BarraLateral({ tela, onChange, alertaAjustes, onAdicionar, rotuloAdicionar }) {
  return (
    <aside className="lateral">
      <div className="lateral__marca">
        <span className="lateral__logo" aria-hidden="true">
          <IconWallet size={20} />
        </span>
        {NOME_APP}
      </div>

      <button type="button" className="btn btn--primario btn--bloco" onClick={onAdicionar}>
        <IconPlus size={18} aria-hidden="true" />
        {rotuloAdicionar}
      </button>

      <nav className="lateral__nav" aria-label="Principal">
        {TELAS.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            className="lateral__item"
            aria-current={tela === id ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icone size={20} aria-hidden="true" />
            {rotulo}
            {id === "ajustes" && alertaAjustes && (
              <span className="lateral__alerta" title="Faça um backup dos seus dados" />
            )}
          </button>
        ))}
      </nav>

      <p className="lateral__rodape">
        <IconLock size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
        Seus dados ficam só neste aparelho.
      </p>
    </aside>
  );
}
