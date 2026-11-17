import { IconLock } from "@tabler/icons-react";
import BackupDados from "./BackupDados";
import CampoSalario from "./CampoSalario";

/* Salário e backup. No celular, uma coluna; no desktop, lado a lado
   (o título da página fica na barra do topo). */
export default function TelaAjustes({
  dados,
  desktop = false,
  focarSalario,
  onSalvarSalario,
  ultimoBackup,
  precisaBackup,
  onExportado,
  onImportar,
}) {
  return (
    <>
      {!desktop && (
        <div className="topo-tela" style={{ marginTop: 16 }}>
          <h1>Ajustes</h1>
        </div>
      )}

      <div className={desktop ? "grade-ajustes" : undefined}>
        <div>
          <h2 className="secao-titulo">Renda</h2>
          <section className="card">
            <CampoSalario salario={dados.salario} onSalvar={onSalvarSalario} autoFocus={focarSalario} />
          </section>
        </div>

        <div>
          <h2 className="secao-titulo">Seus dados</h2>
          <section className="card">
            <BackupDados
              dados={dados}
              ultimoBackup={ultimoBackup}
              precisaBackup={precisaBackup}
              onExportado={onExportado}
              onImportar={onImportar}
            />
          </section>
        </div>
      </div>

      {!desktop && (
        <p className="rotulo" style={{ display: "flex", gap: 8, alignItems: "center", margin: "20px 2px" }}>
          <IconLock size={16} aria-hidden="true" />
          Meus Gastos não usa banco, conta nem internet: seus dados nunca saem deste aparelho.
        </p>
      )}
    </>
  );
}
