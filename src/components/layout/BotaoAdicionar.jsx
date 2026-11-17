import { IconPlus } from "@tabler/icons-react";

/* Botão redondo "+" flutuante: lançar algo está sempre no mesmo lugar. */
export default function BotaoAdicionar({ onClick, rotulo }) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={rotulo} title={rotulo}>
      <IconPlus size={28} stroke={2.2} aria-hidden="true" />
    </button>
  );
}
