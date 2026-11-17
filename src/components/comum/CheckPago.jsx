import { IconCheck } from "@tabler/icons-react";

/* Check circular de "pago" usado em contas e parcelas.
   aria-pressed faz o leitor de tela anunciar "botão alternar, pressionado"
   (e o CSS usa o mesmo atributo para pintar o check de verde). */
export default function CheckPago({ pago, onClick, descricao }) {
  return (
    <button
      type="button"
      className="check"
      onClick={onClick}
      title={pago ? "Marcar como não pago" : "Marcar como pago"}
      aria-label={`${descricao}: pago`}
      aria-pressed={pago}
    >
      {pago && <IconCheck size={16} stroke={3} aria-hidden="true" />}
    </button>
  );
}
