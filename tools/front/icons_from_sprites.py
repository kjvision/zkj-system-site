"""Convert the ZKJ icon + platform-mark sprites into compact JS data.
Geometry is kept exact: polylines -> 'M..L..' stroke paths, 45deg-rotated squares -> diamond paths,
platform glyph groups -> path + translate/scale."""
import re, json, math, sys

SRC = sys.argv[1]  # folder holding the two sprites
OUT = sys.argv[2]

def num(v):
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def parse_symbol(body):
    strokes = {}  # width -> [path]
    fills = []
    glyph = None
    for m in re.finditer(r'<polyline points="([^"]+)"[^>]*stroke-width="([\d.]+)"', body):
        pts = [tuple(map(float, p.split(','))) for p in m.group(1).split()]
        d = 'M' + ' '.join('%s %s' % (num(x), num(y)) if i == 0 else 'L%s %s' % (num(x), num(y)) for i, (x, y) in enumerate(pts))
        if len(pts) > 2 and pts[0] == pts[-1]:
            d = 'M' + ' '.join(('%s %s' % (num(x), num(y)) if i == 0 else 'L%s %s' % (num(x), num(y))) for i, (x, y) in enumerate(pts[:-1])) + 'Z'
        strokes.setdefault(m.group(2), []).append(d)
    for m in re.finditer(r'<rect x="([\d.\-]+)" y="([\d.\-]+)" width="([\d.]+)" height="([\d.]+)"[^>]*?(?:transform="rotate\(([\d.\-]+) ([\d.\-]+) ([\d.\-]+)\)")?\s*/>', body):
        x, y, w, h = map(float, m.group(1, 2, 3, 4))
        cx, cy = x + w / 2, y + h / 2
        if m.group(5) is None:
            fills.append('M%s %sh%sv%sh-%sZ' % (num(x), num(y), num(w), num(h), num(w)))
            continue
        assert abs(float(m.group(5)) - 45) < 1e-6 and abs(w - h) < 1e-9
        assert abs(float(m.group(6)) - cx) < 0.01 and abs(float(m.group(7)) - cy) < 0.01, m.group(0)
        r = w / math.sqrt(2)
        fills.append('M%s %sL%s %sL%s %sL%s %sZ' % (num(cx), num(cy - r), num(cx + r), num(cy), num(cx), num(cy + r), num(cx - r), num(cy)))
    g = re.search(r'<g transform="translate\(([\d.\-]+) ([\d.\-]+)\) scale\(([\d.]+)\)"><path d="([^"]+)"', body)
    if g:
        glyph = [float(g.group(1)), float(g.group(2)), float(g.group(3)), g.group(4)]
    # sanity: every drawable element was consumed
    n_el = len(re.findall(r'<(polyline|rect|path)\b', body))
    n_got = sum(len(v) for v in strokes.values()) + len(fills) + (1 if glyph else 0)
    assert n_el == n_got, (n_el, n_got, body[:200])
    return strokes, ''.join(fills), glyph

def symbols(fn):
    s = open(fn).read()
    return {m.group(1): m.group(2) for m in re.finditer(r'<symbol id="([^"]+)" viewBox="0 0 24 24">(.*?)</symbol>', s, re.S)}

icons = symbols(SRC + '/zkj-icons-sprite.svg')
marks = symbols(SRC + '/zkj-platform-marks-sprite.svg')

def pack(body):
    st, fi, gl = parse_symbol(body)
    assert len(st) <= 1, st
    w, ds = (list(st.items())[0] if st else ('1', []))
    o = {'w': float(w), 's': ''.join(ds), 'f': fi}
    if gl: o['g'] = gl
    return o

ICS, ICR, PMS, PMR = {}, {}, {}, {}
for k, b in icons.items():
    n = k[4:]
    if n.endswith('-s'): ICS[n[:-2]] = pack(b)
    else: ICR[n] = pack(b)
for k, b in marks.items():
    n = k[7:]
    if n.endswith('-s'): PMS[n[:-2]] = pack(b)
    else: PMR[n] = pack(b)
assert set(ICS) == set(ICR) and len(ICS) == 52, (len(ICS), len(ICR))
assert set(PMS) == set(PMR) and len(PMS) == 12

json.dump({'ICS': ICS, 'ICR': ICR, 'PMS': PMS, 'PMR': PMR}, open(OUT, 'w'), separators=(',', ':'))
print('icons', len(ICS), 'marks', len(PMS), 'bytes', len(open(OUT).read()))
