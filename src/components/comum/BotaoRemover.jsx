import { IconTrash } from "@tabler/icons-react";

/* Lixeira discreta para excluir itens das listas (fica vermelha no hover).
   O aria-label diz o que será removido, ex.: "Remover conta: Aluguel". */
export default function BotaoRemover({ onClick, title, descricao }) {
  return (
    <button
      type="button"
      className="btn-icone btn-icone--pequeno"
      onClick={onClick}
      title={title}
      aria-label={descricao ? `${title}: ${descricao}` : title}
    >
      <IconTrash size={18} aria-hidden="true" />
    </button>
  );
}
