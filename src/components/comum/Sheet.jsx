import { useEffect, useId, useRef } from "react";
import { IconX } from "@tabler/icons-react";

/* Painel que sobe de baixo (no computador, aparece centralizado).

   Usa o elemento nativo <dialog> com showModal(), que já resolve de
   graça o que é difícil fazer à mão num modal acessível:
   - prende o foco dentro do painel (Tab não "vaza" para a página atrás);
   - fecha com Esc (dispara o evento "close");
   - desenha o fundo escurecido (::backdrop) e bloqueia cliques atrás.

   O React controla se está aberto pela prop `aberto`; o efeito abaixo
   sincroniza isso com showModal()/close() do elemento. */
export default function Sheet({ aberto, onFechar, titulo, children }) {
  const ref = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={tituloId}
      onClose={onFechar}
      // Clique no fundo escurecido: o alvo é o próprio <dialog>
      onClick={(e) => e.target === ref.current && onFechar()}
    >
      {aberto && (
        <div className="sheet__conteudo">
          <div className="sheet__topo">
            <h2 id={tituloId}>{titulo}</h2>
            <button type="button" className="btn-icone" onClick={onFechar} aria-label="Fechar">
              <IconX size={20} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
