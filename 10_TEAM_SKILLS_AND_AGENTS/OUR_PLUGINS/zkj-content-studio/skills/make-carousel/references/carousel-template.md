# Carousel HTML template

Build a single self-contained HTML file. Replace `{{...}}` placeholders with identity values and slide copy. Each `.slide` is 1080×1350; html2canvas exports them as PNG at scale 1.

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>{{TITLE}} — ZKJ VERSE</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Noto+Kufi+Arabic:wght@700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<style>
  body { background:#111; margin:0; font-family:"IBM Plex Sans Arabic",sans-serif; }
  .toolbar { position:sticky; top:0; z-index:9; background:#000; color:#fff; padding:14px 24px; display:flex; gap:16px; align-items:center; }
  .toolbar button { background:{{PRIMARY}}; color:{{BG}}; border:none; padding:10px 22px; border-radius:8px; font:inherit; font-weight:700; cursor:pointer; }
  .strip { display:flex; flex-wrap:wrap; gap:32px; padding:32px; justify-content:center; }
  .frame { transform:scale(0.35); transform-origin:top right; width:378px; height:472.5px; }
  .slide { width:1080px; height:1350px; background:{{BG}}; color:{{TEXT}}; position:relative;
           display:flex; flex-direction:column; justify-content:center; padding:90px; box-sizing:border-box; }
  .tag { position:absolute; top:60px; right:90px; color:{{PRIMARY}}; font-weight:600; font-size:30px; letter-spacing:2px; }
  .counter { position:absolute; top:60px; left:90px; color:{{SECONDARY}}; font-size:28px; }
  .handle { position:absolute; bottom:55px; right:90px; color:{{SECONDARY}}; font-size:30px; font-weight:600; }
  h1 { font-family:"Noto Kufi Arabic",sans-serif; font-size:110px; line-height:1.25; margin:0; color:{{PRIMARY}}; }
  h2 { font-family:"Noto Kufi Arabic",sans-serif; font-size:76px; line-height:1.3; margin:0 0 40px; color:{{PRIMARY}}; }
  p  { font-size:44px; line-height:1.7; margin:0; }
  ol { font-size:44px; line-height:2; padding-right:50px; margin:0; }
  .accent { color:{{PRIMARY}}; }
</style>
</head>
<body>
<div class="toolbar">
  <button onclick="downloadAll()">📥 حمّل الكل PNG</button>
  <span>{{TITLE}} — 6 شرائح · 1080×1350</span>
</div>
<div class="strip">
  <!-- repeat per slide, wrapped for preview scaling -->
  <div class="frame"><div class="slide" id="s1">
    <span class="tag">{{NICHE_TAG}}</span><span class="counter">01/06</span>
    <h1>{{HOOK}}</h1>
    <span class="handle">{{HANDLE}}</span>
  </div></div>
  <!-- slides 2–6: use h2 + p, or h2 + ol for the detail slides -->
</div>
<script>
async function downloadAll(){
  for(let i=1;i<=6;i++){
    const el=document.getElementById('s'+i);
    const canvas=await html2canvas(el,{scale:1,width:1080,height:1350});
    const a=document.createElement('a');
    a.download='zkj-slide-0'+i+'.png';
    a.href=canvas.toDataURL('image/png');
    a.click();
    await new Promise(r=>setTimeout(r,400));
  }
}
</script>
</body>
</html>
```

Notes:
- `.frame` scales slides down for on-screen preview; html2canvas captures the inner `.slide` at full 1080×1350.
- Keep the toolbar outside the slides so it never appears in exports.
- Vary slide layouts within the structure: slide 1 huge hook, slides 3–4 numbered lists, slide 5 one centered statement, slide 6 CTA with an arrow `↓` above the handle.
- If a color is missing from the identity, default: primary #F5C518, secondary #9AA0A6, background #0B0B0F, text #FFFFFF.
