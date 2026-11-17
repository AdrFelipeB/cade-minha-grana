import CheckPago from "./CheckPago";

/* Linha de lista com check de pago à esquerda (contas e parcelas).
   - titulo: texto principal (fica riscado quando pago)
   - detalhe: linha secundária abaixo do título
   - children: lado direito (valor, botões) */
export default function LinhaItem({ pago, onTogglePago, titulo, detalhe, children }) {
  return (
    <div className={`linha${pago ? " linha--pago" : ""}`}>
      <CheckPago pago={pago} onClick={onTogglePago} descricao={titulo} />
      <div className="linha__principal">
        <div className="linha__titulo">{titulo}</div>
        {detalhe && <div className="linha__detalhe">{detalhe}</div>}
      </div>
      {children}
    </div>
  );
}
