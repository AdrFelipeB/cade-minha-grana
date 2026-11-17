/* Mensagem de "lista vazia" com borda tracejada. */
export default function VazioMsg({ texto }) {
  return (
    <div
      style={{
        border: "1px dashed #4A4374",
        borderRadius: 14,
        padding: "28px 20px",
        textAlign: "center",
        color: "#9C94C4",
        fontSize: 14,
        marginBottom: 24,
      }}
    >
      {texto}
    </div>
  );
}
