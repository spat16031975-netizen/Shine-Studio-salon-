(function(){'use strict';
var root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var EXPO='cubic-bezier(.16,1,.3,1)',SOFT='cubic-bezier(.4,0,.2,1)';

/* притяжение основной кнопки */
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  $$('.btn-wrap').forEach(function(w){var b=$('.btn',w);
    w.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),dx=(e.clientX-(r.left+r.width/2))/(r.width/2),dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
      b.style.translate=Math.max(-1,Math.min(1,dx))*8+'px '+Math.max(-1,Math.min(1,dy))*6+'px'});
    w.addEventListener('pointerleave',function(){b.style.translate='0 0'})});
}

/* заголовок: предложения остаются блоками, строки считаем по позиции слов */
var h1=$('.h1'),src=h1?h1.innerHTML:'';
function sentences(html){var box=document.createElement('div');box.innerHTML=html;var out=[];
  function words(n0,em,l){Array.prototype.forEach.call(n0.childNodes,function(n){
    if(n.nodeType===3)(n.textContent||'').split(/\s+/).filter(Boolean).forEach(function(w){l.push({w:w,em:em})});
    else if(n.nodeType===1)words(n,em||n.tagName==='EM',l)})}
  Array.prototype.forEach.call(box.querySelectorAll('.s'),function(p){var l=[];words(p,false,l);out.push(l)});return out}
function split(){if(!h1)return[];var ss=sentences(src);
  h1.innerHTML=ss.map(function(l){return'<span class="s">'+l.map(function(t){return'<span class="w">'+t.w+'</span>'}).join(' ')+'</span>'}).join('');
  var flat=[];ss.forEach(function(l){l.forEach(function(t){flat.push(t)})});
  var lines=[],last=null;$$('.w',h1).forEach(function(el,i){var top=Math.round(el.getBoundingClientRect().top/4);
    if(last===null||Math.abs(top-last)>1){lines.push([]);last=top}lines[lines.length-1].push(flat[i])});
  h1.innerHTML=lines.map(function(l){var h='',o=false;l.forEach(function(t,i){
      if(t.em&&!o){h+='<em>';o=true}if(!t.em&&o){h+='</em>';o=false}h+=(i?' ':'')+t.w});
    if(o)h+='</em>';return'<span class="ln"><span class="ln-i">'+h+'</span></span>'}).join('');
  return $$('.ln-i',h1)}

/* сцена появления */
var n=0,end=0;
function A(el,from,dur,delay,ease){if(!el)return;var to={opacity:1,filter:'blur(0px)'};
  if('translate' in from)to.translate='0 0';if('scale' in from)to.scale='1';
  var a=el.animate([from,to],{duration:dur,delay:delay,easing:ease||EXPO,fill:'both'});a.id='intro:'+(n++);end=Math.max(end,dur+delay);return a}
function settle(){document.getAnimations().forEach(function(a){if(a.id&&a.id.indexOf('intro:')===0)a.cancel()});root.classList.remove('intro')}
function intro(lines){
  if(reduce||!Element.prototype.animate){settle();return}
  root.classList.remove('intro');var Y=function(p){return'0 '+p+'px'};
  A($('.top'),{opacity:0,translate:Y(-10)},600,40,SOFT);
  A($('.badge'),{opacity:0,scale:'.9'},560,180);
  A(h1,{opacity:0},1,0);
  lines.forEach(function(l,i){var a=l.animate([{transform:'translateY(108%)',filter:'blur(6px)'},{transform:'translateY(0)',filter:'blur(0)'}],{duration:850,delay:300+i*110,easing:EXPO,fill:'both'});a.id='intro:'+(n++);end=Math.max(end,300+i*110+850)});
  var t=300+lines.length*110;
  A($('.sub'),{opacity:0,translate:Y(10)},620,t-40);
  A($('.cta-row'),{opacity:0,scale:'.94'},620,t+100);
  A($('.facts'),{opacity:0,translate:Y(8)},600,t+240);
  A($('.arc'),{opacity:0,translate:Y(40)},1000,t-120);
  $$('.card').forEach(function(c,i){A(c,{opacity:0,translate:Y(34)},800,t-40+i*120)});
  A($('.act'),{opacity:0,translate:Y(30)},800,t+80);
  A($('.figure'),{opacity:0,translate:Y(24)},900,t-100);
  $$('.note').forEach(function(x,i){A(x,{opacity:0},700,t+500+i*150,SOFT)});
  $$('.draw').forEach(function(p,i){p.setAttribute('pathLength','1');var a=p.animate([{strokeDasharray:'1',strokeDashoffset:'1'},{strokeDasharray:'1',strokeDashoffset:'0'}],{duration:900,delay:t+400+i*120,easing:SOFT,fill:'backwards'});a.id='intro:'+(n++);end=Math.max(end,t+400+i*120+900)});
  setTimeout(settle,end+150)}

/* живой свет */
var cv=$('#light');
function light(){if(!cv)return;var ctx=cv.getContext('2d'),cs=getComputedStyle(cv);
  var base=cs.getPropertyValue('--lt-base').trim()||'#EEF0E4',warm=cs.getPropertyValue('--lt-warm').trim()||'rgba(214,226,186,.6)',hi=cs.getPropertyValue('--lt-hi').trim()||'rgba(255,255,248,.6)';
  var W,H,run=false,raf=0,vis=true,t0=performance.now(),still=reduce||innerWidth<=820;
  function size(){W=Math.max(40,Math.ceil(innerWidth/8));H=Math.max(40,Math.ceil(innerHeight/8));cv.width=W;cv.height=H;draw(still?0:performance.now()-t0)}
  function band(cx,w,c){var g=ctx.createLinearGradient(cx-w,0,cx+w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(cx-w,-H*2,w*2,H*4)}
  function draw(t){ctx.globalCompositeOperation='source-over';ctx.fillStyle=base;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-.55);var s=t*.00005;
    band(Math.sin(s)*W*.55-W*.05,W*.26,warm);band(Math.sin(s)*W*.55+W*.2,W*.09,hi);band(Math.sin(s*.8+2.1)*W*.6+W*.12,W*.2,warm);band(Math.sin(s*.8+2.1)*W*.6-W*.02,W*.06,hi);ctx.restore()}
  function tick(now){if(!run)return;draw(now-t0);raf=requestAnimationFrame(tick)}
  function start(){if(still||run||!vis||document.hidden)return;run=true;raf=requestAnimationFrame(tick)}
  function stop(){run=false;cancelAnimationFrame(raf)}
  new IntersectionObserver(function(e){vis=e[0].isIntersecting;vis?start():stop()}).observe(cv);
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150)});size();start()}
light();

/* дуга из карточек: перетаскивается, едет справа налево */
var arc=$('.arc');
function carousel(){if(!arc)return;var cards=$$('.cd',arc),N=cards.length;
  var mob=function(){return innerWidth<=820};
  var F,u,P,half,Hb,K=1,off=0,vel=0,drag=false,lx=0,run=false,raf=0,vis=true,last=0,W;
  function geo(){W=arc.clientWidth;K=parseFloat(arc.dataset.k||'1');if(mob()&&arc.dataset.km)K=parseFloat(arc.dataset.km);F=mob()?560:1440;u=W/F;P=(mob()?190:196)*K;half=F/2-14;Hb=arc.clientHeight/u}
  function rp(pts,r){var out='',m=pts.length;for(var i=0;i<m;i++){var a=pts[(i+m-1)%m],b=pts[i],c=pts[(i+1)%m];
      var d1=Math.hypot(a[0]-b[0],a[1]-b[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]);
      var p1=[b[0]+(a[0]-b[0])*r/d1,b[1]+(a[1]-b[1])*r/d1],p2=[b[0]+(c[0]-b[0])*r/d2,b[1]+(c[1]-b[1])*r/d2];
      out+=(i?'L':'M')+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'Q'+b[0].toFixed(1)+' '+b[1].toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)}
    return out+'Z'}
  function render(){var L=N*P;
    cards.forEach(function(el,i){var t=(((i*P+off)%L)+L*1.5)%L-L/2;
      var p=t*(1+.083*Math.pow(t/half,2)),d=Math.min(1.5,Math.abs(p)/half),w=(170+48*d*d)*K;
      if(Math.abs(p)>half+w){el.style.visibility='hidden';return}el.style.visibility='';
      var xl=p-w/2,xr=p+w/2,ql=Math.min(1.4,Math.abs(xl)/half),qr=Math.min(1.4,Math.abs(xr)/half);
      var hl=(280+92*Math.pow(ql,2.6))*K,hr=(280+92*Math.pow(qr,2.6))*K,hm=Math.max(hl,hr),cy=Hb/2-12*d*d*K;
      var left=F/2+xl,top=cy-hm/2;
      el.style.width=w*u+'px';el.style.height=hm*u+'px';
      el.style.transform='translate3d('+(left*u).toFixed(1)+'px,'+(top*u).toFixed(1)+'px,0)';
      var pts=[[0,(hm-hl)/2*u],[w*u,(hm-hr)/2*u],[w*u,(hm+hr)/2*u],[0,(hm+hl)/2*u]];
      el.style.clipPath='path("'+rp(pts,15*u)+'")'})}
  function tick(now){if(!run)return;var dt=Math.min(.05,(now-last)/1000||0);last=now;
    if(!drag){off+=(vel+(reduce?0:-50))*dt;vel*=Math.pow(.05,dt)}render();raf=requestAnimationFrame(tick)}
  function start(){if(run||!vis||document.hidden)return;run=true;last=performance.now();raf=requestAnimationFrame(tick)}
  function stop(){run=false;cancelAnimationFrame(raf)}
  arc.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;vel=0;arc.classList.add('drag');try{arc.setPointerCapture(e.pointerId)}catch(x){}});
  arc.addEventListener('pointermove',function(e){if(!drag)return;var dx=(e.clientX-lx)/u;lx=e.clientX;off+=dx;vel=dx*60*.5+vel*.5});
  function up(){if(!drag)return;drag=false;arc.classList.remove('drag')}
  arc.addEventListener('pointerup',up);arc.addEventListener('pointercancel',up);
  new IntersectionObserver(function(e){vis=e[0].isIntersecting;vis?start():stop()}).observe(arc);
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  addEventListener('resize',function(){geo();render()});
  geo();render();start()}
carousel();

var started=false;function go(){if(started)return;started=true;intro(split())}
var fr=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
Promise.race([fr,new Promise(function(r){setTimeout(r,1200)})]).then(go);
var rz;addEventListener('resize',function(){if(!started)return;clearTimeout(rz);rz=setTimeout(function(){if(!root.classList.contains('intro'))split()},200)});
})();
