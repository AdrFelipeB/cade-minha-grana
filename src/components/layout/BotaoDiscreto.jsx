import { IconEye, IconEyeOff } from "@tabler/icons-react";

/* Liga/desliga o modo discreto (valores viram "R$ •••••"). */
export default function BotaoDiscreto({ ligado, onAlternar, comTexto = false }) {
  const rotulo = ligado ? "Mostrar valores" : "Ocultar valores";
  return (
    <button
      type="button"
      className={comTexto ? "btn btn--pequeno" : "btn-icone"}
      onClick={onAlternar}
      aria-pressed={ligado}
      aria-label={comTexto ? undefined : rotulo}
      title={`${rotulo} (O)`}
    >
      {ligado ? <IconEyeOff size={20} aria-hidden="true" /> : <IconEye size={20} aria-hidden="true" />}
      {comTexto && rotulo}
    </button>
  );
}
