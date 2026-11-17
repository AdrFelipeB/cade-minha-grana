import { useId, useRef, useState } from "react";
import { baixarArquivo, gerarBackup, lerBackup, TAMANHO_MAXIMO } from "../lib/backup";
import { lerUltimoBackup, registrarUltimoBackup } from "../lib/storage";
import { GRAD_PRIMARIO, GRADIENTES_CARTAO, S, T } from "../theme";

const DIAS_PARA_LEMBRAR = 30;

function diasDesde(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function textoUltimoBackup(iso) {
  const dias = diasDesde(iso);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

/* Seção "Seus dados": explica que tudo fica só neste navegador
   e permite exportar/importar um backup em JSON. */
export default function BackupDados({ dados, onImportar }) {
  const tituloId = useId();
  const inputArquivo = useRef(null);
  const [ultimoBackup, setUltimoBackup] = useState(lerUltimoBackup);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }

  const temDados =
    dados.cartoes.length > 0 || dados.compras.length > 0 || dados.gastos.length > 0 || dados.salario > 0;
  const precisaBackup =
    temDados && (!ultimoBackup || diasDesde(ultimoBackup) > DIAS_PARA_LEMBRAR);

  const exportar = () => {
    const { nomeArquivo, conteudo } = gerarBackup(dados);
    baixarArquivo(nomeArquivo, conteudo);
    const agora = new Date().toISOString();
    registrarUltimoBackup(agora);
    setUltimoBackup(agora);
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
      setAviso({ tipo: "erro", texto: "Arquivo grande demais para ser um backup do Meus Gastos." });
      return;
    }

    try {
      const texto = await arquivo.text();
      const { dados: novos, exportadoEm } = lerBackup(texto, {
        qtdGradientes: GRADIENTES_CARTAO.length,
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

  const estiloBotao = { ...S.btn, flex: "1 1 160px" };

  return (
    <section aria-labelledby={tituloId} style={{ ...S.painel, marginTop: 32 }}>
      <h2 id={tituloId} style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>
        🔒 Seus dados
      </h2>
      <p style={{ fontSize: 13, color: T.textoSuave, margin: "0 0 10px", lineHeight: 1.5 }}>
        Tudo fica salvo <strong style={{ color: T.texto }}>só neste navegador</strong> — nada vai
        para a internet. Por isso os dados <strong style={{ color: T.texto }}>não aparecem em
        outros aparelhos</strong> e <strong style={{ color: T.texto }}>somem se você limpar os
        dados do navegador</strong>. Exporte um backup de vez em quando.
      </p>

      <div
        style={{
          fontSize: 12,
          marginBottom: 12,
          color: precisaBackup ? "#FDE68A" : T.textoSuave,
          fontWeight: precisaBackup ? 700 : 400,
        }}
      >
        {precisaBackup && "⚠️ "}
        {ultimoBackup
          ? `Último backup: ${textoUltimoBackup(ultimoBackup)}`
          : "Você ainda não fez nenhum backup."}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={exportar} style={{ ...estiloBotao, background: GRAD_PRIMARIO, color: "#FFF" }}>
          ⬇ Exportar backup
        </button>
        <button
          onClick={() => inputArquivo.current?.click()}
          style={{ ...estiloBotao, background: "#2C2650", color: T.texto }}
        >
          ⬆ Importar backup
        </button>
        <input
          ref={inputArquivo}
          type="file"
          accept="application/json,.json"
          onChange={importar}
          hidden
        />
      </div>

      {/* role="status" + aria-live: o leitor de tela anuncia o resultado */}
      <div
        role="status"
        aria-live="polite"
        style={{
          fontSize: 13,
          marginTop: aviso ? 10 : 0,
          color: aviso?.tipo === "erro" ? T.negativo : "#A7F3D0",
          lineHeight: 1.4,
        }}
      >
        {aviso?.texto}
      </div>
    </section>
  );
}
