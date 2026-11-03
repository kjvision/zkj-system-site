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

# --- head: live page, no preview-only meta; Arabic spacing ---
rep('HEAD', '<title>ZKJ SYSTEM Cube</title>', '<title>ZKJ SYSTEM</title>\n<meta name="robots" content="noindex">')
rep('HEAD', 'family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap', 'family=Cinzel:wght@500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Inter:wght@400;500;600&display=swap')
rep('HEAD', '<meta name="claude:viewport-fit-sides" content="cover">\n', '')
h = g_parts['HEAD']
cut = h.rindex('</style>')
g_parts['HEAD'] = h[:cut] + ('[dir=rtl] .plate .pn,[dir=rtl] .dt span,[dir=rtl] .hqp .pn,[dir=rtl] .mark p,[dir=rtl] .it.hd .rt b,[dir=rtl] .it.hd .rt small{letter-spacing:0}\n'
    '[dir=rtl] .it .rn.ar{transform:scaleX(-1)}\n'
    '.it.hd .rt b{text-transform:uppercase}\n'
    '[dir=rtl] body,[dir=rtl] .card{font-family:"IBM Plex Sans Arabic","Inter",system-ui,sans-serif}\n') + h[cut:]

open(OUT, 'w', encoding='utf-8').write(g_parts['HEAD'] + g_parts['PRE'] + e + g_parts['POST'] + TAIL)
print('front written', len(open(OUT).read()))
