# Na Ponta da Agulha · Bárbara Gomes

Site da tatuadora **Bárbara Gomes** ([@napontadaagulha_tattoo](https://www.instagram.com/napontadaagulha_tattoo/)), blackwork autoral, estúdio privado no Ipiranga (SP).
Feito por [L R G Z](https://lrgz.com.br). Prévia: https://azeugral.github.io/na-ponta-da-agulha/ (noindex até ter domínio).

## Identidade
- **Breu, osso e fumaça.** Fundo `#0b0a0b`, texto `#e8e4dc`, um azul frio `#9fc3c0` só nos detalhes (o cabelo dela).
- **Cormorant Garamond** em caixa alta nos títulos (a mesma família dos posts “BÁRBARA · Sombra, arte e intenção” e “Artes disponíveis”), IBM Plex Sans no texto e JetBrains Mono nos rótulos.
- **Fumaça:** shader em `assets/js/fumaca.js`. Desktop roda ao vivo em WebGL; celular/toque toca o MP4 renderizado do mesmo shader. O orçamento usa sempre o vídeo deitado, invertido.
- Botões retos com canto chanfrado; o losango com a agulha (divisor das artes dela) é o favicon.
- Imagens entram “saindo da fumaça” (blur + brilho) ao rolar.

## Estrutura
- `index.html` + `assets/css/agulha.css` + `assets/js/agulha.js`
- `tools/processar.py` → recortes 4:5 em `assets/obras`, `assets/js/obras.js`, fotos em `assets/img`, favicons e `og.jpg`. Fontes: `../_ref/ig` e `../_ref/hl` (Instagram extraído em 14/10/2026).
- `tools/gerar_video.py` → `assets/video/fumaca-*.mp4` e o pôster.

## CONFIRMAR com a cliente
- [ ] **Valores das artes disponíveis:** R$ 350 (10 a 15 cm) veio do post de jul/2026 e dos destaques. Ainda vale? Quais já foram tatuadas?
- [ ] Artes do destaque sem valor (Tomie, Medusa, Oni, Andorinha, Coração de espinhos): estão disponíveis e por quanto?
- [ ] Seção **Traço fino**: manter (mostra a trajetória) ou tirar para focar só no blackwork?
- [ ] Texto do “Um novo capítulo” e a menção ao **@_tktattoos** como companheiro de estúdio.
- [ ] **Feedbacks:** autorização para usar os primeiros nomes (Carolina, Fernanda, Lia, Carolina) dos prints do destaque.
- [ ] Endereço/bairro exibido: “Ipiranga, SP” e “endereço enviado na confirmação”. Sinal para reservar? Horários?
- [ ] Foto principal da seção A artista (banco à noite) e foto do estúdio (sala clara).
- [ ] Domínio (tirar `noindex` e o `robots.txt` quando publicar de verdade).
