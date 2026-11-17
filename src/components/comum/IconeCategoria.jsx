import { categoriaPorId } from "../../categorias";

/* Ícone pequeno da categoria, com o nome para leitores de tela e no hover. */
export default function IconeCategoria({ categoria, tamanho = 14 }) {
  const { nome, Icone } = categoriaPorId(categoria);
  return (
    <span className="icone-categoria" role="img" aria-label={nome} title={nome}>
      <Icone size={tamanho} aria-hidden="true" />
    </span>
  );
}
