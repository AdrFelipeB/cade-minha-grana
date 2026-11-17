import { T } from "../theme";

export default function Cabecalho() {
  return (
    <header style={{ marginBottom: 20 }}>
      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(90deg, #C4B5FD, #F0ABFC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Meus Gastos
      </h1>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textoSuave }}>
        Cartões, contas e parcelas sob controle — sem vincular banco nenhum.
      </p>
    </header>
  );
}
