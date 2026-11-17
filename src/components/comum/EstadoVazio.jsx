/* Mensagem de lista vazia: um convite para começar, não um pedido de desculpas. */
export default function EstadoVazio({ titulo, texto, acao, onAcao }) {
  return (
    <div className="vazio">
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {acao && (
        <button type="button" className="btn btn--primario" onClick={onAcao}>
          {acao}
        </button>
      )}
    </div>
  );
}
