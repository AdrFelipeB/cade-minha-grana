import { S, T } from "../../theme";

/* Botão "✕" vermelho usado para excluir itens das listas.
   O "✕" sozinho não diz nada a um leitor de tela; o aria-label diz
   o que será removido (ex.: "Remover conta: Aluguel"). */
export default function BotaoRemover({ onClick, title, descricao }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={descricao ? `${title}: ${descricao}` : title}
      style={{
        ...S.btn,
        background: "transparent",
        color: T.negativo,
        fontSize: 14,
        padding: "4px 6px",
      }}
    >
      ✕
    </button>
  );
}
