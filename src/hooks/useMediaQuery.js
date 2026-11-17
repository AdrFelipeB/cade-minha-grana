import { useCallback, useSyncExternalStore } from "react";

/* Retorna true/false se a media query do CSS bate agora, e
   re-renderiza o componente quando isso muda (ex.: ao redimensionar
   a janela ou girar o tablet).

   useSyncExternalStore é o jeito "oficial" do React de ler um valor
   que vive fora dele (aqui, o navegador): recebe uma função para se
   inscrever nas mudanças e outra para ler o valor atual. */
export function useMediaQuery(query) {
  const inscrever = useCallback(
    (avisarReact) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", avisarReact);
      return () => mql.removeEventListener("change", avisarReact);
    },
    [query]
  );

  return useSyncExternalStore(inscrever, () => window.matchMedia(query).matches);
}

// Mesmo valor usado no CSS (index.css, seção DESKTOP)
export const QUERY_DESKTOP = "(min-width: 1024px)";
