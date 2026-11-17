import { useRef, useState } from "react";
import { IconAlertTriangle, IconDownload, IconUpload } from "@tabler/icons-react";
import { CORES_CARTAO } from "../../cores";
import { IDS_CATEGORIAS } from "../../categorias";
import { baixarArquivo, diasDesde, gerarBackup, lerBackup, TAMANHO_MAXIMO } from "../../lib/backup";

function textoUltimoBackup(iso) {
  const dias = diasDesde(iso);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

/* Exportar/importar backup em JSON. A data do último backup e o
   "precisa de backup?" vêm do App, porque a barra de navegação
   também usa essa informação (bolinha de alerta em Ajustes). */
export default function BackupDados({ dados, ultimoBackup, precisaBackup, onExportado, onImportar }) {
  const inputArquivo = useRef(null);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }

  const exportar = () => {
    const { nomeArquivo, conteudo } = gerarBackup(dados);
    baixarArquivo(nomeArquivo, conteudo);
    onExportado(new Date().toISOString());
    setAviso({
      tipo: "ok",
      texto: `Backup salvo como "${nomeArquivo}". Guarde uma cópia fora do navegador (Drive, e-mail, outro aparelho).`,
    });
  };

  const importar = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!arquivo) return;

    if (arquivo.size > TAMANHO_MAXIMO) {
      setAviso({ tipo: "erro", texto: "Arquivo grande demais para ser um backup deste app." });
      return;
    }

    try {
      const texto = await arquivo.text();
      const { dados: novos, exportadoEm } = lerBackup(texto, {
        qtdGradientes: CORES_CARTAO.length,
        categorias: IDS_CATEGORIAS,
      });

      const quando = exportadoEm ? ` de ${new Date(exportadoEm).toLocaleDateString("pt-BR")}` : "";
      const resumo = `${novos.cartoes.length} cartão(ões), ${novos.compras.length} compra(s) e ${novos.gastos.length} conta(s)`;
      const ok = confirm(
        `Restaurar o backup${quando}? Ele tem ${resumo}.\n\n` +
          "Os dados atuais deste navegador serão SUBSTITUÍDOS. " +
          "Se quiser guardá-los, cancele e exporte um backup antes."
      );
      if (!ok) return;

      onImportar(novos);
      setAviso({ tipo: "ok", texto: `Backup restaurado: ${resumo}.` });
    } catch (err) {
      setAviso({ tipo: "erro", texto: err.message || "Não foi possível ler o arquivo." });
    }
  };

  return (
    <>
      <p className="rotulo" style={{ marginBottom: 12 }}>
        Tudo fica salvo só neste navegador, nada vai para a internet. Por isso os dados não
        aparecem em outros aparelhos e somem se você limpar os dados do navegador.
      </p>

      {precisaBackup ? (
        <div className="selo-alerta">
          <IconAlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            {ultimoBackup
              ? `Seu último backup foi ${textoUltimoBackup(ultimoBackup)}. Que tal fazer outro?`
              : "Você ainda não fez nenhum backup."}
          </span>
        </div>
      ) : (
        ultimoBackup && (
          <p className="rotulo" style={{ marginBottom: 12 }}>
            Último backup: {textoUltimoBackup(ultimoBackup)}.
          </p>
        )
      )}

      <div className="grade-2">
        <button type="button" className="btn btn--primario" onClick={exportar}>
          <IconDownload size={18} aria-hidden="true" />
          Exportar
        </button>
        <button type="button" className="btn" onClick={() => inputArquivo.current?.click()}>
          <IconUpload size={18} aria-hidden="true" />
          Importar
        </button>
      </div>
      <input
        ref={inputArquivo}
        type="file"
        accept="application/json,.json"
        onChange={importar}
        hidden
      />

      {/* role="status": o leitor de tela anuncia o resultado */}
      <p
        role="status"
        className={`aviso-status ${aviso?.tipo === "erro" ? "negativo" : "positivo"}`}
      >
        {aviso?.texto}
      </p>
    </>
  );
}
