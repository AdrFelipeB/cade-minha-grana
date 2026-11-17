import { IconPencil } from "@tabler/icons-react";

/* Lápis discreto para abrir a edição de um item.
   (Excluir fica dentro da edição, com "Desfazer" — a linha fica mais limpa.) */
export default function BotaoEditar({ onClick, descricao }) {
  return (
    <button
      type="button"
      className="btn-icone btn-icone--pequeno btn-icone--editar"
      onClick={onClick}
      title="Editar"
      aria-label={`Editar ${descricao}`}
    >
      <IconPencil size={18} aria-hidden="true" />
    </button>
  );
}
