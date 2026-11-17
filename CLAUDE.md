# Cadê Minha Grana? — Gerenciador de Cartões e Contas

## O que é este projeto

**Nome do app: "Cadê Minha Grana?"** (escolhido em nov/2026; antes era "Meus Gastos"). O nome exibido fica em `src/marca.js` (`NOME_APP`). Os identificadores internos **continuam** `meus-gastos` (`APP_ID` do backup, nome da pasta/pacote) e `gerenciador-cartoes` (chave do localStorage) — não renomear, senão dados salvos e backups antigos deixam de ser reconhecidos.

App web pessoal (ReactJS) para controle de gastos de cartão de crédito e contas mensais, **sem vincular banco nenhum**. Tudo roda 100% no navegador com `localStorage` — sem backend, sem servidor, sem custo. Projeto pessoal, de código aberto (licença MIT), publicado gratuitamente na Vercel. Contexto pessoal do autor, quando existir, fica em `CLAUDE.local.md` (fora do Git).

**Idioma:** todo o app, commits, comentários e conversa são em **português (pt-BR)**. Valores em BRL via `Intl.NumberFormat("pt-BR")`.

## Estado atual

Projeto Vite + React 19 (JavaScript), já usando `localStorage`. Rodar com `npm run dev` (porta 5173). O protótipo original de arquivo único (`gerenciador-cartoes.jsx`, na raiz) ficou só como referência histórica — não é importado pelo app.

Estrutura de `src/`:
- `lib/` — funções puras, sem React: `storage.js` (load/save), `meses.js` (helpers "YYYY-MM"), `valores.js` (`brl`, `parseValor`, `calcularParcelas`, `uid`), `regras.js` (parcela/conta do mês, override, limpeza de retenção).
- `hooks/useDados.js` — estado persistido + todas as ações que alteram dados (validação e arredondamento ficam aqui).
- `hooks/useResumoDoMes.js` — totais derivados do mês visualizado e histórico.
- `index.css` — **todo o estilo**: variáveis de tema (claro/escuro automático) + classes de componente (`.card`, `.linha`, `.btn`, `.input`, `.sheet`…). Estilo inline só para valores dinâmicos (cor do cartão, largura de barra).
- `cores.js` — cores dos cartões (`CORES_CARTAO`, `corCartao`) e da barra de comprometimento.
- `hooks/useMediaQuery.js` — lê uma media query do CSS (via `useSyncExternalStore`); decide celular × desktop.
- `components/` — `layout/` (SeletorMes, BarraNavegacao, BotaoAdicionar, BarraLateral, `telas.js`), `comum/` (Sheet, LinhaItem, CheckPago, BotaoRemover, EstadoVazio), uma pasta por tela: `resumo/`, `contas/`, `cartoes/` (lista, detalhe, forms de compra e cartão), `ajustes/` (salário e backup), mais `EscolhaLancamento`.
- `App.jsx` — só estado de interface (tela, cartão aberto, mês, painel aberto, rascunhos dos forms, edição de override). Rascunhos ficam no App de propósito, para sobreviver a fechar o painel sem salvar.

**Dois layouts**, escolhidos em `App.jsx` por `useMediaQuery(QUERY_DESKTOP)` (≥ 1024px; mesmo valor nas regras da seção DESKTOP do `index.css`). Ao mexer numa tela, verifique as duas versões.

- **Celular** (< 1024px, coluna de 560px): barra inferior com 4 telas (Resumo · Contas · Cartões · Ajustes); botão "+" flutuante contextual (Contas → nova conta; detalhe de cartão → nova compra nele; senão pergunta o que lançar). Cartões: lista → toca → detalhe com "voltar".
- **Desktop** (≥ 1024px): menu lateral (`layout/BarraLateral.jsx`) com o botão de lançamento contextual no lugar do "+"; título da tela + seletor de mês numa barra no topo. Resumo (`resumo/ResumoDesktop.jsx`): 4 indicadores (2×2 abaixo de 1280px), origens + "A pagar no mês" (marcar pago ali pede confirmação inline, pois o item some da lista; Esc cancela) à esquerda, gráfico de barras CSS dos últimos meses à direita. Contas: lista + coluna com total e formulário de nova conta sempre aberto. Cartões (`cartoes/CartoesDesktop.jsx`): mestre-detalhe, 1º cartão selecionado por padrão. Ajustes em 2 colunas. Entre 1024 e 1199px margens e colunas laterais ficam mais estreitas (o menu fica sempre com 248px para o nome caber numa linha).

Formulários abrem num `<dialog>` nativo (`comum/Sheet.jsx`) que sobe de baixo no celular e centraliza no desktop.

Acessibilidade: elementos clicáveis são `<button>`, labels ligados por `useId`/`htmlFor`, `aria-pressed` em toggles, `aria-current` na navegação, foco visível via `:focus-visible`, inputs com 16px (evita zoom no iPhone), `prefers-reduced-motion` respeitado.

## Funcionalidades já implementadas (não regredir nenhuma)

1. **Cartões**: cadastro com nome + final do cartão (4 dígitos, opcional). Cada cartão tem uma cor própria (bolinha, `CORES_CARTAO`); tela Cartões lista todos e abre o detalhe (fatura do mês).
2. **Navegação**: barra inferior Resumo · Contas · Cartões · Ajustes + botão "+" (ver "Estado atual").
3. **Compras parceladas**: ao cadastrar compra informa-se valor total + nº de parcelas + mês da 1ª parcela. O sistema distribui automaticamente nos meses seguintes ("Parcela 3/10"). Arredondamento: parcelas com `floor` em centavos e a **última parcela ajusta** para o total bater exato (`calcularParcelas`).
4. **Contas gerais** (aba Contas): gastos fora do cartão, com dois tipos:
   - **Fixa** (`tipo: "fixo"`): repete todo mês a partir de `mesInicio` até ser removida (aluguel, internet).
   - **Avulsa** (`tipo: "momentaneo"` — nome antigo mantido nos dados): só no mês escolhido (IPTU, taxa avulsa).
5. **Valor variável em conta fixa (override)**: conta fixa tem valor padrão + `overrides: { "YYYY-MM": valor }` por mês. Na UI, tocar no valor (sublinhado tracejado) edita só aquele mês (Enter salva, Esc cancela); valor sobrescrito fica âmbar com "padrão R$ X"; botão "Padrão" remove o override.
6. **Marcar como pago**: check circular por item (contas e parcelas), **por mês** — estrutura `pagos: { "YYYY-MM": [ids] }`. Item pago fica riscado/esmaecido. Painéis mostram "✓ Já pago R$ X · Falta pagar R$ Y" e progresso ("2/5 pagas").
7. **Salário × sobra**: salário mensal editado em Ajustes. O cartão de resumo mostra "sobra/faltam" (verde/vermelho) = salário − (cartões + contas) do mês visualizado, e **barra de comprometimento da renda** (verde <60%, âmbar <90%, vermelha ≥90%). Sem salário, mostra um link para informá-lo.
8. **Navegação por mês**: setas ‹ ›, limite de 3 meses no passado (`mesMinimo`), futuro livre (para ver parcelas vindouras). Link "Voltar para hoje".
9. **Histórico**: "Últimos meses" no Resumo (3 meses + atual), clicáveis, somando cartões + contas.
10. **Limpeza automática (retenção de 3 meses)**: no carregamento, remove compras totalmente quitadas há mais de 3 meses, gastos momentâneos antigos e entradas antigas de `pagos`/`overrides`. Contas fixas nunca expiram.
11. **Editar e excluir**: lápis em cada linha (compra, conta) e no cabeçalho do cartão abre o mesmo formulário em modo edição (estado `edicao` no App, separado dos rascunhos de criação). **Excluir fica dentro da edição** e não usa `confirm()`: exclui na hora e mostra o aviso flutuante com **Desfazer** (`comum/AvisoDesfazer.jsx`). Editar mantém o `id` (marcações de pago continuam).
12. **Desfazer**: ações em lote/destrutivas guardam `{ antes, depois }`; o aviso só aparece enquanto `dados === depois` (qualquer outra mudança o esconde, para não desfazer coisa nova). Ações do `useDados` retornam o novo estado para isso.
13. **Pagar tudo** (`comum/BotaoPagarTudo.jsx`, confirmação no lugar + Desfazer): "Pagar fatura" no detalhe do cartão, "Pagar todas" em Contas, "Pagar tudo" na lista A pagar do Resumo. Usa `marcarPagos(mes, ids)`.
14. **Vencimentos** (`lib/vencimentos.js`): dia opcional (1–31) em contas e cartões; dia maior que o mês vira o último dia. Selo "vence em N dias" (âmbar, ≤5 dias), "vence hoje", "venceu há N dias" (vermelho) — sempre ícone + texto. A lista A pagar ordena por vencimento.
15. **Categorias** (`src/categorias.js`, 10 fixas com ícone; `id` salvo nos dados nunca muda): em compras e contas, padrão "outros". Gráfico "Para onde vai a grana" = barras horizontais de uma cor, ordenadas (não rosca: 10 categorias não cabem numa paleta distinguível).
16. **Limite do cartão**: opcional; "limite usado" = parcelas do mês atual em diante, menos as do mês atual já pagas (`lib/analises.js`).
17. **Próximos meses** (`resumo/GraficoCompromissos.jsx`): barras empilhadas dos 6 meses seguintes (parcelas `--serie-1`, contas `--serie-2`) com linha tracejada do salário, detalhe no hover/foco e "Ver como tabela".
18. **Modo discreto**: olho (no cartão de resumo no celular, na barra do topo no desktop, tecla O) troca todo valor por "R$ •••••". Implementado como flag de módulo lida por `brl()`/`brlCurto()` em `lib/valores.js`; preferência salva em `gerenciador-cartoes:discreto`.
19. **Atalhos de teclado (desktop)**: N novo lançamento, ← → mês, 1–4 telas, O ocultar valores; ignorados em campos de texto e com painel aberto. Listados no rodapé do menu lateral.
20. **Ícone**: `public/favicon.svg` (carteira com "?", fundo índigo).
21. **PWA** (`vite-plugin-pwa`, config em `vite.config.js`): manifest + service worker (Workbox, `registerType: "prompt"`) — funciona offline e instala na tela inicial. `comum/AvisoAtualizacao.jsx` mostra "Nova versão · Atualizar". Ajustes → "App no celular" (`ajustes/SecaoInstalar.jsx` + `hooks/useInstalacao.js`): botão Instalar (Android/Chrome/Edge) ou passo a passo no iPhone (avisa que lá o app instalado tem dados separados do Safari). Ícones PNG gerados de `public/icone-app.svg` com `npm run icones`. O service worker só existe no build: teste com `npm run build && npm run preview`.
22. **Segurança**: CSP (`connect-src 'self'` — nenhum dado pode sair para outro site) e outros cabeçalhos em `vercel.json`, espelhados em `seguranca.config.js` (usado pelo `npm run preview`). Os dois precisam ficar iguais. Nada de script inline no `index.html` (a CSP bloquearia).

## Modelo de dados (chave `gerenciador-cartoes` no localStorage)

```js
{
  versao: 2, // VERSAO_DADOS em lib/storage.js; dados sem o campo = versão 1 (v1 → v2 só adicionou campos opcionais)
  cartoes: [{ id, nome, final, gradiente, diaVencimento?, limite? }], // gradiente = índice em CORES_CARTAO (nome herdado)
  compras: [{ id, cartaoId, descricao, valorTotal, parcelas, primeiroMes, categoria? }], // primeiroMes: "YYYY-MM"
  gastos:  [{ id, descricao, valor, tipo: "fixo"|"momentaneo", mesInicio?, mes?, overrides?, categoria?, diaVencimento? }],
  pagos:   { "YYYY-MM": [ids] },
  salario: number
}
```

Meses são sempre strings `"YYYY-MM"`; helpers: `addMeses`, `diffMeses`, `labelMes`, `hojeMes`. Entrada de valores aceita vírgula e ponto (`parseValor`).

**Ao mudar o formato dos dados**: suba `VERSAO_DADOS`, escreva a conversão da versão anterior e atualize a validação em `lib/backup.js` — backups antigos precisam continuar importáveis.

**Backup** (`lib/backup.js` + `components/ajustes/BackupDados.jsx`, na tela Ajustes; bolinha âmbar no ícone de Ajustes quando é hora de fazer backup): exporta `{ app: "meus-gastos", versao, exportadoEm, dados }` como `cade-minha-grana-backup-AAAA-MM-DD.json`. A importação valida campo a campo, aceita também o JSON cru do localStorage, recusa versões mais novas, pede confirmação e **substitui** (não mescla) os dados. A data do último backup fica na chave separada `gerenciador-cartoes:ultimo-backup`; após 30 dias (ou nunca) a UI mostra aviso âmbar.

## Identidade visual (manter)

Redesenhada em nov/2026: **limpa, minimalista e fácil de usar** (o visual antigo, escuro com gradientes roxo/rosa, foi abandonado).

- **Tema automático**: claro por padrão, escuro neutro quando o aparelho está no modo escuro (`prefers-color-scheme`). Toda cor é variável CSS em `index.css` — nunca usar hex direto em componente (exceto as cores dos cartões em `cores.js`, escolhidas para funcionar nos dois temas).
- Claro: fundo `#F5F6F8`, cards brancos, borda `#E5E7EB`. Escuro: fundo `#121418`, cards `#1B1E24`. **Um único destaque**: índigo (`#4F46E5` claro / `#818CF8` escuro).
- Sem gradientes, brilhos ou sombras decorativas (única sombra: botão "+"). Cor só com significado: verde = pago/sobra, âmbar = atenção/valor ajustado, vermelho = falta/remover.
- Fonte do sistema; números com `font-variant-numeric: tabular-nums` (classe `.num`).
- Ícones: `@tabler/icons-react` (traço), sem emoji na interface.
- Listas em cards com linhas divididas (não um card por item). Cada cartão identificado por uma bolinha de cor.
- **Gráficos**: cores de dados separadas das de interface (`--serie-1` azul, `--serie-2` laranja, validadas para daltonismo e contraste nos dois temas com o validador da skill `dataviz`). Toda série tem legenda, todo gráfico tem detalhe acessível (aria-label por barra, tabela opcional). Feitos só com HTML/CSS, sem biblioteca.

## Diretrizes de trabalho

- **Stack**: React com Vite (JavaScript; TypeScript é aceitável se proposto e aprovado). Sem backend.
- **Custo zero é requisito**: nada de serviços pagos, APIs com chave ou dependências que exijam servidor. Deploy alvo: Vercel/Netlify/GitHub Pages (grátis).
- **Privacidade é o diferencial do produto**: nenhum dado sai do aparelho do usuário. Nunca adicionar telemetria/analytics sem discutir antes.
- Mobile-first: boa parte do uso será no celular.
- Commits e mensagens em português.

## Roadmap (ideias já discutidas, em ordem sugerida)

1. ~~Trocar `window.storage` → `localStorage`~~ ✅
2. ~~Estruturar como projeto Vite + quebrar em componentes menores~~ ✅
3. ~~Exportar/importar backup em JSON, com aviso na UI~~ ✅
4. ~~PWA (manifest + service worker): instalável, offline~~ ✅
5. ~~Editar compras e contas já lançadas~~ ✅ (junto: vencimentos, categorias, limite, pagar tudo, desfazer, próximos meses, modo discreto, atalhos, ícone)
6. ~~Deploy gratuito com guia no README~~ ✅ (Vercel, publica a cada push na `main`)

Futuro/talvez: renda extra por mês (freelas, 13º), dia de fechamento por cartão (hoje só vencimento), testes automatizados (Vitest) para `lib/`, sincronização opcional via backend gratuito (Supabase/Firebase) — este último só se o app ganhar tração.

## ⚠️ Importante: o autor está aberto a ideias

O autor quer sugestões proativas de melhoria — de UX, arquitetura, features e código. Ao trabalhar em qualquer tarefa:

- Se notar uma melhoria relevante (usabilidade, acessibilidade, performance, organização), **sugira antes ou junto da entrega**, explicando o benefício em 1-2 frases.
- Para mudanças grandes ou que alterem comportamento/visual, **proponha e espere aprovação** antes de implementar.
- Para melhorias pequenas e óbvias (bug, acessibilidade básica, ajuste de contraste), pode aplicar direto e mencionar no resumo.
- Explique decisões técnicas de forma didática — o projeto também serve para aprender.
