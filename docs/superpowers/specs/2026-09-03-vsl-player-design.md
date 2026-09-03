# V Infinitum — VSL Player + Dashboard — Design Spec

Data: 2026-09-03

## Objetivo

Clone funcional do VTurb (player de VSL com dashboard de gerenciamento), sem
backend e sem custo de licença, com a identidade visual da marca Infinitum
(paleta alquímica dark/dourada em vez do estilo light/azul genérico do
VTurb). Referência funcional completa: guia
`Crie seu proprio VTurb com Claude Code.md`.

## Escopo

Dois arquivos HTML estáticos, sem framework, sem build step:

- `index.html` — dashboard de gerenciamento (SPA de página única, tudo em
  HTML+CSS+JS puro)
- `player.html` — player de vídeo embedável, configurado via query params

Persistência via `localStorage` (sem backend). Deploy alvo: Vercel (estático).

## Branding (Infinitum)

Paleta oficial:

| Token | Hex | Uso |
|---|---|---|
| `--bg` (Nigredo Deep Black) | `#0A0A0A` | fundo principal |
| `--gold` (Alchemical Gold) | `#D4AF37` | cor de ação/destaque, default de barra de progresso e CTA |
| `--gold-warm` | `#C38B2F` | hover/estados sobre dourado |
| `--gold-aged` | `#B8973E` | variação secundária |
| `--purple` (Imperial Purple) | `#5C2A7E` | acento secundário (badges, gráficos) |
| `--crimson` (Alchemical Crimson) | `#9B1C2C` | acento secundário/alerta |
| `--cream` (Albedo Cream) | `#F8F6F0` | texto principal sobre fundo escuro / superfícies claras pontuais |
| `--silver` (Moon Silver) | `#E5E0D8` | texto secundário, bordas sutis |

Tipografia: Inter (sans-serif geométrica), com tracking largo em
títulos/wordmark. Wordmark "INFINITUM" em caixa alta.

Logo: ícone SVG inline minimalista de Ouroboros — anel dourado formando um
círculo, gradiente sutil de dourado para um toque de roxo/carmesim próximo à
"cabeça", orbe central luminoso pequeno. Usado no header do dashboard e como
favicon (data URI SVG, sem arquivo de imagem externo). Sem detalhes
fantasiosos — traço fino, minimalista, consistente com o restante do design.

O dashboard é predominantemente escuro/premium (não usa o cinza-claro
`#f5f6f8` do VTurb original); cards usam tons escuros com bordas sutis em
`--silver`/dourado translúcido em vez de branco puro.

## `index.html` — Dashboard

- **Header**: logo Ouroboros + wordmark "INFINITUM", avatar de usuário
  (placeholder).
- **Sidebar**: Meus Vídeos, Segurança, Configurações.
- **Lista de vídeos**: tabela com thumbnail, nome, data, plays, ações
  (analytics, embed, excluir). Abas: Biblioteca / Top vídeos / Lixeira.
- **Upload**: modal com drag & drop de arquivo + campo de URL (aceita blob
  URL local via `URL.createObjectURL` e URL direta de vídeo).
- **Editor de vídeo** (ao clicar num vídeo da lista):
  - Painel esquerdo de configuração, replicando as seções do VTurb:
    - Estilo: cor principal, background, cantos arredondados, toggles de
      controles (play grande, play pequeno, desativar pause, barra de
      progresso, tempo, voltar/avançar 10s, volume, fullscreen, velocidade)
    - Progresso Inteligente: toggle, cor da barra, altura
    - Smart Autoplay: toggle, texto overlay, trecho inicial
    - Botões de Ação (CTA): toggle, texto, link de checkout, tempo pra
      aparecer (s), cor, subtexto
    - Continuar Assistindo: toggle, mensagem, botões continuar/reiniciar,
      cores
    - Pixels: toggle, pixel ID, percentuais de disparo
    - Opções de Reprodução: smart pause, recomeçar, velocidade
      (auto/baixa/média/alta), fullscreen (desktop/mobile)
  - Painel direito: preview do player em `<iframe>` apontando pro
    `player.html` com os params atuais, toggle Desktop/Mobile.
  - Botão "Embed" no topo.
- **Modal de Embed**: toggle Vídeo Responsivo, abas
  Recomendado/JavaScript/iFrame, código gerado, link direto, preview,
  botão copiar.
- Tudo persistido em `localStorage` (lista de vídeos + config por vídeo).

## `player.html` — Player

- Autoplay mutado; clique desmuta.
- Sem controles nativos do navegador (`controls` removido, controles custom).
- Barra de progresso custom, seekable, cor configurável (default
  `--gold`).
- Botão CTA que aparece no tempo configurado, cor configurável (default
  `--gold`), com link de checkout.
- Texto "Toque para ativar o som", some após 3–5s.
- Continuar assistindo: salva posição em `localStorage`, oferece
  continuar/reiniciar ao recarregar.
- Pixels: dispara evento (ex. `console.log`/`window` custom event, sem
  dependência externa) nos percentuais assistidos configurados.
- Fundo preto, responsivo, sem download nem controle de velocidade nativo.
- Recebe config via query params: `v, poster, cta_url, cta_text, cta_time,
  bar_color, cta_color, cta_sub, mute_text, autoplay`.
- Teclado: espaço (play/pause), setas (avançar/voltar).

## Integração dashboard ↔ player

O botão "Embed" do dashboard gera o `<iframe>`/script apontando para
`player.html` com os query params montados a partir da config salva daquele
vídeo no `localStorage`.

## Fora de escopo

- Backend, autenticação real, upload para storage externo.
- Analytics real (fica como placeholder de UI).
- Testes automatizados (projeto é HTML/CSS/JS estático sem framework de
  build/test).

## Verificação

- Servir localmente com `npx http-server -p 3000` e testar manualmente:
  upload, edição de config, preview ao vivo, geração de embed, e o
  `player.html` standalone com params na URL.
- Deploy de verificação com `npx vercel --prod` (opcional, só quando o
  usuário pedir).
