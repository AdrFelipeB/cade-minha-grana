# Cadê Minha Grana?

Controle de cartões de crédito, parcelas e contas do mês — **sem vincular banco nenhum**.

Tudo roda no seu navegador: não há servidor, conta, login nem coleta de dados. As informações ficam salvas só no aparelho (`localStorage`) e você leva para outro aparelho com um arquivo de backup.

## O que dá para fazer

- **Cartões e compras parceladas**: informe o valor total e o número de parcelas; o app distribui nos meses certos ("Parcela 3 de 10"), com a última parcela ajustando os centavos.
- **Contas do mês**: fixas (aluguel, internet — repetem todo mês, com valor ajustável mês a mês) e avulsas (IPTU, uma taxa).
- **Marcar como pago**, item a item ou tudo de uma vez ("Pagar fatura", "Pagar todas"), com **Desfazer**.
- **Vencimentos**: "vence em 2 dias", "venceu há 3 dias" e a lista do que falta pagar ordenada pelo que vence primeiro.
- **Quanto sobra**: salário menos gastos do mês e quanto da renda está comprometido.
- **Próximos meses**: quanto do seu dinheiro já está comprometido em parcelas e contas — antes de parcelar mais alguma coisa.
- **Para onde vai a grana**: gastos por categoria.
- **Limite do cartão**: usado e disponível.
- **Modo discreto** para abrir o app em público, **tema claro/escuro** automático, layout próprio para **celular** e para **computador**, atalhos de teclado.
- **Funciona offline e instala na tela inicial** (PWA), sem loja de apps.
- **Backup em JSON**: exportar e importar (o app avisa quando faz tempo que você não exporta).

## Privacidade

- Nenhum dado sai do aparelho. Não há analytics, cookies de rastreamento nem chamadas para servidores.
- O site é publicado com uma **Content-Security-Policy** que só permite conexões com a própria origem (`connect-src 'self'`): o navegador bloquearia qualquer tentativa de enviar dados para outro lugar.
- ⚠️ Como os dados ficam só no navegador, **limpar os dados do navegador apaga tudo**, e eles **não sincronizam** entre aparelhos. Faça backup de vez em quando (Ajustes → Seus dados → Exportar).
- No iPhone, o app instalado na tela inicial guarda os dados **separados** do Safari: exporte no Safari e importe no app depois de instalar.

## Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) (versão LTS).

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Para testar no celular (mesmo Wi-Fi): `npm run dev -- --host` e abra o endereço "Network" que aparece no terminal.

> **Windows/PowerShell**: se aparecer "a execução de scripts foi desabilitada", use `npm.cmd run dev` ou rode uma vez `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (recarrega ao salvar). O modo offline/PWA fica desligado aqui. |
| `npm run build` | Gera a versão de produção em `dist/` (com service worker e manifest). |
| `npm run preview` | Serve o `dist/` em http://localhost:4173 com os mesmos cabeçalhos de segurança do site publicado — use para testar o PWA e o modo offline. |
| `npm run icones` | Gera os PNGs do app instalado a partir de `public/icone-app.svg`. |

## Publicar de graça na Vercel

1. Envie o projeto para um repositório no GitHub.
2. Entre em [vercel.com](https://vercel.com) com a sua conta do GitHub (plano **Hobby**, gratuito).
3. **Add New → Project**, escolha o repositório e clique em **Deploy**. A Vercel reconhece o Vite sozinha (comando `npm run build`, pasta `dist`).
4. Pronto: o site fica em `https://<nome-do-projeto>.vercel.app`. A cada `git push` na branch `main` a Vercel publica de novo, e cada outra branch ganha um link de prévia.

Os cabeçalhos de segurança ficam em `vercel.json` (e espelhados em `seguranca.config.js` para o `npm run preview`). Ao mudar um, mude o outro.

## Como o código está organizado

```
src/
  lib/          regras puras, sem React (meses, valores, parcelas, vencimentos, backup, análises)
  hooks/        estado persistido (useDados), totais do mês, layout, instalação do PWA
  components/   uma pasta por tela (resumo, contas, cartoes, ajustes) + layout/ e comum/
  App.jsx       estado de interface e ligação entre as telas
  index.css     todo o estilo (variáveis de tema claro/escuro + classes)
```

Feito com React 19 + Vite, ícones [Tabler](https://tabler.io/icons) e [vite-plugin-pwa](https://vite-pwa-org.netlify.app/).

## Licença

[MIT](LICENSE): pode usar, modificar e redistribuir, mantendo o aviso de copyright.
