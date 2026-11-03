"""Build app/front.html (the live cube front of system.zkjverse.com/app) from the approved preview build (build2.py).
Same engine, look and motion; the sample data is replaced by the portal's real model (window.parent.ZFRONT_HOST)."""
import re, sys
import os
HERE = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = os.path.join(HERE, '..', '..', 'app', 'front.html')
src = open(HERE + 'build_preview.py', encoding='utf-8').read()
src = src.replace("open(OUT, 'w', encoding='utf-8').write(HEAD + PRE + e + POST + TAIL)\nprint('written')", '').replace('__file__', repr(HERE + 'build_preview.py'))
g = {}
exec(compile(src, 'build2', 'exec'), g)
HEAD, PRE, POST, TAIL, e = g['HEAD'], g['PRE'], g['POST'], g['TAIL'], g['e']

def rep(name, a, b):
    v = g_parts[name]
    if v.count(a) != 1: sys.exit('front: NOT FOUND x%d in %s: %s' % (v.count(a), name, a[:90]))
    g_parts[name] = v.replace(a, b)
g_parts = {'HEAD': HEAD, 'PRE': PRE, 'POST': POST}

# --- data: the portal's model instead of samples ---
pre = g_parts['PRE']
i = pre.index('var HINTS=')
j = pre.index('var ICONS=')
k = pre.index('var PLATES=')
m = pre.index('\n};\n', pre.index('var SEC={')) + 4
g_parts['PRE'] = (pre[:i] + pre[j:k] +
    'var ZH=null;try{ZH=window.parent!==window&&window.parent.ZFRONT_HOST||null;}catch(x){}\n'
    'if(!ZH){location.replace("./");}\n'
    'var M=ZH?ZH.model():{plates:[],rows:[],sec:{},hints:["","",""],aria:["","",""],labels:{},greet:"",admin:false,lang:"en",dir:"ltr"};\n'
    'document.documentElement.lang=M.lang;document.documentElement.dir=M.dir;\n'
    'var HINTS=M.hints,ARIA=M.aria,PLATES=M.plates,TODAY=M.rows,SEC=M.sec;\n'
    'function go(tok){if(/^sec:/.test(tok)){openSec(tok.slice(4),level===0?0:1);return;}if(ZH)ZH.act(tok);}\n' + pre[m:])

# plates: a token opens a portal screen; no token opens the plate's own section
rep('POST', 'act(b,function(){openSec(L[0],0);});', 'act(b,function(){if(L[3])go(L[3]);else openSec(L[0],0);});')
# page-2 rows: link · portal action · own section
rep('POST', 'var o=r[6]?{k:r[1],v:r[2],icon:r[5],href:r[6]}:{k:r[1],v:r[2],n:r[3],col:r[4],icon:r[5],go:function(){openSec(r[0],1);}};',
    'var o=r[6]?{k:r[1],v:r[2],icon:r[5],href:r[6]}:r[7]?{k:r[1],v:r[2],icon:r[5],go:function(){go(r[7]);}}:{k:r[1],v:r[2],n:r[3],col:r[4],icon:r[5],go:function(){openSec(r[0],1);}};')
rep('POST', 'var DOCKABLE={numbers:1,core:1,reports:1,whatsapp:1};', 'var DOCKABLE={numbers:1,core:1,reports:1,whatsapp:1};')
# section rows can carry an action too
rep('POST', 'return {k:r[0],v:r[1],href:r[2]||null,icon:r[3]||null};', 'return {k:r[0],v:r[1],href:r[2]||null,icon:r[3]||null,go:r[4]?function(){go(r[4]);}:null};')
# HQ plate only for KJ
rep('POST', "hqEl.innerHTML='<span class=\"pi\">'+ICONS.box+'</span><span class=\"pn\">HQ</span>';act(hqEl,function(){openSec(\"hq\",0);});",
    "if(M.admin&&SEC.hq){hqEl.innerHTML='<span class=\"pi\">'+ICONS.box+'</span><span class=\"pn\">'+(M.labels.hq||'HQ')+'</span>';act(hqEl,function(){go(\"c:hq\");});}else{hqEl.style.display=\"none\";}")
# top buttons: the portal's bell, language and sign out
rep('POST', "[].forEach.call(tbar.querySelectorAll(\".tb\"),function(b){var k=b.dataset.s;b.innerHTML=ICONS[k===\"notifications\"?\"bell\":k===\"language\"?\"globe\":\"signout\"]+(k===\"notifications\"?'<i class=\"dot\"></i>':'');act(b,function(){openSec(k,1);});});",
    "[].forEach.call(tbar.querySelectorAll(\".tb\"),function(b){var k=b.dataset.s,tok=k===\"notifications\"?\"bell\":k===\"language\"?\"lang\":\"signout\";b.setAttribute(\"aria-label\",(k===\"notifications\"?M.labels.bell:k===\"language\"?M.labels.lang:M.labels.out)||b.getAttribute(\"aria-label\"));"
    "b.innerHTML=ICONS[k===\"notifications\"?\"bell\":k===\"language\"?\"globe\":\"signout\"]+(k===\"notifications\"&&M.labels.unread?'<i class=\"dot\"></i>':'');act(b,function(){go(tok);});});")
# greeting from the portal; a way home for the portal's cube button
rep('POST', '(function(){var h=new Date().getHours(),g=h<12?"Good morning":h<18?"Good afternoon":"Good evening";document.getElementById("mkp").textContent=g+", KJ · 9 need you";})();',
    'document.getElementById("mkp").textContent=M.greet;\n'
    'window.ZFRONT_FRAME={home:function(){if(level!==0){level=0;if(open)requestToggle();setLabels();}}};\n'
    'document.addEventListener("keydown",function(ev){if(ev.key==="Escape")go("close");});')

# --- KJ, 3 Nov 2026: a Back button on the cube, a faster opening, and no boxes on page 1 ---
# Back: steps out of a section or page 2 the same way a tap on the cube does
rep('POST', 'tbar.querySelectorAll(".tb")', 'tbar.querySelectorAll(".tb[data-s]")')
rep('HEAD', '<div class="tbar" id="tbar"><button class="tb" data-s="notifications" aria-label="Notifications"></button>', '<div class="tbar" id="tbar"><button class="tb tback" id="tback" aria-label="Back"></button><button class="tb" data-s="notifications" aria-label="Notifications"></button>')
rep('POST', 'document.addEventListener("keydown",function(ev){if(ev.key==="Escape")go("close");});',
    'var tback=document.getElementById("tback");tback.innerHTML=\'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" fill="none" stroke="#E6D5A3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>\';tback.setAttribute("aria-label",M.lang==="ar"?"رجوع":"Back");act(tback,function(){if(level!==0)cardTap();});\n'
    'document.addEventListener("keydown",function(ev){if(ev.key==="Escape"&&level!==0)cardTap();});')
# opening: the intro plays at 2.4x (3.2 s -> 1.3 s); a reload in the same visit (brand switch, language) skips it
rep('POST', 'document.getElementById("mkp").textContent=M.greet;', 'document.getElementById("mkp").textContent=M.greet;\ntry{sessionStorage.setItem("zkj-cube-seen","1");}catch(x){}')
e = e.replace('var lastSweep=0,clock=0,last=0,speed=1,', 'var lastSweep=0,clock=(function(){try{return sessionStorage.getItem("zkj-cube-seen")?3.3:0;}catch(x){return 0;}})(),last=0,speed=2.4,', 1)
if 'speed=2.4' not in e: sys.exit('front: intro speed not set')
e = e.replace('var INTRO=3.2,TRANS=1.6;', 'var INTRO=3.2,TRANS=1.1;', 1)

# --- head: live page, no preview-only meta; Arabic spacing ---
rep('HEAD', '<title>ZKJ SYSTEM Cube</title>', '<title>ZKJ SYSTEM</title>\n<meta name="robots" content="noindex">')
rep('HEAD', 'family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap', 'family=Cinzel:wght@500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Inter:wght@400;500;600&display=swap')
rep('HEAD', '<meta name="claude:viewport-fit-sides" content="cover">\n', '')
h = g_parts['HEAD']
cut = h.rindex('</style>')
g_parts['HEAD'] = h[:cut] + ('[dir=rtl] .plate .pn,[dir=rtl] .dt span,[dir=rtl] .hqp .pn,[dir=rtl] .mark p,[dir=rtl] .it.hd .rt b,[dir=rtl] .it.hd .rt small{letter-spacing:0}\n'
    '[dir=rtl] .it .rn.ar{transform:scaleX(-1)}\n'
    '.it.hd .rt b{text-transform:uppercase}\n'
    '[dir=rtl] body,[dir=rtl] .card{font-family:"IBM Plex Sans Arabic","Inter",system-ui,sans-serif}\n'
    '[dir=rtl] .tback svg{transform:scaleX(-1)}\n'
    '[dir=rtl] .plate .pn,[dir=rtl] .plates.slim .plate .pn{font-size:13px;letter-spacing:0}\n'
    '/* page 1 without boxes: each place is a gold medallion on its line, the name under it */\n'
    '.plate,.plates.slim .plate{height:auto;min-width:92px;padding:4px 6px;border:0;border-radius:0;background:none;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible;gap:9px;grid-auto-flow:row}\n'
    '.plate::before{display:none}.plates.on .plate{animation:none}\n'
    '.plate .pi{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(201,168,76,.6);background:radial-gradient(circle at 50% 32%,rgba(230,213,163,.18),rgba(14,14,18,.92) 68%);box-shadow:0 0 0 4px rgba(11,11,15,.85),0 0 0 5px rgba(201,168,76,.16);transition:border-color .2s,box-shadow .2s}\n'
    '.plates.slim .plate .pi{width:40px;height:40px}.plates.slim .plate .pi svg{width:18px;height:18px}\n'
    '.plate .pn,.plates.slim .plate .pn{font-size:10.5px;letter-spacing:.22em;color:var(--gl);font-weight:500}\n'
    '.plate:hover,.plate:focus-visible,.plate.lit{border:0;box-shadow:none}\n'
    '.plate:hover .pi,.plate:focus-visible .pi,.plate.lit .pi{border-color:var(--gl);box-shadow:0 0 0 4px rgba(11,11,15,.85),0 0 0 5px rgba(230,213,163,.35),0 0 26px rgba(201,168,76,.35)}\n') + h[cut:]

open(OUT, 'w', encoding='utf-8').write(g_parts['HEAD'] + g_parts['PRE'] + e + g_parts['POST'] + TAIL)
print('front written', len(open(OUT).read()))
