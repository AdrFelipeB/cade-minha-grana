import { brl } from "../../lib/valores";
import { botaoReset, S, T } from "../../theme";

/* Linha clicável da aba Geral com faixa colorida à esquerda
   (usada para "Contas do mês" e para cada cartão).
   É um <button> para funcionar com teclado e leitor de tela; por isso
   o conteúdo usa <span> (um <button> só pode conter elementos "de frase"). */
export default function LinhaResumo({ gradiente, titulo, subtitulo, valor, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...botaoReset,
        ...S.painel,
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: gradiente,
        }}
      />
      <span style={{ paddingLeft: 8 }}>
        {titulo}
        <span style={{ display: "block", fontSize: 12, color: T.textoSuave }}>{subtitulo}</span>
      </span>
      <span style={{ ...S.mono, fontWeight: 800, fontSize: 18 }}>{brl(valor)}</span>
    </button>
  );
}
