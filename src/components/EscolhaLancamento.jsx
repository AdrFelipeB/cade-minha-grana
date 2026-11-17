import { IconCreditCard, IconReceipt } from "@tabler/icons-react";

/* Primeiro passo do "+": o que a pessoa quer lançar. */
export default function EscolhaLancamento({ temCartao, onCompra, onConta }) {
  return (
    <>
      <button type="button" className="opcao" onClick={onCompra}>
        <span className="opcao__icone">
          <IconCreditCard size={22} aria-hidden="true" />
        </span>
        <span>
          <strong style={{ display: "block", fontWeight: 600 }}>Compra no cartão</strong>
          <span className="rotulo">
            {temCartao ? "À vista ou parcelada" : "Primeiro, cadastre um cartão"}
          </span>
        </span>
      </button>
      <button type="button" className="opcao" onClick={onConta}>
        <span className="opcao__icone">
          <IconReceipt size={22} aria-hidden="true" />
        </span>
        <span>
          <strong style={{ display: "block", fontWeight: 600 }}>Conta</strong>
          <span className="rotulo">Aluguel, luz, internet, IPTU…</span>
        </span>
      </button>
    </>
  );
}
