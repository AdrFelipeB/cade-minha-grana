import { labelMes } from "../../lib/meses";
import { GRAD_PRIMARIO, S } from "../../theme";
import VazioMsg from "../comum/VazioMsg";
import CartaoVisual from "./CartaoVisual";
import FormCompra from "./FormCompra";
import ItemParcela from "./ItemParcela";

export default function AbaCartao({
  cartao,
  mesAtual,
  resumo,
  mostrarForm,
  onToggleForm,
  form,
  onFormChange,
  onSalvarForm,
  onRemoverCartao,
  onTogglePago,
  onRemoverCompra,
}) {
  const { parcelasDoMesPorCartao, isPago } = resumo;
  const { itens, subtotal } = parcelasDoMesPorCartao[cartao.id] || { itens: [], subtotal: 0 };
  const pago = itens.filter((p) => isPago(p.id)).reduce((s, p) => s + p.valorParcela, 0);

  return (
    <>
      <CartaoVisual
        cartao={cartao}
        mesAtual={mesAtual}
        subtotal={subtotal}
        pago={pago}
        onRemover={onRemoverCartao}
      />

      <button
        onClick={onToggleForm}
        aria-expanded={mostrarForm}
        style={{ ...S.btn, background: GRAD_PRIMARIO, color: "#FFF", marginBottom: 14 }}
      >
        + Nova compra
      </button>

      {mostrarForm && <FormCompra valores={form} onChange={onFormChange} onSalvar={onSalvarForm} />}

      {itens.length === 0 ? (
        <VazioMsg texto={`Nenhum lançamento em ${labelMes(mesAtual)} para este cartão.`} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {itens.map((p) => (
            <ItemParcela
              key={p.id}
              parcela={p}
              pago={isPago(p.id)}
              onTogglePago={() => onTogglePago(p.id)}
              onRemover={() => onRemoverCompra(p.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
