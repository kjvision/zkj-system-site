"""Preview build of the cube front (the page KJ approved as an artifact). build_front.py turns it into app/front.html."""
import sys
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'zkj-system', 'index.html')
OUT = os.environ.get('PREVIEW_OUT', os.path.join(HERE, 'preview-cube.html'))
t = open(SRC, encoding='utf-8').read()
a = t.index('/* ================= circuit core ================= */')
b = t.index('requestAnimationFrame(frame);\n})();', a) + len('requestAnimationFrame(frame);')
e = t[a:b]

def rep(old, new, count=1):
    global e
    if e.count(old) != count: sys.exit('NOT FOUND x%d: %s' % (e.count(old), old[:80]))
    e = e.replace(old, new)

rep('var rowEls=[].slice.call(document.querySelectorAll("#rows .it"));', 'var rowEls=[];')
rep('var S=1.22,CY=196,RL=47.04*S,RF=150,CX=W/2;', 'var S=1.5,CY=236,RL=47.04*S,RF=150,CX=W/2,CY2=70,S2=.52;')
rep('function geometry(){\n  CX=W/2;', 'function geometry(){\n  CX=W/2;RF=Math.min(W*.34,H*.20,170);S=RF/95;RL=47.04*S;CY=H*.46;CY2=H*.115;S2=S*.56;mark.style.top=(CY+RF+92)+"px";')
rep('var cy=lerp(CY,70,move),s=lerp(S,.52,move);', 'var cy=lerp(CY,CY2,move),s=lerp(S,S2,move)*(1+.012*Math.sin(t*1.3));')
rep('var fa=1-retract;', 'var fa=0;')
rep('  VDIR.forEach(function(a,k){var v=vtx(CX,CY,RL,a);TRACES.push(build(v,[[a,"end"]],F));\n    var side=k%2?1:-1;TRACES.push(build(v,[[a,14],[a+60*side,24],[a,"end"]],F));});',
    '  MAIN=[];VDIR.forEach(function(a,k){var v=vtx(CX,CY,RL,a),m=build(v,[[a,"end"]],F);MAIN.push(m);TRACES.push(m);\n    if(k===0||k===3){var side=k%2?1:-1;TRACES.push(build(v,[[a,14],[a+60*side,24],[a,"end"]],F));}});')
rep('    pulse(q.p,q.s,1);}', '    pulse(q.p,q.s,1);}\n  if(!open&&retract===0&&t>3.4&&t-lastSweep>5.5){lastSweep=t;for(i=0;i<MAIN.length;i++)spawn(MAIN[i]);}\n  if(!open){for(i=0;i<6;i++){var pl=platesEl.children[i];if(pl)pl.classList.toggle("lit",MAIN[i]&&t-MAIN[i].flash<.6);}}')
rep('var clock=0,last=0,speed=1,', 'var lastSweep=0,clock=0,last=0,speed=1,')
rep('if(!visible||!sheet.hidden)return;', 'if(!visible)return;')
rep('var SPOKES=[],LOGO_HEX=[],TRACES=[],DET=[],DETP=[],SUB=[],ALLDET=[],FRAME=null;', 'var SPOKES=[],LOGO_HEX=[],TRACES=[],MAIN=[],BEAMS=[],FRAME=null,WIN_L=56,WIN_R=56;')
# geometry: beams instead of the two gold buses
i0 = e.index('  var s2=.52,cy2=70,r2=47.04*s2;')
i1 = e.index('  ALLDET=DET.concat(SUB);\n}') + len('  ALLDET=DET.concat(SUB);\n}')
e = e[:i0] + '''  var s2=S2,cy2=CY2,r2=47.04*s2;
  BEAMS=[];
  var BV=vtx(CX,cy2,r2,270),LV=vtx(CX,cy2,r2,210),RV=vtx(CX,cy2,r2,330);
  var live=rowEls.filter(function(el){return !el.classList.contains("hd");}),n=live.length,LW=14+(n-1)*4.4;
  WIN_L=LW+22;WIN_R=LW+22;
  rowEls.forEach(function(el){var y=Math.round(H*(+el.dataset.a)+(+el.dataset.i)*H*(+el.dataset.st));el.dataset.y=y;el.style.top=(y-Math.round((el.offsetHeight||62)/2))+"px";el.style.left=WIN_L+"px";el.style.right=WIN_R+"px";});
  live.forEach(function(el,i){var y=+el.dataset.y,f=(n-i)/(n+1);
    var lane=14+(n-1-i)*4.4,laneR=W-lane;
    var sl=[BV[0]+(LV[0]-BV[0])*f,BV[1]+(LV[1]-BV[1])*f],sr=[BV[0]+(RV[0]-BV[0])*f,BV[1]+(RV[1]-BV[1])*f];
    var pl=mk([sl,[lane,sl[1]+(sl[0]-lane)*.5],[lane,y-12],[lane+12,y],[WIN_L-4,y]]);
    var pr=mk([sr,[laneR,sr[1]+(laneR-sr[0])*.5],[laneR,y-12],[laneR-12,y],[W-WIN_R+4,y]]);
    pl.col=pr.col="#C9A84C";pl.row=pr.row=i;pl.next=clock+i*.45;pr.next=clock+i*.45+.2;BEAMS.push(pl,pr);});
  /* tiles folded under the rows on shorter phones: each gets its own line from the cube */
  var dts=[].slice.call(document.querySelectorAll("#dock .dt")),nd=dts.length;
  dts.forEach(function(el,k){var r=el.getBoundingClientRect(),tx=r.left+r.width/2,ty=r.top,left=k<nd/2,j=left?k:nd-1-k;
    var lane=left?5+j*4:W-5-j*4,s0=left?LV:RV,st=[s0[0]+(left?-1:1),s0[1]],hy=ty-12-j*6;
    var p=mk([st,[lane,st[1]+Math.abs(st[0]-lane)*.5],[lane,hy],[tx,hy],[tx,ty-2]]);p.col="#C9A84C";p.row=n+k;p.next=clock+(n+k)*.45;BEAMS.push(p);});
  placePlates();
}''' + e[i1:]
rep('function traceLine(p,len){', '''function beamLine(p,len,col){ctx.lineJoin="round";ctx.globalAlpha=.26;ctx.strokeStyle=col;ctx.lineWidth=5;stroke(p,0,len);ctx.globalAlpha=1;ctx.lineWidth=1.4;stroke(p,0,len);}
function ring(q,col,flash){ctx.save();ctx.beginPath();ctx.arc(q[0],q[1],3.2,0,6.2832);ctx.fillStyle=flash>0?"#FFF4D6":"#0B0B0F";ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.stroke();ctx.restore();}
function traceLine(p,len){''')
i0 = e.index('  /* detail traces */')
i1 = e.index('  drawLogo(CX,cy,s,bodyA,coreIn);')
e = e[:i0] + '''  /* beams: six lights peel away from the cube, one per row */
  if(grow>0){
    for(i=0;i<BEAMS.length;i++){p=BEAMS[i];g=eOut(clamp((grow-p.row*Math.min(.05,.27/Math.max(1,BEAMS.length/2-1)))/.72));if(g<=0)continue;
      beamLine(p,p.len*g,p.col);
      if(g>.999)ring(p.pts[p.pts.length-1],p.col,Math.max(0,1-(t-p.flash)/.7));}
    if(open){while(rowsOn<rowEls.length&&grow>=.4+rowsOn*.06&&t>=rowT0+rowsOn*.07){rowEls[rowsOn].classList.add("on");rowsOn++;}
      for(i=0;i<BEAMS.length;i++){p=BEAMS[i];var rw=rowEls.filter(function(el){return !el.classList.contains("hd");})[p.row];if(rw&&t-p.flash<.5)rw.classList.add("lit");else if(rw&&!BEAMS.some(function(q){return q.row===p.row&&t-q.flash<.5}))rw.classList.remove("lit");}}
  }

''' + e[i1:]
rep('var active=(!open&&retract===0&&t>3)?TRACES:(open&&grow>=1?DETP:null);', 'var active=(!open&&retract===0&&t>3)?TRACES:(open&&grow>=1?BEAMS:null);')
rep('function setLabels(){hint.textContent=ZL.t(open?"hintOpen":"hintClosed");\n  card.setAttribute("aria-label",ZL.t(open?"cardOpen":"cardClosed"));}\nsetLabels();ZL.on(setLabels);',
    'function setLabels(){hint.textContent=HINTS[level];card.setAttribute("aria-label",ARIA[level]);platesEl.classList.toggle("on",!open&&shown);tbar.classList.toggle("on",level>0);dockEl.classList.toggle("on",level===1&&dockEl.children.length>0);hqEl.classList.toggle("on",level===0&&shown);}\nsetLabels();')
rep('card.addEventListener("click",function(){if(moved){moved=false;return;}requestToggle();});', 'card.addEventListener("pointerup",function(e){if(e.pointerType==="mouse"&&e.button!==0)return;var ok=!!down&&!moved;down=null;moved=false;if(ok)cardTap();});\ncard.addEventListener("click",function(e){e.preventDefault();});')
rep('if(!e.repeat)requestToggle();', 'if(!e.repeat)cardTap();')
rep('if(!shown&&t>2.6){shown=true;mark.classList.add("on");hint.classList.add("on");}', 'if(!shown&&t>2.6){shown=true;mark.classList.add("on");hint.classList.add("on");if(!open){platesEl.classList.add("on");hqEl.classList.add("on");}}')

# ZKJ ICONS v1.0 (brand kit ch. 08), small variant: hairline + ◆ nodes, 24-unit box
_ZI = __import__('json').load(open(os.path.join(HERE, 'zkj-icons.json')))['ICS']
ICON = {k: _ZI[k] for k in ['pay','pkg','plan','acc','terms','priv','appr','inbox','chan','live','num','cal','core','reports','ads','bell','globe','signout','box','drawings','pencil','calendar','control','ring','site']}
for _k in ['meta','tiktok','google','snapchat','x','pinterest','linkedin']: ICON['pm-' + _k] = __import__('json').load(open(os.path.join(HERE, 'zkj-icons.json')))['PMS'][_k]
ICON['whatsapp'] = __import__('json').load(open(os.path.join(HERE, 'zkj-icons.json')))['PMS']['whatsapp']
def svg(k):
    o = ICON[k]; h = '<svg viewBox="0 0 24 24" overflow="visible" aria-hidden="true">'
    if o.get('s'): h += '<path d="%s" fill="none" stroke="currentColor" stroke-width="%g"/>' % (o['s'], o['w'])
    if o.get('f'): h += '<path d="%s" fill="currentColor" stroke="none"/>' % o['f']
    if o.get('g'): h += '<path transform="translate(%g %g) scale(%g)" d="%s" fill="currentColor" stroke="none"/>' % tuple(o['g'])
    return h + '</svg>'

PRE = r'''
var platesEl=document.getElementById("plates"),rowsBox=document.getElementById("rows"),tbar=document.getElementById("tbar"),hqEl=document.getElementById("hqp"),dockEl=document.getElementById("dock");
var level=0,backTo=0,rowT0=0;
var HINTS=["Tap a plate for today's work · tap the cube for your account","Tap a row to open it · tap the cube to return","Tap the cube to go back"];
var ARIA=["ZKJ SYSTEM. Choose a plate for today's work, or press the cube for your account.","Your account. Choose a row, or press the cube to return.","Section details. Press the cube to go back."];
var ICONS=%s;
var PLATES=[["approvals","Approvals","appr"],["inbox","Inbox","inbox"],["adsman","Ads","ads"],["live","Live now","live"],["plan","Plan","plan"],["calendar","Calendar","cal"]];
var TODAY=[
  ["payments","Payments","Invoices and payment method","","#D4AF37","pay"],
  ["package","Package","What your plan includes","","#D4AF37","pkg"],
  ["account","Account","Brand, logo and colours","","#D4AF37","acc"],
  ["terms","Terms","Service terms","","#D4AF37","terms"],
  ["privacy","Privacy","Privacy policy","","#D4AF37","priv"],
  ["channels","Channels","Your linked accounts","","#D4AF37","chan"],
  ["numbers","Numbers","Your results at a glance","","#D4AF37","num"],
  ["core","Core","Your channels as a live sky","","#D4AF37","core"],
  ["reports","Reports","Monthly reports to open","","#D4AF37","reports"],
  ["whatsapp","WhatsApp","Message KJ directly","","#D4AF37","whatsapp","https://wa.me/971541668700"]];
var SEC={
  approvals:{t:"APPROVALS",s:"swipe right to approve · sample",rows:[["Sample post 1","Reel · IG + FB · 18:00"],["Sample post 2","Carousel · IG · tomorrow"],["Sample post 3","Short · YouTube · private first"]]},
  inbox:{t:"INBOX",s:"reply without leaving · sample",rows:[["Instagram","Sample user 1 · reply ready"],["YouTube","Sample user 2 · reply needed"],["X","Sample user 3 · mention"],["TikTok · Pinterest","Open on the platform"]]},
  channels:{t:"CHANNELS",s:"real · 30 Oct",rows:[["ZKJ VERSE","IG FB YT linked · PN waiting"],["KJ VISION","IG FB YT linked · PN waiting"],["ZKJ SYSTEM","IG FB YT X · TT PN waiting"]]},
  live:{t:"LIVE NOW",s:"EP1 · ZKJ SYSTEM · real",rows:[["Instagram","EP1 reel","https://www.instagram.com/reel/DfFmeDliDrr/"],["Facebook","EP1 reel","https://www.facebook.com/reel/1142245671598002/"],["YouTube","EP1 short","https://youtube.com/shorts/GlcmOsTxGYo"],["X","EP1 post","https://x.com/zkjsystem/status/2115894117876269506"],["TikTok","EP1 · in review","https://www.tiktok.com/@zkjsystem/video/7702179682996751622"],["Pinterest","EP1 pin","https://www.pinterest.com/pin/1116400195163604918/"]]},
  numbers:{t:"NUMBERS",s:"last 7 days · sample",rows:[["Followers","12.4k"],["Views","48.2k"],["Reach","31.9k"],["Story views","no data yet"]]},
  calendar:{t:"CALENDAR",s:"next posts · sample",rows:[["Tomorrow 09:00","Sample post · Instagram"],["Friday 10:00","Sample post · YouTube"],["Saturday 18:00","Sample post · X"]]},
  payments:{t:"PAYMENTS",s:"sample",rows:[["Next invoice","1 Dec · amount set by KJ"],["Method","Card on file · sample"],["History","3 invoices · sample"]]},
  package:{t:"PACKAGE",s:"what you have",rows:[["Plan name","set by KJ"],["Posts a month","set by KJ"],["Platforms","Instagram · Facebook · YouTube · X"]]},
  plan:{t:"PLAN",s:"this month · sample",rows:[["Pillars","3 · sample"],["Posts planned","12 · sample"],["Next review","Friday"]]},
  account:{t:"ACCOUNT",s:"settings",rows:[["Brand","logo · colours"],["Back to site","system.zkjverse.com","https://system.zkjverse.com/"]]},
  core:{t:"CORE",s:"live sky · opens the full view",rows:[["Open Core","your clients and channels, live"]]},
  reports:{t:"REPORTS",s:"sample",rows:[["October report","PDF · sample"],["September report","PDF · sample"]]},
  adsman:{t:"ADS",s:"official ads managers",rows:[["Meta","Facebook · Instagram","https://adsmanager.facebook.com/","pm-meta"],["TikTok","Ads Manager","https://ads.tiktok.com/","pm-tiktok"],["Google","Google Ads · YouTube","https://ads.google.com/","pm-google"],["Snapchat","Ads Manager","https://ads.snapchat.com/","pm-snapchat"],["X","X Ads","https://ads.x.com/","pm-x"],["Pinterest","Pinterest Ads","https://ads.pinterest.com/","pm-pinterest"],["LinkedIn","Campaign Manager","https://www.linkedin.com/campaignmanager/","pm-linkedin"]]},
  notifications:{t:"NOTIFICATIONS",s:"sample",rows:[["Post approved","sample · today"],["New comment","sample · today"],["Mark all read","clears the bell"]]},
  language:{t:"LANGUAGE",s:"choose",rows:[["English","current"],["العربية","Arabic"]]},
  signout:{t:"SIGN OUT",s:"end this session",rows:[["Sign out","back to the login page"]]},
  hq:{t:"HQ · ADMIN",s:"only you see this",rows:[["All clients","3 brands on one screen",null,"box"],["Drawings","jobs desk",null,"drawings"],["To-do","changes, drafts, client activity",null,"pencil"],["This week","everything scheduled",null,"calendar"],["Control Center","posts, numbers, notices",null,"control"],["Client workspaces","KJ VISION · ZKJ VERSE · ZKJ SYSTEM",null,"ring"]]},
  terms:{t:"TERMS",s:"system.zkjverse.com/terms",rows:[["Service terms","Open","https://system.zkjverse.com/terms.html"]]},
  privacy:{t:"PRIVACY",s:"system.zkjverse.com/privacy",rows:[["Privacy policy","Open","https://system.zkjverse.com/privacy.html"]]}
};
''' % __import__('json').dumps({k: svg(k) for k in ICON})

POST = r'''
function placePlates(){platesEl.classList.toggle("slim",RF*.5<62);var els=platesEl.children,gap=platesEl.classList.contains("slim")?8:12,pad=8,mw=0,k;for(k=0;k<els.length;k++)els[k].style.width="";for(k=0;k<els.length;k++)mw=Math.max(mw,els[k].offsetWidth);mw=Math.min(mw,Math.floor((W-2*pad-24)/2));for(k=0;k<els.length;k++)els[k].style.width=mw+"px";for(var i=0;i<els.length;i++){var el=els[i],d=D(VDIR[i]),tx=CX+d[0]*RF,ty=CY+d[1]*RF,w=el.offsetWidth||110,h=el.offsetHeight||58,x,y;
    if(i===0){x=CX-w/2;y=ty-gap-h;}else if(i===3){x=CX-w/2;y=ty+gap;}
    else{var right=d[0]>0,up=d[1]<0;x=right?Math.min(W-pad-w,tx+gap*.6):Math.max(pad,tx-gap*.6-w);y=up?ty-gap-h:ty+gap;}
    el.style.left=x+"px";el.style.top=y+"px";el.style.margin="0";}}
function act(el,fn){["pointerdown","pointerup","pointercancel"].forEach(function(k){el.addEventListener(k,function(e){e.stopPropagation();});});el.addEventListener("click",function(e){e.stopPropagation();e.preventDefault();fn();});el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();fn();}});}
PLATES.forEach(function(L){var b=document.createElement("div");b.className="plate";b.setAttribute("role","button");b.tabIndex=0;b.setAttribute("aria-label",L[1]);
  b.innerHTML='<span class="pi">'+ICONS[L[2]]+'</span><span class="pn">'+L[1]+'</span>';act(b,function(){openSec(L[0],0);});platesEl.appendChild(b);});
function fillRows(rows,a,st){
  rowsBox.innerHTML="";dockEl.innerHTML="";var hh=card.clientHeight||window.innerHeight,n=rows.length,res=0;
  if(n>7)a=Math.max(.24,(CY2+118)/hh);
  if(n>7&&((hh-43)-a*hh)/(n-1)<48){var dk=rows.filter(function(o){return o.dk;});rows=rows.filter(function(o){return !o.dk;});n=rows.length;res=84;
    dk.forEach(function(o){var t=document.createElement(o.href?"a":"div");t.className="dt";t.innerHTML=ICONS[o.icon]+"<span>"+o.k+"</span>";
      if(o.href){t.href=o.href;t.target="_blank";t.rel="noopener";t.addEventListener("click",function(e){e.stopPropagation();});["pointerdown","pointerup"].forEach(function(k){t.addEventListener(k,function(e){e.stopPropagation();});});}else{t.setAttribute("role","button");t.tabIndex=0;act(t,o.go);}
      dockEl.appendChild(t);});}
  st=Math.min(st,((hh-43-res)/hh-a)/Math.max(1,n-1));
  var rh=Math.max(30,Math.min(62,Math.floor(st*hh-(st*hh<44?5:8))));rowsBox.style.setProperty("--rh",rh+"px");rowsBox.classList.toggle("cmp",rh<58);rowsBox.classList.toggle("tight",rh<48);
  rows.forEach(function(o,i){
    var el=document.createElement(o.href?"a":"div");el.className="it"+(o.go||o.href?" go":"")+(o.head?" hd":"");el.dataset.a=a;el.dataset.st=st;el.dataset.i=i;el.dataset.col=o.col||"#C9A84C";
    if(o.href){el.href=o.href;el.target="_blank";el.rel="noopener";el.addEventListener("click",function(e){e.stopPropagation();});}
    el.innerHTML=(o.icon?'<span class="ri" style="color:#FFFFFF">'+ICONS[o.icon]+'</span>':'')+'<span class="rt"><b>'+o.k+'</b><small>'+o.v+'</small></span>'+(o.n?'<span class="rn" style="color:'+(o.col||"#E6D5A3")+'">'+o.n+'</span>':(o.href||o.go?'<span class="rn ar">›</span>':''));
    if(o.go){el.setAttribute("role","button");el.tabIndex=0;act(el,o.go);}
    rowsBox.appendChild(el);});
  rowEls=[].slice.call(rowsBox.children);geometry();rowsOn=0;rowT0=clock;clearPulses();}
var DOCKABLE={numbers:1,core:1,reports:1,whatsapp:1};
function todayRows(){return TODAY.map(function(r){var o=r[6]?{k:r[1],v:r[2],icon:r[5],href:r[6]}:{k:r[1],v:r[2],n:r[3],col:r[4],icon:r[5],go:function(){openSec(r[0],1);}};o.dk=!!DOCKABLE[r[0]];return o;});}
function secRows(id){var d=SEC[id];var head={k:d.t,v:d.s,head:true};return [head].concat(d.rows.map(function(r){return {k:r[0],v:r[1],href:r[2]||null,icon:r[3]||null};}));}
function openSec(id,from){backTo=from;level=2;fillRows(secRows(id),.295,.092);if(!open)requestToggle();setLabels();}
hqEl.innerHTML='<span class="pi">'+ICONS.box+'</span><span class="pn">HQ</span>';act(hqEl,function(){openSec("hq",0);});
[].forEach.call(tbar.querySelectorAll(".tb"),function(b){var k=b.dataset.s;b.innerHTML=ICONS[k==="notifications"?"bell":k==="language"?"globe":"signout"]+(k==="notifications"?'<i class="dot"></i>':'');act(b,function(){openSec(k,1);});});
function cardTap(){
  if(level===0){level=1;fillRows(todayRows(),.315,.107);requestToggle();}
  else if(level===2){if(backTo===0){level=0;requestToggle();}else{level=1;fillRows(todayRows(),.315,.107);}}
  else{level=0;requestToggle();}
  setLabels();}
(function(){var h=new Date().getHours(),g=h<12?"Good morning":h<18?"Good afternoon":"Good evening";document.getElementById("mkp").textContent=g+", KJ · 9 need you";})();
'''

HEAD = r'''<title>ZKJ SYSTEM Cube</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<style>
/* The ZKJ SYSTEM business card, made into the portal front page. Page 1: the card opening, six plates for the account. The tap: the cube rises to the centre, the gold traces pull in, six coloured beams peel away. Page 2: today's work, one beam per row. Black, white, gold, sharp corners. */
:root{
  color-scheme:dark;
  --ob:#0B0B0F; --panel:#15151B; --well:#101015;
  --gold:#C9A84C; --gl:#E6D5A3; --gd:#6A5520;
  --sil:#9AA0A6; --mute:#8A9099; --wh:#FFFFFF; --line:#26262F;
  --display:"Cinzel",Georgia,"Times New Roman",serif;
  --body:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;border-radius:0}
html{background:var(--ob);-webkit-text-size-adjust:100%}
html,body{height:100%}
body{background:radial-gradient(ellipse 70% 60% at 50% 40%,#17161A 0%,#0C0C10 62%,var(--ob) 100%) fixed,var(--ob);color:var(--wh);font-family:var(--body);-webkit-font-smoothing:antialiased;overflow:hidden;padding-left:max(0px,env(safe-area-inset-left,0px));padding-right:max(0px,env(safe-area-inset-right,0px));padding-block:0}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
:focus-visible{outline:1px solid var(--gold);outline-offset:3px}
.wrap{width:100%;max-width:480px;margin:0 auto}
.samp{margin:0 calc(-1 * max(16px,env(safe-area-inset-left,0px)));padding:8px 16px;background:#2A2208;color:#F0D27A;font-size:12px;letter-spacing:.04em;text-align:center}
.top{display:flex;justify-content:space-between;align-items:center;padding:16px 0 14px;border-bottom:1px solid var(--line);margin-bottom:14px}
.brand{font-family:var(--display);font-weight:600;letter-spacing:.26em;font-size:12px}
.led{display:inline-block;width:7px;height:7px;border:1px solid var(--gold);transform:rotate(45deg);margin-left:10px;animation:led 2.6s ease-in-out infinite}
@keyframes led{0%,70%,100%{background:transparent;box-shadow:none}80%{background:var(--gold);box-shadow:0 0 8px rgba(201,168,76,.7)}}
.card{position:relative;width:100%;height:100vh;height:100dvh;border:0;touch-action:none;background:transparent;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
.card:focus-visible{outline:1px solid var(--gold);outline-offset:3px}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.layer{position:absolute;inset:0;pointer-events:none}
.mark{position:absolute;left:0;right:0;top:70%;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .7s ease,transform .7s ease}
.mark.on{opacity:1;transform:none}
.mark h1{font-family:var(--display);font-weight:600;font-size:22px;letter-spacing:.32em;padding-left:.32em;line-height:1.2}
.mark p{font-size:11px;letter-spacing:.24em;color:var(--sil);text-transform:uppercase}
.hint{display:none;position:absolute;left:0;right:0;bottom:14px;text-align:center;font-size:9.5px;letter-spacing:.24em;color:var(--mute);text-transform:uppercase;opacity:0;transition:opacity .6s;padding:0 12px}
.hint.on{opacity:1}
.plates{position:absolute;inset:0;pointer-events:none}
.plate{position:absolute;width:auto;min-width:112px;padding:0 16px;height:60px;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 50% 30%,rgba(230,213,163,.16),rgba(230,213,163,.05) 60%,rgba(230,213,163,.02));border:1px solid rgba(201,168,76,.42);box-shadow:inset 0 0 22px rgba(201,168,76,.10),0 0 26px rgba(201,168,76,.10);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:grid;place-content:center;gap:5px;justify-items:center;opacity:0;transition:opacity .6s ease,border-color .25s,box-shadow .25s;pointer-events:none;cursor:pointer}
.plates.on .plate{opacity:1;pointer-events:auto}
.plates.slim .plate{height:42px;border-radius:14px;grid-auto-flow:column;align-items:center;gap:8px;padding:0 12px}
.plates.slim .plate .pi svg{width:18px;height:18px}
.plates.slim .plate .pn{font-size:11px;letter-spacing:.12em}
.plates.on .plate:nth-child(2){transition-delay:.06s}.plates.on .plate:nth-child(3){transition-delay:.12s}.plates.on .plate:nth-child(4){transition-delay:.18s}.plates.on .plate:nth-child(5){transition-delay:.24s}.plates.on .plate:nth-child(6){transition-delay:.3s}
.plate:hover,.plate:focus-visible{border-color:var(--gl);box-shadow:inset 0 0 26px rgba(201,168,76,.18),0 0 34px rgba(201,168,76,.18)}
.plate .pi svg{width:22px;height:22px;color:#FFFFFF;stroke-linejoin:miter;stroke-linecap:butt;display:block}
.plate .pn{white-space:nowrap;font-size:12px;font-weight:500;letter-spacing:.16em;color:var(--wh);text-transform:uppercase;line-height:1}
.plate .pi,.plate .pn{position:relative;z-index:1}
.plate::before{content:"";position:absolute;inset:-40% -60%;background:linear-gradient(115deg,transparent 42%,rgba(255,244,214,.16) 50%,transparent 58%);transform:translateX(-60%);animation:shimmer 7s ease-in-out infinite}
.plate:nth-child(2)::before{animation-delay:1.1s}.plate:nth-child(3)::before{animation-delay:2.3s}.plate:nth-child(4)::before{animation-delay:3.4s}.plate:nth-child(5)::before{animation-delay:4.6s}.plate:nth-child(6)::before{animation-delay:5.7s}
@keyframes shimmer{0%,70%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.plates.on .plate{animation:float 5.2s ease-in-out infinite}
.plates.on .plate:nth-child(2){animation-duration:6.1s;animation-delay:-1s}.plates.on .plate:nth-child(3){animation-duration:5.6s;animation-delay:-2s}.plates.on .plate:nth-child(4){animation-duration:6.4s;animation-delay:-3s}.plates.on .plate:nth-child(5){animation-duration:5.8s;animation-delay:-1.5s}.plates.on .plate:nth-child(6){animation-duration:6.7s;animation-delay:-2.5s}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.plate.lit{border-color:var(--gl);box-shadow:inset 0 0 30px rgba(230,213,163,.28),0 0 40px rgba(201,168,76,.26);transition:border-color .12s,box-shadow .12s}
@media (prefers-reduced-motion:reduce){.plate::before,.plates.on .plate{animation:none}}
.it{position:absolute;left:56px;right:56px;height:62px;padding:0 16px 0 14px;border-radius:16px;background:radial-gradient(ellipse at 50% 30%,rgba(230,213,163,.13),rgba(230,213,163,.045) 60%,rgba(230,213,163,.02));border:1px solid rgba(201,168,76,.38);box-shadow:inset 0 0 22px rgba(201,168,76,.08),0 0 22px rgba(201,168,76,.07);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;gap:12px;opacity:0;transform:scale(.97);transition:opacity .45s ease,transform .5s cubic-bezier(.2,.8,.2,1);pointer-events:none;min-height:44px}
.it.on{opacity:1;transform:none;pointer-events:auto}
.it.lit{border-color:var(--gl);box-shadow:inset 0 0 30px rgba(230,213,163,.26),0 0 36px rgba(201,168,76,.24)}
.it.hd{background:none;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;padding-left:4px}
.it.go{cursor:pointer}
.it .ri{flex:none;width:24px;height:24px}
.it .ri svg{width:24px;height:24px;stroke-linejoin:miter;stroke-linecap:butt;display:block}
.it .rt{flex:1;min-width:0;display:grid;gap:2px}
.it .rt b{font-weight:600;font-size:17px;letter-spacing:.01em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .rt small{font-size:11.5px;color:var(--sil);letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .rn{flex:none;font-family:var(--display);font-weight:600;font-size:23px;letter-spacing:.02em}
.it .rn.ar{font-family:var(--body);font-weight:400;font-size:22px;color:var(--gold)}
.it.hd .rt b{font-family:var(--display);font-weight:600;font-size:19px;letter-spacing:.24em;color:var(--gl)}
.it.hd .rt small{text-transform:uppercase;letter-spacing:.22em;font-size:9.5px}
.it:hover .rt b{color:var(--gl)}
#rows .it{height:var(--rh,62px)}
#rows.cmp .it{border-radius:14px}
#rows.tight .it .rt small{display:none}
#rows.tight .it .rt b{font-size:14.5px}
#rows.tight .it .rn.ar{font-size:18px}
#rows.tight .it.hd .rt small{display:block}
#rows.cmp .it .rt b{font-size:15px}
#rows.cmp .it .rt small{font-size:10.5px}
#rows.cmp .it .ri,#rows.cmp .it .ri svg{width:21px;height:21px}
.hqp{position:absolute;left:50%;top:calc(18px + env(safe-area-inset-top));transform:translateX(-50%);height:40px;padding:0 18px 0 14px;border-radius:20px;display:flex;align-items:center;gap:9px;background:radial-gradient(ellipse at 50% 30%,rgba(230,213,163,.16),rgba(230,213,163,.05) 60%,rgba(230,213,163,.02));border:1px solid rgba(201,168,76,.42);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:opacity .6s ease .36s,border-color .25s;cursor:pointer}
.hqp.on{opacity:1;pointer-events:auto}
.hqp:hover,.hqp:focus-visible{border-color:var(--gl)}
.hqp .pi svg{width:18px;height:18px;color:#FFFFFF;display:block}
.hqp .pn{font-size:12px;font-weight:500;letter-spacing:.24em;color:var(--wh)}
.tbar{position:absolute;left:14px;right:14px;top:calc(14px + env(safe-area-inset-top));display:flex;gap:10px;opacity:0;pointer-events:none;transition:opacity .5s ease}
.tbar.on{opacity:1;pointer-events:auto}
.tsp{flex:1}
.tb{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:#FFFFFF;background:radial-gradient(ellipse at 50% 30%,rgba(230,213,163,.14),rgba(230,213,163,.03));border:1px solid rgba(201,168,76,.38);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);cursor:pointer;padding:0}
.tb:hover,.tb:focus-visible{border-color:var(--gl)}
.tb svg{width:19px;height:19px;display:block}
.tb .dot{position:absolute;top:8px;right:9px;width:7px;height:7px;border-radius:50%;background:#F0806E;box-shadow:0 0 0 2px #0B0B0F}
.dock{position:absolute;left:14px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(4,1fr);gap:8px;opacity:0;pointer-events:none;transition:opacity .5s ease .5s}
.dock.on{opacity:1;pointer-events:auto}
.dt{height:62px;border-radius:14px;display:grid;place-content:center;justify-items:center;gap:5px;color:#FFFFFF;text-decoration:none;background:radial-gradient(ellipse at 50% 30%,rgba(230,213,163,.13),rgba(230,213,163,.03));border:1px solid rgba(201,168,76,.38);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);cursor:pointer}
.dt:hover,.dt:focus-visible{border-color:var(--gl)}
.dt svg{width:20px;height:20px;display:block}
.dt span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--wh)}
.foot{margin-top:14px;font-size:10px;letter-spacing:.2em;color:var(--mute);text-transform:uppercase;text-align:center;line-height:1.7}
</style>
<div class="wrap">
  <div class="card" id="card" role="button" tabindex="0" aria-label="ZKJ SYSTEM portal.">
    <canvas id="cv" aria-hidden="true"></canvas>
    <div class="layer">
      <div class="mark" id="mark"><p id="mkp"></p></div>
      <div class="plates" id="plates"></div>
      <div class="hqp" id="hqp" role="button" tabindex="0" aria-label="HQ, admin"></div>
      <div class="tbar" id="tbar"><button class="tb" data-s="notifications" aria-label="Notifications"></button><span class="tsp"></span><button class="tb" data-s="language" aria-label="Language"></button><button class="tb" data-s="signout" aria-label="Sign out"></button></div>
      <div id="rows"></div>
      <div class="dock" id="dock"></div>
      <div class="hint" id="hint"></div>
    </div>
  </div>
</div>
<script>
(function(){
"use strict";
'''
TAIL = '\n})();\n</script>\n'
open(OUT, 'w', encoding='utf-8').write(HEAD + PRE + e + POST + TAIL)
print('written')
