import { IconCircleCheck, IconDeviceMobile, IconDownload, IconShare2 } from "@tabler/icons-react";
import { useInstalacao } from "../../hooks/useInstalacao";

/* Instalar o app na tela inicial (PWA). Mostra o que faz sentido para
   o aparelho: botão (Android/Chrome/Edge), instruções (iPhone) ou
   confirmação (já instalado). */
export default function SecaoInstalar() {
  const { podeInstalar, instalado, instalar, ehIOS } = useInstalacao();

  if (instalado) {
    return (
      <p className="rotulo" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <IconCircleCheck size={18} className="positivo" aria-hidden="true" />
        Você está usando o app instalado. Ele funciona mesmo sem internet.
      </p>
    );
  }

  return (
    <>
      <p className="rotulo" style={{ marginBottom: 12 }}>
        Instale na tela inicial para abrir como um aplicativo, em tela cheia e sem internet.
        Não precisa de loja de apps.
      </p>

      {podeInstalar && (
        <button type="button" className="btn btn--primario btn--bloco" onClick={instalar}>
          <IconDownload size={18} aria-hidden="true" />
          Instalar app
        </button>
      )}

      {!podeInstalar && ehIOS && (
        <>
          <ol className="passos">
            <li>
              Abra este site no <strong>Safari</strong>.
            </li>
            <li>
              Toque em <IconShare2 size={16} aria-label="Compartilhar" style={{ verticalAlign: -3 }} />{" "}
              <strong>Compartilhar</strong>.
            </li>
            <li>
              Escolha <strong>Adicionar à Tela de Início</strong>.
            </li>
          </ol>
          <div className="selo-alerta">
            <IconDeviceMobile size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              No iPhone, o app instalado guarda os dados separados do Safari. Antes de instalar,
              exporte um backup aqui e depois importe dentro do app.
            </span>
          </div>
        </>
      )}

      {!podeInstalar && !ehIOS && (
        <p className="rotulo">
          Se o botão de instalar não aparecer, abra pelo Chrome ou Edge (no celular, pelo menu ⋮ →
          “Instalar app” ou “Adicionar à tela inicial”).
        </p>
      )}
    </>
  );
}
