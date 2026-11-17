import { GRAD_CONTAS, GRAD_PRIMARIO, S, T } from "../theme";

const ABAS = [
  { id: "geral", rotulo: "📊 Geral", gradiente: GRAD_PRIMARIO },
  { id: "contas", rotulo: "🏠 Contas", gradiente: GRAD_CONTAS },
];

/* Controle segmentado (pill): 📊 Geral | 🏠 Contas */
export default function NavegacaoPrincipal({ abaAtiva, onChange }) {
  return (
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
      {ABAS.map((aba) => {
        const ativa = abaAtiva === aba.id;
        return (
          <button
            key={aba.id}
            onClick={() => onChange(aba.id)}
            aria-pressed={ativa}
            style={{
              ...S.btn,
              flex: 1,
              background: ativa ? aba.gradiente : "transparent",
              color: ativa ? "#FFF" : T.textoSuave,
              borderRadius: 999,
            }}
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
