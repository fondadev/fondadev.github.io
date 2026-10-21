import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const $ = s => document.querySelector(s);

let gh=''; const hr=n=>{const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
for(let i=0;i<26*7;i++){const v=hr(i);gh+=`<i style="background:${v<.45?'#efe6d8':v<.7?'#d9cdee':v<.88?'#a893d6':'#6b4fa8'}"></i>`}
$('#grassgrid').innerHTML = gh;

// split display words into letters
function splitChars(el){
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) { const f = document.createDocumentFragment(); [...n.textContent].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? '\u00a0' : c; s.setAttribute('aria-hidden','true'); f.appendChild(s); }); n.replaceWith(f); }
    else if (!n.classList.contains('ch')) walk(n);
  });
  walk(el);
}
splitChars($('#heroTitle'));
document.querySelectorAll('.sec-head h2').forEach(h => { h.setAttribute('aria-label', h.textContent); splitChars(h); });

/* ---------------- brush engine (bristle-by-bristle) ---------------- */
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bez(p,t){ const u=1-t; return [u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0], u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]]; }
function noise1(n,k,r){ const a=Array.from({length:k},()=>r()*2-1); return Array.from({length:n},(_,i)=>{const x=i/(n-1)*(k-1),j=Math.floor(x),f=x-j;return a[j]*(1-f)+a[Math.min(j+1,k-1)]*f;}); }
function hex(h){ return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); }
function makeStroke(P, width, colors, o={}){
  const {bristles=140,n=220,taper=[.06,.22],dry=.35,seed=1,thick=[1.6,4.2]} = o;
  const r = rng(seed), pts=[], nrm=[];
  for(let i=0;i<n;i++){ const t=i/(n-1); pts.push(bez(P,t)); }
  for(let i=0;i<n;i++){ const a=pts[Math.max(i-1,0)], b=pts[Math.min(i+1,n-1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const L=Math.hypot(dx,dy)||1; nrm.push([-dy/L, dx/L]); }
  const prof = pts.map((_,i)=>{const t=i/(n-1); return .35+.65*Math.pow(Math.min(t/taper[0],1),.6)*Math.pow(Math.max(Math.min((1-t)/taper[1],1),0),.5);});
  const wob = noise1(n,6,r), cols = colors.map(hex), br=[];
  for(let b=0;b<bristles;b++){
    const ov = r()*2-1, edge=Math.abs(ov);
    let pos = (ov+1)/2*(cols.length-1) + (r()-.5)*.7; pos=Math.max(0,Math.min(cols.length-1,pos));
    const j=Math.floor(pos), f=pos-j, c0=cols[j], c1=cols[Math.min(j+1,cols.length-1)];
    const c = c0.map((v,i)=>Math.max(0,Math.min(255,Math.round(v*(1-f)+c1[i]*f+(r()-.5)*16))));
    const jit = noise1(n,5,r), off = new Float32Array(n);
    for(let i=0;i<n;i++) off[i] = ov*width/2*prof[i]*(1+wob[i]*.06) + jit[i]*1.2;
    let gap=null; if(r() < .3+.4*edge){ const g0=.3+r()*.6; gap=[g0,g0+.02+r()*.06]; }
    br.push({off, color:`rgb(${c})`, th: thick[0]+r()*(thick[1]-thick[0]), start: r()*.04 + Math.pow(edge,3)*r()*.1, end: 1-(r()*dry*Math.pow(edge,1.5)+r()*.03), gap});
  }
  return {pts,nrm,n,br};
}
function drawStroke(ctx, s, prog, alpha=1){
  if(prog<=0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap='round'; ctx.lineJoin='round';
  const N=s.n-1;
  for(const b of s.br){
    const k0=Math.floor(b.start*N), k1=Math.floor(Math.min(b.end,prog)*N); if(k1<=k0) continue;
    ctx.strokeStyle=b.color; ctx.lineWidth=b.th; ctx.beginPath(); let pen=false;
    for(let k=k0;k<=k1;k++){
      const t=k/N; if(b.gap && t>b.gap[0] && t<b.gap[1]){ pen=false; continue; }
      const x=s.pts[k][0]+s.nrm[k][0]*b.off[k], y=s.pts[k][1]+s.nrm[k][1]*b.off[k];
      if(!pen){ ctx.moveTo(x,y); pen=true; } else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.restore();
}
const PAINT = ['#eaa07a','#f4bb94','#6b4fa8','#4a3282','#8a6cc4','#f6ecdc'];
const SOFTV = ['#4a3282','#6b4fa8','#9a82cf','#c7b6e8','#f3ebdd'];
const PEACH = ['#e08e66','#f4bb94','#f7cfae','#f6ecdc','#eaa07a'];

/* ---------------- smooth scroll ---------------- */
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if(!REDUCE && Lenis){
  lenis = new Lenis({ lerp: .09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t=document.querySelector(a.getAttribute('href')); if(!t) return; e.preventDefault(); lenis ? lenis.scrollTo(t) : t.scrollIntoView(); }));

/* ---------------- intro ---------------- */
const intro = $('#intro'), cvs = $('#introCanvas'), ctx = cvs.getContext('2d');
let W, H, DPR, paperPat, strokes;
function sizeIntro(){
  DPR = Math.min(devicePixelRatio||1, 2); W = innerWidth; H = innerHeight;
  cvs.width = W*DPR; cvs.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  const pc = document.createElement('canvas'); pc.width = pc.height = 180; const p = pc.getContext('2d');
  p.fillStyle = '#f8f2e8'; p.fillRect(0,0,180,180);
  const r = rng(7); for(let i=0;i<2600;i++){ p.fillStyle = `rgba(${120+r()*40|0},${100+r()*30|0},${80+r()*20|0},${r()*.07})`; p.fillRect(r()*180, r()*180, 1+r()*1.5, 1+r()*1.5); }
  paperPat = ctx.createPattern(pc, 'repeat');
  const s = Math.min(W,H);
  const catX = W*.12, catY = H*.86, goalX = W*.86, goalY = H*.48;
  const traj = [[catX+s*.06, catY-s*.03],[W*.3, H*.15],[W*.62, H*.12],[goalX-s*.05, goalY]];
  strokes = {
    traj, goalX, goalY, catX, catY, s,
    path: makeStroke(traj, s*.11, PAINT, {bristles:170, taper:[.15,.06], dry:.45, seed:4}),
    cover: [0,1,2,3,4,5].map(i => { const y = H*(-.1 + i*.24); return makeStroke([[-W*.15,y+H*.12],[W*.3,y-H*.05],[W*.7,y+H*.08],[W*1.15,y-H*.04]], H*.34, i%2?PEACH:SOFTV, {bristles:220, n:200, taper:[.02,.02], dry:.1, seed:20+i, thick:[4,9]}); }),
    scrape: [0,1,2,3,4].map(i => { const y = H*(-.05 + i*.27); return makeStroke([[W*1.15,y],[W*.7,y+H*.1],[W*.3,y-H*.08],[-W*.15,y+H*.05]], H*.42, ['#000000','#000000'], {bristles:200, n:200, taper:[.02,.02], dry:.18, seed:40+i, thick:[5,12]}); })
  };
  const catEl = $('#introCat'), cw = catEl.getBoundingClientRect().width || 100;
  catEl.style.left = (catX - cw/2) + 'px'; catEl.style.top = (catY - cw*.58) + 'px';
}
const st = { fly:0, net:0, cover:0, scrape:0, textA:1 };
function drawNet(){
  const {goalX:gx, goalY:gy, s} = strokes, w=s*.2, h=s*.36, bulge = Math.sin(st.net*Math.PI*3)*Math.exp(-st.net*2.2)*s*.05*(st.net>0?1:0);
  ctx.save(); ctx.strokeStyle='rgba(110,98,130,.75)'; ctx.lineWidth=1.5; ctx.lineCap='round';
  const x0=gx-w*.1, y0=gy-h/2, x1=gx+w, y1=gy+h/2;
  ctx.beginPath(); ctx.moveTo(x0,y1+4); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0+h*.08); ctx.lineTo(x1,y1-h*.06); ctx.stroke();
  ctx.globalAlpha=.55;
  for(let i=1;i<6;i++){ const x=x0+(x1-x0)*i/6; ctx.beginPath(); for(let k=0;k<=20;k++){ const yy=y0+(y1-y0)*k/20, d=Math.exp(-Math.pow((yy-gy)/(h*.3),2))*Math.exp(-Math.pow((x-x0-w*.35)/(w*.5),2)); const xx=x+bulge*d; k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} ctx.stroke(); }
  for(let j=1;j<7;j++){ const y=y0+(y1-y0)*j/7; ctx.beginPath(); for(let k=0;k<=20;k++){ const xx=x0+(x1-x0)*k/20, d=Math.exp(-Math.pow((y-gy)/(h*.3),2))*Math.exp(-Math.pow((xx-x0-w*.35)/(w*.5),2)); const X=xx+bulge*d; k?ctx.lineTo(X,y):ctx.moveTo(X,y);} ctx.stroke(); }
  ctx.restore();
}
const ballImg = new Image(); ballImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fffaf2" stroke="#4a3282" stroke-width="2.4"/><path d="M20 11 l8.5 6.2 -3.2 10 h-10.6 l-3.2 -10z" fill="#6b4fa8"/><path d="M20 11 V3 M28.5 17.2 l7.6 -2.4 M25.3 27.2 l4.6 6.2 M14.7 27.2 l-4.6 6.2 M11.5 17.2 l-7.6 -2.4" stroke="#4a3282" stroke-width="2" fill="none"/></svg>');
function renderIntro(){
  ctx.globalCompositeOperation='source-over';
  ctx.clearRect(0,0,W,H); ctx.fillStyle=paperPat; ctx.fillRect(0,0,W,H);
  drawNet();
  drawStroke(ctx, strokes.path, st.fly);
  const bs = strokes.s*.075;
  let bp = bez(strokes.traj, Math.min(st.fly,1));
  if(st.net>0){ bp=[strokes.goalX + strokes.s*.05*Math.min(st.net*3,1), strokes.goalY + strokes.s*.12*Math.min(st.net*1.5,1)]; }
  ctx.save(); ctx.translate(bp[0],bp[1]); ctx.rotate(st.fly*14 + st.net*3); ctx.drawImage(ballImg,-bs/2,-bs/2,bs,bs); ctx.restore();
  strokes.cover.forEach((s,i) => drawStroke(ctx, s, Math.max(0,Math.min(1, st.cover*1.7 - i*.12))));
  if(st.scrape>0){ ctx.globalCompositeOperation='destination-out'; strokes.scrape.forEach((s,i)=>drawStroke(ctx, s, Math.max(0,Math.min(1, st.scrape*1.6 - i*.11)))); ctx.globalCompositeOperation='source-over'; }
}
let introTl = null, introDone = false;
function heroIn(){
  if(REDUCE) return;
  gsap.from('#heroTitle .ch', {yPercent:110, rotate:8, opacity:0, duration:1, ease:'back.out(1.6)', stagger:.045});
  gsap.fromTo('#heroStroke', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)', duration:1.3, ease:'power2.inOut', delay:.35});
  gsap.from('#heroLead, #hint', {y:24, opacity:0, duration:.8, stagger:.12, delay:.6, ease:'power2.out'});
  gsap.from('#heroCat', {y:60, duration:.8, delay:1, ease:'back.out(2)'});
  gsap.from('#bubble', {scale:0, opacity:0, duration:.5, delay:1.5, ease:'back.out(2)', transformOrigin:'80% 100%'});
}
function endIntro(){
  if(introDone) return; introDone = true;
  if(introTl) introTl.kill();
  gsap.to(intro, {opacity:0, duration:.35, onComplete:()=>{ intro.classList.add('done'); }});
  if(lenis) lenis.start();
  document.documentElement.style.overflow='';
  heroIn();
}
function startIntro(){
  if(REDUCE){ intro.classList.add('done'); return; }
  sizeIntro(); addEventListener('resize', ()=>{ if(!introDone){ sizeIntro(); renderIntro(); } });
  if(lenis) lenis.stop(); document.documentElement.style.overflow='hidden';
  const cd = $('#cd'), cat = $('#introCat');
  introTl = gsap.timeline({onUpdate:renderIntro, onComplete:endIntro});
  introTl
    .to({}, {duration:.4})
    .call(()=>cd.textContent='2').to({}, {duration:.4})
    .call(()=>cd.textContent='1').to({}, {duration:.4})
    .call(()=>cd.textContent='0')
    .to(cat, {scaleY:.78, scaleX:1.12, duration:.14, ease:'power2.in'})
    .to(cat, {scaleY:1.08, scaleX:.94, rotate:-6, duration:.12, ease:'power2.out'})
    .to(cat, {scaleY:1, scaleX:1, rotate:0, duration:.3, ease:'elastic.out(1,.4)'})
    .to(st, {fly:1, duration:1.15, ease:'power1.inOut'}, '<-.25')
    .to(st, {net:1, duration:1.1, ease:'none'})
    .call(()=>cd.textContent='GOAL!', null, '<')
    .to('#intro .txt, #intro .count', {opacity:0, duration:.3}, '<.35')
    .to(st, {cover:1, duration:.9, ease:'power2.inOut'}, '<.1')
    .to(cat, {opacity:0, duration:.2}, '<.3')
    .to(st, {scrape:1, duration:1.05, ease:'power2.in'});
  $('#skip').addEventListener('click', endIntro);
  addEventListener('keydown', e => { if(e.key==='Escape') endIntro(); });
  renderIntro();
}

/* ---------------- scroll scenes ---------------- */
function scenes(){
  // match clock + touchline ball
  const hudMin = $('#hudMin'), hudSec = $('#hudSec'), tb = $('#touchBall');
  ScrollTrigger.create({ start:0, end:'max', onUpdate: s => {
    hudMin.textContent = Math.round(s.progress*90) + "'";
    const w = tb.parentElement.clientWidth - 26;
    tb.style.transform = `translateX(${s.progress*w}px) rotate(${s.progress*w*2.2}deg)`;
  }});
  const names = () => document.querySelectorAll('[data-name]').forEach(sec => ScrollTrigger.create({ trigger:sec, start:'top 55%', end:'bottom 55%', onToggle: s => { if(s.isActive) hudSec.textContent = sec.dataset.name; } }));
  if(REDUCE){ names(); return; }

  // hero: the name breaks apart and its violet full stop swallows the screen
  const dot = $('#heroDot');
  const dotScale = () => Math.hypot(innerWidth, innerHeight) * 2.1 / Math.max(dot.offsetWidth, 1);
  gsap.timeline({ scrollTrigger:{ trigger:'#kickoff', start:'top top', end:'+=150%', pin:true, scrub:.8, invalidateOnRefresh:true } })
    .to('#heroLead, #hint, #bubble, #heroCat', {y:-40, opacity:0, duration:.2, stagger:.02}, 0)
    .to('#heroStroke, .hero .arch', {opacity:0, scale:1.25, duration:.35}, 0)
    .to('#row1 .ch:not(.dot)', {x: i => -innerWidth*(.75 - i*.08), rotate:-14, duration:.55, ease:'power2.in', stagger:{each:.03, from:'end'}}, .06)
    .to('#row2 .ch', {y: () => innerHeight*.9, x: i => (i-1)*innerWidth*.12, rotate: i => (i-1)*30, duration:.55, ease:'power2.in', stagger:.03}, .06)
    .to(dot, {scale: dotScale, borderRadius:'50%', backgroundColor:'#3f2a73', duration:.8, ease:'power2.in'}, .18);
  if(FINE){
    const qx = gsap.quickTo('#heroTitle','x',{duration:.9,ease:'power3'}), qy = gsap.quickTo('#heroTitle','y',{duration:.9,ease:'power3'});
    const sx = gsap.quickTo('#heroStroke','x',{duration:1.2,ease:'power3'}), sy = gsap.quickTo('#heroStroke','y',{duration:1.2,ease:'power3'});
    addEventListener('pointermove', e => { const nx = e.clientX/innerWidth-.5, ny = e.clientY/innerHeight-.5; qx(nx*-28); qy(ny*-18); sx(nx*50); sy(ny*30); });
  }

  // player: likes stream past in giant type, the card flips, the motto lights up as you read
  gsap.fromTo('#mq1', {xPercent:0}, {xPercent:-32, ease:'none', scrollTrigger:{trigger:'#player', start:'top bottom', end:'bottom top', scrub:.5}});
  gsap.fromTo('#mq2', {xPercent:-32}, {xPercent:0, ease:'none', scrollTrigger:{trigger:'#player', start:'top bottom', end:'bottom top', scrub:.5}});
  gsap.fromTo('#pface', {rotateY:150, rotate:-14, y:80, opacity:.3}, {rotateY:0, rotate:-2.5, y:0, opacity:1, ease:'power2.out', scrollTrigger:{trigger:'.pcard', start:'top 90%', end:'top 35%', scrub:.6}});
  gsap.fromTo('.pcard .bg', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)', ease:'none', scrollTrigger:{trigger:'.pcard', start:'top 70%', end:'top 30%', scrub:.6}});
  splitChars($('#motto'));
  gsap.fromTo('#motto .ch', {opacity:.15}, {opacity:1, stagger:.05, ease:'none', scrollTrigger:{trigger:'#motto', start:'top 80%', end:'top 40%', scrub:true}});
  gsap.from('.now > *', {y:20, opacity:0, stagger:.08, duration:.6, scrollTrigger:{trigger:'.now', start:'top 90%'}});
  gsap.fromTo('#drip', {scaleY:.12}, {scaleY:1, ease:'none', scrollTrigger:{trigger:'#drip', start:'top bottom', end:'top 20%', scrub:.6}});

  // formation: paint the pitch, then players run into position
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#formStage', start:'top top', end:'+=170%', pin:true, scrub:.7 } });
  tl.fromTo('#grass', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)', duration:1, ease:'none'})
    .from('#pitch .lines', {opacity:0, duration:.3}, '-=.2')
    .from('#players .pl', {top:'108%', left:'50%', opacity:0, scale:.4, duration:1.2, stagger:.08, ease:'power2.out'})
    .fromTo('#pitch .ar', {strokeDashoffset:400, opacity:0}, {strokeDashoffset:0, opacity:1, duration:.8}, '-=.4')
    .from('#pitch .arh', {opacity:0, duration:.2})
    .from('#benchList li', {x:-60, opacity:0, stagger:.1, duration:.5}, 1.2);

  // match log: horizontal away-trip, cards swing toward you as they pass the centre
  const track = $('#mtrack'), cards = gsap.utils.toArray('.mcard');
  const tilt = () => cards.forEach(c => { const r = c.getBoundingClientRect(), k = (r.left + r.width/2)/innerWidth - .5; c.style.transform = `perspective(1000px) rotateY(${k*-34}deg) translateZ(${-Math.abs(k)*160}px)`; });
  const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
  gsap.to(track, { x: () => -dist(), ease:'none', scrollTrigger:{ trigger:'#mlStage', start:'top top', end: () => '+=' + (dist()+innerHeight*.4), pin:true, scrub:.6, invalidateOnRefresh:true,
    onUpdate: s => { $('#mprogBar').style.width = (s.progress*100)+'%'; const w = $('#mprog').clientWidth-26; $('#mprogBall').style.transform = `translateX(${s.progress*w}px) rotate(${s.progress*720}deg)`; tilt(); } } });
  ScrollTrigger.addEventListener('refresh', tilt); gsap.ticker.add(tilt);

  // giant band runs with the scroll
  gsap.fromTo('#band', {xPercent:0}, {xPercent:-38, ease:'none', scrollTrigger:{trigger:'.band', start:'top bottom', end:'bottom top', scrub:.5}});
  const skews = gsap.utils.toArray('.marq .r, #band').map(el => gsap.quickTo(el, 'skewX', {duration:.5, ease:'power3'}));
  if(lenis) lenis.on('scroll', e => { const v = gsap.utils.clamp(-14, 14, (e.velocity||0) * -.5); skews.forEach(f => f(v)); });

  // trophies drop onto the shelf
  gsap.from('.tro svg', {y:-220, rotate:() => gsap.utils.random(-25,25), opacity:0, duration:1.1, ease:'bounce.out', stagger:.15, scrollTrigger:{trigger:'#shelf', start:'top 75%'}});
  gsap.from('.tro .dab', {scale:0, opacity:0, duration:.6, ease:'back.out(2)', stagger:.15, delay:.7, scrollTrigger:{trigger:'#shelf', start:'top 75%'}});
  gsap.from('.tro .eyebrow, .tro h3', {y:16, opacity:0, duration:.6, stagger:.06, delay:.5, scrollTrigger:{trigger:'#shelf', start:'top 75%'}});

  // highlights: cards deal in, then tilt under the pointer
  gsap.from('.hcard', {y:100, rotate:() => gsap.utils.random(-6,6), opacity:0, duration:.9, ease:'power3.out', stagger:.09, scrollTrigger:{trigger:'#hgrid', start:'top 80%'}});
  if(FINE) document.querySelectorAll('.hcard').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); gsap.to(c, {rotationY:((e.clientX-r.left)/r.width-.5)*14, rotationX:-((e.clientY-r.top)/r.height-.5)*14, transformPerspective:800, duration:.4}); });
    c.addEventListener('pointerleave', () => gsap.to(c, {rotationX:0, rotationY:0, duration:.6, ease:'elastic.out(1,.5)'}));
  });

  // post-match: numbers count up, chips pop, github grass fills in
  document.querySelectorAll('.stat b').forEach(b => { const o = {v:0}, to = +b.dataset.to, suf = b.dataset.suf || '';
    gsap.to(o, {v:to, duration:1.8, ease:'power2.out', onUpdate:() => b.textContent = Math.round(o.v) + suf, scrollTrigger:{trigger:'#stats4', start:'top 80%'}}); });
  gsap.from('.stat', {y:60, opacity:0, stagger:.1, duration:.8, ease:'power3.out', scrollTrigger:{trigger:'#stats4', start:'top 85%'}});
  gsap.from('.tech .chip', {scale:0, rotate:() => gsap.utils.random(-20,20), duration:.6, ease:'back.out(2.5)', stagger:.07, scrollTrigger:{trigger:'.tech', start:'top 85%'}});
  gsap.from('#grassgrid i', {scale:0, duration:.4, ease:'back.out(3)', stagger:{each:.004, from:'random'}, scrollTrigger:{trigger:'#grassgrid', start:'top 85%'}});

  // full time: a brush stroke paints itself as you reach the end
  const fc = $('#ftCanvas'), fctx = fc.getContext('2d'); let fs = null, fprog = 0;
  const sizeFt = () => { const r = fc.getBoundingClientRect(), d = Math.min(devicePixelRatio||1,2); fc.width=r.width*d; fc.height=r.height*d; fctx.setTransform(d,0,0,d,0,0);
    const w=r.width, h=r.height, s=Math.min(w,h);
    fs = makeStroke([[w*.12,h*.82],[w*.25,h*.25],[w*.7,h*.12],[w*.9,h*.42]], s*.14, PAINT, {bristles:170, taper:[.12,.08], dry:.45, seed:9}); drawFt(); };
  const drawFt = () => { const r = fc.getBoundingClientRect(); fctx.clearRect(0,0,r.width,r.height); if(fs) drawStroke(fctx, fs, fprog, .35); };
  sizeFt(); ScrollTrigger.addEventListener('refreshInit', sizeFt);
  ScrollTrigger.create({ trigger:'#fulltime', start:'top 80%', end:'bottom bottom', scrub:true, onUpdate: s => { fprog = s.progress; drawFt(); } });
  gsap.from('#fulltime h2, #fulltime .board', {y:40, opacity:0, duration:.9, stagger:.12, ease:'power3.out', scrollTrigger:{trigger:'#fulltime', start:'top 60%'}});
  gsap.from('.links a', {y:60, opacity:0, duration:.8, stagger:.1, ease:'back.out(1.4)', scrollTrigger:{trigger:'.links', start:'top 90%'}});
  if(FINE) document.querySelectorAll('.mag').forEach(a => {
    const qx = gsap.quickTo(a,'x',{duration:.5,ease:'power3'}), qy = gsap.quickTo(a,'y',{duration:.5,ease:'power3'});
    a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); qx((e.clientX-r.left-r.width/2)*.35); qy((e.clientY-r.top-r.height/2)*.35); });
    a.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });

  // headings: letters stand up as they enter (created after the pins so positions include pin spacing)
  gsap.utils.toArray('.sec-head').forEach(h => {
    gsap.fromTo(h.querySelectorAll('h2 .ch'), {yPercent:110, rotateX:-90, opacity:0}, {yPercent:0, rotateX:0, opacity:1, stagger:.05, ease:'power3.out', scrollTrigger:{trigger:h, start:'top 95%', end:'top 50%', scrub:.6}});
    gsap.from(h.querySelector('.eyebrow'), {x:-30, opacity:0, duration:.7, scrollTrigger:{trigger:h, start:'top 88%'}});
  });
  names();
}

/* ---------------- small joys ---------------- */
if(FINE && !REDUCE){
  const cur = $('#cur'); cur.style.display = 'block';
  const cx = gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}), cy = gsap.quickTo(cur,'y',{duration:.35,ease:'power3'}), cr = gsap.quickTo(cur,'rotation',{duration:.5,ease:'power3'});
  let lx = 0, rot = 0;
  addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); rot += (e.clientX - lx) * 1.6; lx = e.clientX; cr(rot); });
  document.querySelectorAll('a,button').forEach(el => { el.addEventListener('pointerenter', () => gsap.to(cur,{scale:1.9,duration:.3})); el.addEventListener('pointerleave', () => gsap.to(cur,{scale:1,duration:.3})); });
}
const lines = ['よろしくにゃ','スクロールしてにゃ','ゴール！','紫が好きにゃ','"goal" って打ってみて'];
let li = 0; $('#heroCat').addEventListener('click', () => { li=(li+1)%lines.length; const b=$('#bubble'); b.textContent=lines[li]; gsap.fromTo(b,{scale:.6},{scale:1,duration:.4,ease:'back.out(3)'}); gsap.fromTo('#heroCat',{y:0},{y:-14,yoyo:true,repeat:1,duration:.15}); });
const sc = $('#splat'), sx = sc.getContext('2d'); let buf='';
addEventListener('keydown', e => { if(e.key.length!==1) return; buf=(buf+e.key.toLowerCase()).slice(-4); if(buf==='goal') splat(); });
function splat(){
  const d=Math.min(devicePixelRatio||1,2); sc.width=innerWidth*d; sc.height=innerHeight*d; sx.setTransform(d,0,0,d,0,0);
  const r=rng(Date.now()&0xffff), dots=Array.from({length:140},()=>({x:innerWidth/2,y:innerHeight/2,vx:(r()-.5)*28,vy:(r()-.5)*28-6,s:3+r()*12,c:PAINT[r()*PAINT.length|0]}));
  const o={t:0}; gsap.to(o,{t:1,duration:1.6,ease:'power1.out',onUpdate:()=>{ sx.clearRect(0,0,innerWidth,innerHeight); sx.globalAlpha=1-o.t*o.t; dots.forEach(p=>{ p.x+=p.vx*(1-o.t); p.y+=p.vy*(1-o.t)+o.t*6; sx.fillStyle=p.c; sx.beginPath(); sx.ellipse(p.x,p.y,p.s,p.s*.8,p.vx,0,7); sx.fill(); }); },onComplete:()=>sx.clearRect(0,0,innerWidth,innerHeight)});
  $('#hudMin').animate([{transform:'scale(1)'},{transform:'scale(1.5)'},{transform:'scale(1)'}],{duration:500});
}

const go = () => { scenes(); startIntro(); ScrollTrigger.refresh(); };
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go));
