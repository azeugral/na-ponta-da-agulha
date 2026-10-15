"""Gera as imagens do site a partir de ../_ref/ig e ../_ref/hl
(Instagram @napontadaagulha_tattoo, extraído em 14/10/2026).
- obras em assets/obras (640 e 1280 px, recorte 4:5) + assets/js/obras.js
- fotos de apoio em assets/img, favicons e og.jpg
Uso: python tools/processar.py  (com --folha gera só a folha de conferência dos recortes)"""
import os, sys, json
from PIL import Image, ImageDraw, ImageFont, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(AQUI)
REF = os.path.join(os.path.dirname(SITE), '_ref')
IMG = os.path.join(SITE, 'assets', 'img')
OBRAS = os.path.join(SITE, 'assets', 'obras')

# (arquivo, centro vertical do recorte 0–1, legenda) — recorte 4:5 na largura toda
PELE = [
    ('ig/01_DeX_p2zxq8N_0.jpg', .50, 'Ceifador no antebraço'),
    ('ig/03_DeNR4l3hCGg_0.jpg', .45, 'Perséfone e sua romã'),
    ('ig/17_DatVooxBI0q_0.jpg', .42, 'Bruxa e gato preto'),
    ('ig/18_Danux3FBhYb_0.jpg', .48, 'A Imperatriz, carta de tarô'),
    ('ig/14_DbBF8oSRQTt_0.jpg', .48, 'Hécate'),
    ('ig/00_Dec3xhEtErB_0.jpg', .45, 'Caveira e folhagem, flash'),
    ('ig/19_DajVJoYRLc8_0.jpg', .45, 'Fechamento de braço em 4 sessões'),
    ('ig/05_Dd2GffokTvd_0.jpg', .40, 'Avenged Sevenfold redesenhado na mão'),
    ('ig/05_Dd2GffokTvd_1.jpg', .40, 'Caveira alada, a mão fechada'),
]
PAPEL = [
    ('ig/21_DaTF_K5xCNT_0.jpg', .55, 'Ceifador e lanterna para antebraço'),
    ('ig/16_DagaJwZxIHB_0.jpg', .55, 'Composição autoral em blackwork'),
    ('ig/02_DeSddq-GrUj_2.jpg', .50, 'Decalque de fechamento'),
]
# disponíveis: (arquivo, centro, legenda, valor)
DISP = [
    ('ig/10_DbbUE3ERQTb_0.jpg', .45, 'Tomie, para fãs de Junji Ito', ''),
    ('ig/12_DbN4mBTkdcL_1.jpg', .50, 'Olho que escorre', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_2.jpg', .50, 'Prancheta de Ouija', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_3.jpg', .50, 'Coração de olhos abertos', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_4.jpg', .50, 'Boca e aranha', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_5.jpg', .50, 'Caveira de asas', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_6.jpg', .50, 'Mão que vê', 'R$ 350'),
    ('ig/12_DbN4mBTkdcL_7.jpg', .50, 'Olho de espinhos', 'R$ 350'),
    ('hl/disp_10.jpg', (.45, .40, .8), 'Medusa geométrica', ''),
    ('hl/disp_11.jpg', (.45, .40, .8), 'Oni entre flores', ''),
    ('hl/disp_12.jpg', (.45, .40, .8), 'Andorinha', ''),
    ('hl/disp_17.jpg', (.45, .40, .8), 'Coração de espinhos', ''),
]
FINO = [
    ('ig/31_DO8rtXHjizx_1.jpg', .45, 'Onça entre flores'),
    ('ig/39_DIgX8cQsSLA_0.jpg', .50, 'Onça-pintada em fineline'),
    ('ig/41_DIbOSpNs0Gi_1.jpg', .55, 'Ísis'),
    ('ig/42_DIYpfb8sJXh_0.jpg', .45, 'Brutus'),
    ('ig/32_DOj8BacEZUt_0.jpg', .45, 'Luke Skywalker Blues Boy'),
    ('ig/30_DPeulM_EY4z_0.jpg', .45, 'Londres no braço'),
    ('ig/43_DIWEr3AxmTm_0.jpg', .45, 'Borboleta e flores'),
    ('ig/38_DIkTfe4sXq-_0.jpg', .45, 'Floral na perna'),
]
FOTOS = {  # nome: (arquivo, largura máxima, recorte (l, t, r, b) em fração ou None)
    'barbara-banco': ('ig/08_DbrJArqkTzN_2.jpg', 960, None),
    'barbara-mural': ('ig/23_DY5flGZxcH5_0.jpg', 1000, (0, .05, 1, .92)),
    'barbara-desenho': ('ig/22_DaNzYjsxFZ-_0.jpg', 1080, (.5, 0, 1, 1)),
    'estudio-ouija': ('ig/08_DbrJArqkTzN_5.jpg', 1080, None),
    'estudio-sala': ('ig/08_DbrJArqkTzN_1.jpg', 1080, None),
    'estudio-cadeira': ('ig/08_DbrJArqkTzN_0.jpg', 900, None),
    'decalque': ('ig/09_DbmFXWohTMJ_0.jpg', 720, (0, .12, 1, .88)),
}


def abrir(rel):
    return ImageOps.exif_transpose(Image.open(os.path.join(REF, rel))).convert('RGB')


def recorte45(im, cy):
    if isinstance(cy, tuple):  # (centro x, centro y, fração da largura)
        cx, cy, fw = cy
        w, h = im.size; cw = round(w * fw); ch = round(cw * 1.25)
        x = max(0, min(w - cw, round(cx * w - cw / 2))); y = max(0, min(h - ch, round(cy * h - ch / 2)))
        return im.crop((x, y, x + cw, y + ch))
    w, h = im.size
    if h / w >= 1.25:
        ch = round(w * 1.25); y = round(cy * h - ch / 2); y = max(0, min(h - ch, y))
        return im.crop((0, y, w, y + ch))
    cw = round(h / 1.25); x = (w - cw) // 2
    return im.crop((x, 0, x + cw, h))


def todas():
    for grupo, lista in (('pele', PELE), ('papel', PAPEL), ('disp', DISP), ('fino', FINO)):
        for i, item in enumerate(lista):
            yield grupo, i, item


def folha():
    ims = [(f'{g}{i}', recorte45(abrir(it[0]), it[1])) for g, i, it in todas()]
    W, H, C = 200, 250, 10
    rows = (len(ims) + C - 1) // C
    sh = Image.new('RGB', (C * W, rows * (H + 16)), 'white'); d = ImageDraw.Draw(sh)
    for k, (n, im) in enumerate(ims):
        im = im.resize((W, H)); x, y = (k % C) * W, (k // C) * (H + 16)
        sh.paste(im, (x, y)); d.text((x + 3, y + H + 2), n, fill='black')
    sh.save(os.path.join(REF, 'folha_recortes.jpg'), quality=82)


def salvar(im, base):
    for lw in (640, 1280):
        r = im.resize((lw, round(lw * 1.25)), Image.LANCZOS) if im.width > lw else im
        r.save(os.path.join(OBRAS, f'{base}-{lw}.webp'), 'WEBP', quality=80, method=6)


def main():
    os.makedirs(OBRAS, exist_ok=True); os.makedirs(IMG, exist_ok=True)
    dados = {}
    for g, i, it in todas():
        base = f'{g}-{i + 1:02d}'
        salvar(recorte45(abrir(it[0]), it[1]), base)
        reg = {'id': base, 'leg': it[2]}
        if g == 'disp':
            reg['valor'] = it[3]
        dados.setdefault(g, []).append(reg)
    with open(os.path.join(SITE, 'assets', 'js', 'obras.js'), 'w', encoding='utf-8') as f:
        f.write('/* gerado por tools/processar.py */\nwindow.OBRAS = ' + json.dumps(dados, ensure_ascii=False, indent=1) + ';\n')
    for nome, (rel, lw, box) in FOTOS.items():
        im = abrir(rel)
        if box:
            w, h = im.size; im = im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))
        if im.width > lw:
            im = im.resize((lw, round(lw * im.height / im.width)), Image.LANCZOS)
        im.save(os.path.join(IMG, nome + '.webp'), 'WEBP', quality=80, method=6)
    icones(); og()
    print('ok', sum(len(v) for v in dados.values()), 'obras')


FONTE = os.path.join(REF, 'fontes', 'cg.ttf')  # Cormorant Garamond variável (Google Fonts)
TINTA, OSSO = (11, 10, 11), (232, 228, 220)


def icones():
    """Losango com a agulha no meio: o divisor das artes dela vira o símbolo."""
    for tam, nome in ((32, 'favicon-32.png'), (180, 'apple-touch-icon.png'), (48, 'favicon.ico')):
        S = tam * 4
        im = Image.new('RGB', (S, S), TINTA); d = ImageDraw.Draw(im)
        c, r = S / 2, S * .36
        d.polygon([(c, c - r), (c + r * .58, c), (c, c + r), (c - r * .58, c)], outline=OSSO, width=max(4, S // 26))
        d.line([(c, c - r * 1.2), (c, c + r * .55)], fill=OSSO, width=max(4, S // 30))
        d.ellipse([c - S * .02, c - r * 1.1, c + S * .02, c - r * .98], fill=TINTA)
        im = im.resize((tam, tam), Image.LANCZOS)
        if nome.endswith('.ico'):
            im.save(os.path.join(SITE, nome), sizes=[(16, 16), (32, 32), (48, 48)])
        else:
            im.save(os.path.join(SITE, nome))


def og():
    W, H = 1200, 630
    foto = abrir('ig/22_DaNzYjsxFZ-_0.jpg')
    w, h = foto.size
    x0 = round(w * .56); cw = w - x0; ch = round(cw * H / 620)
    foto = foto.crop((x0, round(h * .06), w, round(h * .06) + ch)).resize((620, H), Image.LANCZOS)
    f = Image.new('RGB', (W, H), TINTA)
    fade = Image.linear_gradient('L').rotate(90, expand=True).resize((620, H)).point(lambda v: min(255, int(v * 2.4)))
    f.paste(foto, (W - 620, 0), fade)
    d = ImageDraw.Draw(f)
    try:
        f1 = ImageFont.truetype(FONTE, 132); f2 = ImageFont.truetype(FONTE, 30)
        f1.set_variation_by_name('Medium'); f2.set_variation_by_name('Medium')
    except OSError:
        f1 = f2 = ImageFont.load_default()
    d.text((70, 190), 'BÁRBARA', font=f1, fill=OSSO)
    d.text((76, 345), 'S O M B R A ,   A R T E   E   I N T E N Ç Ã O', font=f2, fill=(160, 156, 150))
    d.text((76, 480), 'Blackwork autoral  ·  Ipiranga, SP', font=f2, fill=OSSO)
    f.save(os.path.join(SITE, 'og.jpg'), quality=86)


if __name__ == '__main__':
    folha() if '--folha' in sys.argv else main()
