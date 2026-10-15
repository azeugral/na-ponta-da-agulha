(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ZAP = '5511985407944';
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zap = msg => `https://wa.me/${ZAP}?text=${encodeURIComponent(msg)}`;

  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ===== grades de obras (assets/js/obras.js, gerado por tools/processar.py) ===== */
  const LISTA = [];
  $$('.grade[data-grupos]').forEach(ol => {
    const disp = ol.id === 'grade-disp';
    ol.dataset.grupos.split(',').forEach(g => (window.OBRAS[g] || []).forEach(o => {
      const i = LISTA.push({ o, grade: ol.id }) - 1;
      const li = document.createElement('li');
      li.className = 'obra revela';
      const img = `<img src="assets/obras/${o.id}-640.webp" srcset="assets/obras/${o.id}-640.webp 640w, assets/obras/${o.id}-1280.webp 1280w" sizes="(max-width: 760px) 50vw, 25vw" width="640" height="800" alt="${o.leg}" loading="lazy" decoding="async">`;
      const btn = `<button type="button" data-i="${i}" aria-label="Ampliar: ${o.leg}">${img}</button>`;
      if (disp) {
        li.innerHTML = btn + `<div class="obra-info"><p class="obra-leg"><span>${o.leg}</span></p>${o.valor ? `<span class="valor">${o.valor}</span>` : ''}</div>` +
          `<a class="quero" href="${zap(`Oi, Bárbara! Vi no site a arte disponível “${o.leg}” e quero tatuar.`)}" target="_blank" rel="noopener">Quero esta arte</a>`;
      } else {
        li.innerHTML = btn + `<p class="obra-leg"><span>${o.leg}</span></p>`;
      }
      ol.appendChild(li);
    }));
  });

  /* ===== lupa ===== */
  const lupa = $('#lupa'), lImg = $('img', lupa), lLeg = $('figcaption', lupa);
  let atual = -1, grupo = [], ultimoFoco = null;
  function mostrar(i) {
    atual = i;
    const { o } = LISTA[i];
    lImg.src = `assets/obras/${o.id}-1280.webp`; lImg.alt = o.leg;
    lLeg.textContent = o.leg + (o.valor ? ` · ${o.valor}` : '');
  }
  function abrir(i) {
    grupo = LISTA.map((x, k) => k).filter(k => LISTA[k].grade === LISTA[i].grade);
    ultimoFoco = document.activeElement;
    mostrar(i);
    lupa.hidden = false;
    requestAnimationFrame(() => lupa.classList.add('aberta'));
    document.body.style.overflow = 'hidden';
    $('.lupa-fechar', lupa).focus();
  }
  function fechar() {
    lupa.classList.remove('aberta');
    document.body.style.overflow = '';
    setTimeout(() => { lupa.hidden = true; }, 300);
    if (ultimoFoco) ultimoFoco.focus();
  }
  function passo(d) { const p = grupo.indexOf(atual); mostrar(grupo[(p + d + grupo.length) % grupo.length]); }
  document.addEventListener('click', e => { const b = e.target.closest('.obra button'); if (b) abrir(+b.dataset.i); });
  $('.lupa-fechar', lupa).addEventListener('click', fechar);
  $('.ant', lupa).addEventListener('click', () => passo(-1));
  $('.prox', lupa).addEventListener('click', () => passo(1));
  lupa.addEventListener('click', e => { if (e.target === lupa || e.target.tagName === 'FIGURE') fechar(); });
  document.addEventListener('keydown', e => {
    if (lupa.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'ArrowLeft') passo(-1);
    if (e.key === 'ArrowRight') passo(1);
  });
  let x0 = null;
  lupa.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lupa.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) passo(dx < 0 ? 1 : -1); x0 = null; });

  /* ===== revelação ao rolar ===== */
  const revelar = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visto'); revelar.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.revela').forEach((el, k) => {
    const irmaos = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.transitionDelay = (Math.min(irmaos % 4, 3) * 0.08) + 's';
    revelar.observe(el);
  });

  /* ===== topo, menu e botão flutuante ===== */
  const topo = $('#topo'), flut = $('.flutuante'), hero = $('.hero'), orc = $('#orcamento');
  let heroVisivel = true, orcVisivel = false;
  function rolar() { topo.classList.toggle('solido', scrollY > 30); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; flutuar(); }).observe(hero);
  new IntersectionObserver(([e]) => { orcVisivel = e.isIntersecting; flutuar(); }, { threshold: .15 }).observe(orc);
  function flutuar() { flut.classList.toggle('ativo', !heroVisivel && !orcVisivel); }

  const gaveta = $('#gaveta'), menuBtn = $('.menu-btn');
  function menu(abre) {
    gaveta.classList.toggle('aberta', abre);
    gaveta.setAttribute('aria-hidden', !abre);
    menuBtn.setAttribute('aria-expanded', abre);
    document.body.style.overflow = abre ? 'hidden' : '';
    if (abre) $('.fechar', gaveta).focus(); else menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', () => menu(true));
  $('.fechar', gaveta).addEventListener('click', () => menu(false));
  $$('nav a', gaveta).forEach(a => a.addEventListener('click', () => menu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && gaveta.classList.contains('aberta')) menu(false); });

  /* item ativo do menu */
  const links = $$('.topo nav a');
  const secoes = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const ioMenu = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach(s => ioMenu.observe(s));

  /* ===== orçamento: monta a mensagem e abre o WhatsApp ===== */
  const form = $('#form-orc'), aviso = $('#form-aviso');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const campoIdeia = form.ideia.closest('.campo');
    if (!d.ideia.trim()) {
      campoIdeia.classList.add('erro');
      aviso.textContent = 'Conte pelo menos a ideia da tattoo.';
      form.ideia.focus();
      return;
    }
    campoIdeia.classList.remove('erro');
    const linhas = [`Oi, Bárbara! ${d.nome.trim() ? `Aqui é ${d.nome.trim()}. ` : ''}Vim pelo site e quero um orçamento.`, '', `Ideia: ${d.ideia.trim()}`];
    if (d.local.trim()) linhas.push(`Local do corpo: ${d.local.trim()}`);
    if (d.tamanho) linhas.push(`Tamanho: ${d.tamanho}`);
    aviso.textContent = 'Abrindo o WhatsApp…';
    window.open(zap(linhas.join('\n')), '_blank', 'noopener');
  });
  form.ideia.addEventListener('input', () => form.ideia.closest('.campo').classList.remove('erro'));

  /* ===== fumaça =====
     Desktop: WebGL ao vivo (fumaca.js). Toque/celular: MP4 renderizado do mesmo shader.
     O orçamento usa sempre o vídeo deitado, que só carrega quando a seção chega perto. */
  const tela = $('#fumaca'), video = $('#fumaca-video');
  const celular = matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)');
  const deitado = matchMedia('(orientation: landscape)');
  let glAtivo = false, videoAtivo = false;
  const tocar = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  function escolherFundo() {
    if (celular.matches) { if (!videoAtivo) iniciarVideo(); }
    else if (!glAtivo && !iniciarGL()) { if (!videoAtivo) iniciarVideo(); }
  }
  function iniciarVideo() {
    videoAtivo = true;
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('pronto'), { once: true });
    trocarVideo();
    (deitado.addEventListener ? deitado.addEventListener('change', trocarVideo) : deitado.addListener(trocarVideo));
  }
  function trocarVideo() {
    const src = deitado.matches || !celular.matches ? video.dataset.deitado : video.dataset.emPe;
    if (video.getAttribute('src') !== src) video.src = src;
    tocar(video);
  }
  function iniciarGL() {
    if (!window.fumacaGL) return false;
    const f = window.fumacaGL(tela);
    if (!f) return false;
    glAtivo = true;
    const PERIODO = 20, RAIO = .3;
    function medir() {
      const w = Math.max(1, Math.round(tela.clientWidth * .55)), h = Math.max(1, Math.round(tela.clientHeight * .55));
      if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; }
    }
    medir(); addEventListener('resize', medir);
    let visivel = true;
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(hero);
    const t0 = performance.now();
    function quadro(agora) {
      if (visivel && !celular.matches) {
        medir();
        f.desenhar(reduz ? 1 : ((agora - t0) / 1000 / PERIODO) * Math.PI * 2, RAIO);
        tela.classList.add('pronto');
      }
      if (!reduz) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
    return true;
  }
  escolherFundo();
  (celular.addEventListener ? celular.addEventListener('change', escolherFundo) : celular.addListener(escolherFundo));

  const orcVideo = $('#orc-video');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!orcVideo.src) {
        orcVideo.muted = true; orcVideo.src = orcVideo.dataset.src;
        orcVideo.addEventListener('playing', () => orcVideo.classList.add('pronto'), { once: true });
      }
      if (!reduz) tocar(orcVideo);
    } else if (orcVideo.src) orcVideo.pause();
  }, { rootMargin: '200px 0px' }).observe(orc);
})();
