import { IconAlertTriangle, IconClock } from "@tabler/icons-react";

const CLASSES = {
  atrasado: "selo selo--perigo",
  hoje: "selo selo--alerta",
  breve: "selo selo--alerta",
  normal: "selo",
  pago: "selo",
};

/* "vence em 3 dias", "venceu há 2 dias"…
   Cor de status sempre acompanhada de ícone + texto (nunca só a cor). */
export default function SeloVencimento({ situacao }) {
  if (!situacao) return null;
  const { tipo, texto } = situacao;
  return (
    <span className={CLASSES[tipo]}>
      {tipo === "atrasado" && <IconAlertTriangle size={12} aria-hidden="true" />}
      {(tipo === "hoje" || tipo === "breve") && <IconClock size={12} aria-hidden="true" />}
      {texto}
    </span>
  );
}
